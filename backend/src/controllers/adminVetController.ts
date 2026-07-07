import type { Response, NextFunction } from 'express'
import { AppointmentStatus } from '@prisma/client'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'
import { parseDateOnly } from '../services/vetAvailabilityService'

const validAppointmentStatuses = new Set<string>(Object.values(AppointmentStatus))

// ── VetService CRUD ─────────────────────────────────────────────────────────

export const getVetServices = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const services = await prisma.vetService.findMany({ orderBy: { name: 'asc' } })
    res.json(services)
  } catch (error) {
    next(error)
  }
}

export const createVetService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, description, durationMin, price } = req.body as {
      name?: string
      description?: string
      durationMin?: number
      price?: number
    }

    if (!name || !durationMin || price === undefined) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const service = await prisma.vetService.create({
      data: { name, description, durationMin: Number(durationMin), price: Number(price) },
    })
    res.status(201).json(service)
  } catch (error) {
    next(error)
  }
}

export const updateVetService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const existing = await prisma.vetService.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Service not found' })
      return
    }

    const { name, description, durationMin, price, isActive } = req.body as Record<string, unknown>

    const service = await prisma.vetService.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(description !== undefined && { description: description !== null ? String(description) : null }),
        ...(durationMin !== undefined && { durationMin: Number(durationMin) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(service)
  } catch (error) {
    next(error)
  }
}

export const deleteVetService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const existing = await prisma.vetService.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Service not found' })
      return
    }
    // Soft delete — evita perder historial en citas existentes
    await prisma.vetService.update({ where: { id }, data: { isActive: false } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// ── VetAvailability (horario recurrente) ────────────────────────────────────

export const getVetAvailability = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const availability = await prisma.vetAvailability.findMany({ orderBy: { dayOfWeek: 'asc' } })
    res.json(availability)
  } catch (error) {
    next(error)
  }
}

export const createVetAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body as {
      dayOfWeek?: number
      startTime?: string
      endTime?: string
    }

    if (dayOfWeek === undefined || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ error: 'dayOfWeek must be between 0 and 6' })
      return
    }

    const availability = await prisma.vetAvailability.create({
      data: { dayOfWeek: Number(dayOfWeek), startTime, endTime },
    })
    res.status(201).json(availability)
  } catch (error) {
    next(error)
  }
}

// ── VetException (bloqueos/aperturas puntuales) ─────────────────────────────

export const getVetExceptions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exceptions = await prisma.vetException.findMany({ orderBy: { date: 'asc' } })
    res.json(exceptions)
  } catch (error) {
    next(error)
  }
}

export const createVetException = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { date, type, startTime, endTime, reason } = req.body as {
      date?: string
      type?: string
      startTime?: string
      endTime?: string
      reason?: string
    }

    if (!date || !type) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    if (!['BLOCKED_FULL_DAY', 'BLOCKED_SLOT', 'EXTRA_SLOT'].includes(type)) {
      res.status(400).json({ error: 'Invalid type' })
      return
    }
    if (type !== 'BLOCKED_FULL_DAY' && (!startTime || !endTime)) {
      res.status(400).json({ error: 'startTime and endTime are required for this type' })
      return
    }

    const parsedDate = parseDateOnly(date)
    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date' })
      return
    }

    const exception = await prisma.vetException.create({
      data: { date: parsedDate, type, startTime, endTime, reason },
    })
    res.status(201).json(exception)
  } catch (error) {
    next(error)
  }
}

export const deleteVetException = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const existing = await prisma.vetException.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Exception not found' })
      return
    }
    await prisma.vetException.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// ── Appointments (admin) ─────────────────────────────────────────────────────

export const getAdminAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit
    const statusParam = req.query.status ? String(req.query.status) : undefined
    const dateParam = req.query.date ? String(req.query.date) : undefined

    const where: Record<string, unknown> = {}
    if (statusParam && validAppointmentStatuses.has(statusParam)) {
      where.status = statusParam
    }
    if (dateParam) {
      const parsedDate = parseDateOnly(dateParam)
      if (!Number.isNaN(parsedDate.getTime())) {
        const start = new Date(parsedDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        where.date = { gte: start, lt: end }
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { service: true, payment: true },
      }),
      prisma.appointment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    res.json({ appointments, total, page, totalPages })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const { status } = req.body as { status?: unknown }

    if (!status || !validAppointmentStatuses.has(String(status))) {
      res.status(400).json({ error: 'Invalid or missing status value' })
      return
    }

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Appointment not found' })
      return
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
    })
    res.json(appointment)
  } catch (error) {
    next(error)
  }
}
