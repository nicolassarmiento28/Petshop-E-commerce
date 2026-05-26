import type { Request, Response, NextFunction } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { createTransaction, commitTransaction } from '../services/transbankService'

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.body as { orderId?: number }

    if (!orderId) {
      res.status(400).json({ error: 'Missing orderId' })
      return
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    const existingPayment = await prisma.payment.findUnique({ where: { orderId } })
    if (existingPayment?.status === 'APPROVED') {
      res.status(400).json({ error: 'Order already paid' })
      return
    }

    const buyOrder = `BO-${orderId}-${Date.now()}`
    const sessionId = `SID-${orderId}`

    console.log(`[payment] creating transaction buyOrder=${buyOrder}`)

    const { token, url } = await createTransaction(
      buyOrder,
      sessionId,
      order.total,
      process.env.RETURN_URL!,
    )

    await prisma.payment.upsert({
      where: { orderId },
      update: {
        tbkToken: token,
        tbkBuyOrder: buyOrder,
        tbkSessionId: sessionId,
        tbkAmount: order.total,
        status: 'PENDING',
      },
      create: {
        orderId,
        tbkToken: token,
        tbkBuyOrder: buyOrder,
        tbkSessionId: sessionId,
        tbkAmount: order.total,
        status: 'PENDING',
      },
    })

    res.status(200).json({ token, url })
  } catch (error) {
    next(error)
  }
}

export const paymentReturn = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const failureUrl = `${FRONTEND_URL}/pago/fallido`
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

  const payment = await prisma.payment.findFirst({ where: { tbkToken: tokenWs } })
  if (!payment) {
    res.redirect(failureUrl)
    return
  }

  const order = await prisma.order.findUnique({ where: { id: payment.orderId } })
  if (!order) {
    res.redirect(failureUrl)
    return
  }

  const success = result.response_code === 0

  if (success) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          tbkAuthCode: result.authorization_code,
          tbkResponseCode: result.response_code,
          tbkCardNumber: result.card_detail.card_number,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      }),
    ])
    res.redirect(`${FRONTEND_URL}/pago/exito?order=${order.orderNumber}`)
  } else {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REJECTED', tbkResponseCode: result.response_code },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      }),
    ])
    res.redirect(`${FRONTEND_URL}/pago/fallido?order=${order.orderNumber}`)
  }
}

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orderNumber = req.params['orderNumber'] as string

    const orderWithPayment = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    }) as (Prisma.OrderGetPayload<{ include: { payment: true } }> | null)

    if (!orderWithPayment) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    res.status(200).json({
      orderNumber: orderWithPayment.orderNumber,
      status: orderWithPayment.status,
      total: orderWithPayment.total,
      payment: orderWithPayment.payment
        ? {
            status: orderWithPayment.payment.status,
            tbkAuthCode: orderWithPayment.payment.tbkAuthCode,
            tbkCardNumber: orderWithPayment.payment.tbkCardNumber,
            tbkAmount: orderWithPayment.payment.tbkAmount,
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
}
