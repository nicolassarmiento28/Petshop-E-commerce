import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const getSalesByCategory = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      select: {
        subtotal: true,
        product: {
          select: {
            category: {
              select: { name: true },
            },
          },
        },
      },
    })

    const categoryMap = new Map<string, number>()
    for (const item of orderItems) {
      const name = item.product.category.name
      categoryMap.set(name, (categoryMap.get(name) ?? 0) + item.subtotal)
    }

    const totalRevenue = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0)

    const categories = Array.from(categoryMap.entries())
      .map(([name, revenue]) => ({
        name,
        revenue: Math.round(revenue * 100) / 100,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    res.json({ categories })
  } catch (error) {
    next(error)
  }
}

export const getMonthComparison = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfCurrentMonth },
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfPreviousMonth, lt: startOfCurrentMonth },
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        },
        select: { total: true },
      }),
    ])

    const currentRevenue = currentOrders.reduce((s, o) => s + o.total, 0)
    const previousRevenue = previousOrders.reduce((s, o) => s + o.total, 0)

    const revenueChange =
      previousRevenue > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 10000) / 100
        : currentRevenue > 0
          ? 100
          : 0

    const ordersChange =
      previousOrders.length > 0
        ? Math.round(
            ((currentOrders.length - previousOrders.length) / previousOrders.length) * 10000,
          ) / 100
        : currentOrders.length > 0
          ? 100
          : 0

    res.json({
      currentMonth: { revenue: currentRevenue, orders: currentOrders.length },
      previousMonth: { revenue: previousRevenue, orders: previousOrders.length },
      revenueChange,
      ordersChange,
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentOrdersFeed = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    })

    res.json({ orders })
  } catch (error) {
    next(error)
  }
}
