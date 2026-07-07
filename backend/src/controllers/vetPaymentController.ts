import type { Request, Response, NextFunction } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { createTransaction, commitTransaction } from '../services/transbankService'
import { sendAppointmentConfirmation } from '../services/emailService'
import { logger } from '../utils/logger'

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const createVetPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { appointmentId } = req.body as { appointmentId?: number }

    if (!appointmentId) {
      res.status(400).json({ error: 'Missing appointmentId' })
      return
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    })
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' })
      return
    }

    const existingPayment = await prisma.appointmentPayment.findUnique({ where: { appointmentId } })
    if (existingPayment?.status === 'APPROVED') {
      res.status(400).json({ error: 'Appointment already paid' })
      return
    }

    const buyOrder = `VBO-${appointmentId}-${Date.now()}`
    const sessionId = `VSID-${appointmentId}`
    const amount = appointment.service.price

    const { token, url } = await createTransaction(
      buyOrder,
      sessionId,
      amount,
      process.env.VET_RETURN_URL!,
    )

    await prisma.appointmentPayment.upsert({
      where: { appointmentId },
      update: {
        tbkToken: token,
        tbkBuyOrder: buyOrder,
        tbkSessionId: sessionId,
        tbkAmount: amount,
        status: 'PENDING',
      },
      create: {
        appointmentId,
        tbkToken: token,
        tbkBuyOrder: buyOrder,
        tbkSessionId: sessionId,
        tbkAmount: amount,
        status: 'PENDING',
      },
    })

    res.status(200).json({ token, url })
  } catch (error) {
    next(error)
  }
}

export const vetPaymentReturn = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const failureUrl = `${FRONTEND_URL}/veterinaria/fallido`
  const rawToken = req.query['token_ws']
  const tokenWs = typeof rawToken === 'string' ? rawToken : undefined

  if (!tokenWs) {
    res.redirect(failureUrl)
    return
  }

  let result: Awaited<ReturnType<typeof commitTransaction>>
  try {
    result = await commitTransaction(tokenWs)
  } catch {
    res.redirect(failureUrl)
    return
  }

  const payment = await prisma.appointmentPayment.findFirst({ where: { tbkToken: tokenWs } })
  if (!payment) {
    res.redirect(failureUrl)
    return
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: payment.appointmentId },
    include: { service: true },
  })
  if (!appointment) {
    res.redirect(failureUrl)
    return
  }

  const success = result.response_code === 0

  if (success) {
    await prisma.$transaction([
      prisma.appointmentPayment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          tbkAuthCode: result.authorization_code,
          tbkResponseCode: result.response_code,
          tbkCardNumber: result.card_detail.card_number,
        },
      }),
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMED' },
      }),
    ])

    try {
      await sendAppointmentConfirmation(appointment, appointment.service)
    } catch (error) {
      logger.error('Unexpected error sending appointment confirmation email', error)
    }

    res.redirect(`${FRONTEND_URL}/veterinaria/exito?cita=${appointment.appointmentNumber}`)
  } else {
    await prisma.$transaction([
      prisma.appointmentPayment.update({
        where: { id: payment.id },
        data: { status: 'REJECTED', tbkResponseCode: result.response_code },
      }),
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CANCELLED' },
      }),
    ])
    res.redirect(`${FRONTEND_URL}/veterinaria/fallido?cita=${appointment.appointmentNumber}`)
  }
}

export const getVetPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const appointmentNumber = req.params['appointmentNumber'] as string

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentNumber },
      include: { payment: true, service: true },
    }) as (Prisma.AppointmentGetPayload<{ include: { payment: true; service: true } }> | null)

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' })
      return
    }

    res.status(200).json({
      appointmentNumber: appointment.appointmentNumber,
      status: appointment.status,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      petName: appointment.petName,
      service: { name: appointment.service.name, price: appointment.service.price },
      payment: appointment.payment
        ? {
            status: appointment.payment.status,
            tbkAuthCode: appointment.payment.tbkAuthCode,
            tbkCardNumber: appointment.payment.tbkCardNumber,
            tbkAmount: appointment.payment.tbkAmount,
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
}
