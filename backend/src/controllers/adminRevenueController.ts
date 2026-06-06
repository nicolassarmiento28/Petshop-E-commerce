import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const getRevenue = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const days = Math.min(parseInt(String(_req.query.days ?? '30'), 10) || 30, 90)
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ['PAID', 'DELIVERED', 'SHIPPED'] },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group by day
    const dailyMap = new Map<string, number>()
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10)
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + o.total)
    }

    // Fill missing days with 0
    const result: { date: string; revenue: number }[] = []
    const cursor = new Date(since)
    const today = new Date()
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10)
      result.push({ date: key, revenue: dailyMap.get(key) ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0)

    res.json({ days, daily: result, totalRevenue, orderCount: orders.length })
  } catch (error) {
    next(error)
  }
}
