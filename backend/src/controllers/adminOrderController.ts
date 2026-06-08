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

export const exportOrdersCsv = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        shippingAddress: true,
        total: true,
        status: true,
        createdAt: true,
      },
    })

    const escapeCsv = (val: unknown): string => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const bom = '\uFEFF'
    const headers = 'N° Orden,Cliente,Email,Teléfono,Dirección,Total,Estado,Fecha'
    const rows = orders.map((o) =>
      [
        escapeCsv(o.orderNumber),
        escapeCsv(o.customerName),
        escapeCsv(o.customerEmail),
        escapeCsv(o.customerPhone),
        escapeCsv(o.shippingAddress),
        escapeCsv(o.total),
        escapeCsv(o.status),
        escapeCsv(o.createdAt.toISOString()),
      ].join(','),
    )

    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="ordenes-${dateStr}.csv"`)
    res.send(bom + headers + '\n' + rows.join('\n'))
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
    const base = Object.fromEntries(Object.values(OrderStatus).map((s) => [s, 0]))
    const stats = { ...base, ...Object.fromEntries(grouped.map((s) => [s.status, s._count.id])) }
    res.json(stats)
  } catch (error) {
    next(error)
  }
}

export const exportOrdersXlsx = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ExcelJS = require('exceljs')
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Órdenes')

    sheet.columns = [
      { header: 'N° Orden', key: 'orderNumber', width: 20 },
      { header: 'Cliente', key: 'customerName', width: 25 },
      { header: 'Email', key: 'customerEmail', width: 30 },
      { header: 'Teléfono', key: 'customerPhone', width: 15 },
      { header: 'Dirección', key: 'shippingAddress', width: 35 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Productos', key: 'items', width: 60 },
      { header: 'Fecha', key: 'createdAt', width: 20 },
    ]

    const STATUS_LABELS: Record<string, string> = {
      PENDING: 'Pendiente', PAID: 'Pagado', PROCESSING: 'En proceso',
      SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
    }

    for (const o of orders) {
      const itemsStr = o.items
        .map((i) => `${i.product?.name ?? `#${i.productId}`} (SKU: ${i.product?.sku ?? '—'}) × ${i.quantity} = $${i.subtotal}`)
        .join('; ')

      sheet.addRow({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone ?? '',
        shippingAddress: o.shippingAddress ?? '',
        total: o.total,
        status: STATUS_LABELS[o.status] ?? o.status,
        items: itemsStr,
        createdAt: o.createdAt.toISOString(),
      })
    }

    sheet.getRow(1).font = { bold: true }

    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="ordenes-${dateStr}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}
