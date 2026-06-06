import type { Response, NextFunction } from 'express'
import { OrderStatus } from '@prisma/client'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

const validOrderStatuses = new Set<string>(Object.values(OrderStatus))

export const getAdminOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit
    const statusParam = req.query.status ? String(req.query.status) : undefined

    const where =
      statusParam && validOrderStatuses.has(statusParam)
        ? { status: statusParam as OrderStatus }
        : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    res.json({ orders, total, page, totalPages })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const { status } = req.body as { status?: unknown }

    if (!status || !validOrderStatuses.has(String(status))) {
      res.status(400).json({ error: 'Invalid or missing status value' })
      return
    }

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}

export const getOrderStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const grouped = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    const stats = Object.fromEntries(grouped.map((s) => [s.status, s._count.id]))
    res.json(stats)
  } catch (error) {
    next(error)
  }
}
