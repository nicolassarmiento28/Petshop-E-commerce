import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { getAvailableSlots, parseDateOnly } from '../services/vetAvailabilityService'

export const getServices = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const services = await prisma.vetService.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    res.json(services)
  } catch (error) {
    next(error)
  }
}

export const getAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const dateParam = req.query.date ? String(req.query.date) : undefined
    const serviceIdParam = req.query.serviceId ? Number(req.query.serviceId) : undefined

    if (!dateParam || !serviceIdParam || Number.isNaN(serviceIdParam)) {
      res.status(400).json({ error: 'Missing date or serviceId' })
      return
    }

    const date = parseDateOnly(dateParam)
    if (Number.isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid date' })
      return
    }

    const slots = await getAvailableSlots(date, serviceIdParam)
    res.json({ date: dateParam, serviceId: serviceIdParam, slots })
  } catch (error) {
    next(error)
  }
}

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      serviceId,
      date,
      startTime,
      ownerName,
      ownerEmail,
      ownerPhone,
      petName,
      petType,
      notes,
    } = req.body as {
      serviceId?: number
      date?: string
      startTime?: string
      ownerName?: string
      ownerEmail?: string
      ownerPhone?: string
      petName?: string
      petType?: string
      notes?: string
    }

    if (!serviceId || !date || !startTime || !ownerName || !ownerEmail || !ownerPhone || !petName) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const service = await prisma.vetService.findUnique({ where: { id: Number(serviceId) } })
    if (!service || !service.isActive) {
      res.status(404).json({ error: 'Service not found' })
      return
    }

    const appointmentDate = parseDateOnly(date)
    if (Number.isNaN(appointmentDate.getTime())) {
      res.status(400).json({ error: 'Invalid date' })
      return
    }

    // Re-chequea disponibilidad justo antes de crear para evitar doble booking por condición de carrera
    const availableSlots = await getAvailableSlots(appointmentDate, service.id)
    if (!availableSlots.includes(startTime)) {
      res.status(409).json({ error: 'Slot no longer available' })
      return
    }

    const [h, m] = startTime.split(':').map((n) => parseInt(n, 10))
    const endMinutes = h * 60 + m + service.durationMin
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

    const appointmentNumber = `CITA-${String(Date.now()).slice(-8)}`

    const appointment = await prisma.$transaction(async (tx) => {
      // Re-chequeo dentro de la transacción para cerrar la ventana de condición de carrera
      const conflicting = await tx.appointment.findFirst({
        where: {
          serviceId: service.id,
          date: appointmentDate,
          startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      })
      if (conflicting) {
        throw Object.assign(new Error('Slot no longer available'), { statusCode: 409 })
      }

      return tx.appointment.create({
        data: {
          appointmentNumber,
          serviceId: service.id,
          date: appointmentDate,
          startTime,
          endTime,
          ownerName,
          ownerEmail,
          ownerPhone,
          petName,
          petType,
          notes,
        },
      })
    })

    res.status(201).json({
      appointmentId: appointment.id,
      appointmentNumber: appointment.appointmentNumber,
      total: service.price,
    })
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      res.status((error as Error & { statusCode: number }).statusCode).json({ error: error.message })
      return
    }
    next(error)
  }
}
