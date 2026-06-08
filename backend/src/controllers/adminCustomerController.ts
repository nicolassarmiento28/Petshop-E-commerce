import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

interface CustomerSummary {
  name: string
  email: string
  phone: string | null
  orderCount: number
  totalSpent: number
  lastOrderDate: Date
}

interface CustomersResponse {
  customers: CustomerSummary[]
  total: number
  page: number
  totalPages: number
}

export const getCustomers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit
    const search = String(req.query.search ?? '')

    const searchParam = `%${search}%`

    const [rows, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT
          "customerEmail",
          (array_agg("customerName" ORDER BY "createdAt" DESC))[1] as "customerName",
          (array_agg("customerPhone" ORDER BY "createdAt" DESC))[1] as "customerPhone",
          COUNT(*)::int as "orderCount",
          SUM("total")::float as "totalSpent",
          MAX("createdAt") as "lastOrderDate"
        FROM "Order"
        WHERE ($1 = '' OR "customerEmail" ILIKE $1 OR "customerName" ILIKE $1)
        GROUP BY "customerEmail"
        ORDER BY "totalSpent" DESC
        OFFSET $2 LIMIT $3`,
        searchParam,
        skip,
        limit,
      ),
      prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT COUNT(*)::int as cnt FROM (
          SELECT "customerEmail"
          FROM "Order"
          WHERE ($1 = '' OR "customerEmail" ILIKE $1 OR "customerName" ILIKE $1)
          GROUP BY "customerEmail"
        ) sub`,
        searchParam,
      ),
    ])

    const customers: CustomerSummary[] = (rows as Array<{
      customerEmail: string
      customerName: string
      customerPhone: string | null
      orderCount: number
      totalSpent: number
      lastOrderDate: Date
    }>).map((row) => ({
      name: row.customerName,
      email: row.customerEmail,
      phone: row.customerPhone ?? null,
      orderCount: row.orderCount,
      totalSpent: row.totalSpent,
      lastOrderDate: row.lastOrderDate,
    }))

    const total = (countResult as Array<{ cnt: number }>)[0]?.cnt ?? 0
    const totalPages = Math.ceil(total / limit)

    const response: CustomersResponse = { customers, total, page, totalPages }
    res.json(response)
  } catch (error) {
    next(error)
  }
}

export const exportCustomersCsv = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT
        (array_agg("customerName" ORDER BY "createdAt" DESC))[1] as "customerName",
        "customerEmail",
        (array_agg("customerPhone" ORDER BY "createdAt" DESC))[1] as "customerPhone",
        COUNT(*)::int as "orderCount",
        SUM("total")::float as "totalSpent",
        MAX("createdAt") as "lastOrderDate"
      FROM "Order"
      GROUP BY "customerEmail"
      ORDER BY "totalSpent" DESC`,
    )

    const escapeCsv = (val: unknown): string => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
      return str
    }

    const bom = '\uFEFF'
    const headers = 'Nombre,Email,Teléfono,Órdenes,Total Gastado,Última Orden'
    const data = (rows as Array<{
      customerName: string
      customerEmail: string
      customerPhone: string | null
      orderCount: number
      totalSpent: number
      lastOrderDate: Date
    }>).map((r) =>
      [
        escapeCsv(r.customerName),
        escapeCsv(r.customerEmail),
        escapeCsv(r.customerPhone ?? ''),
        r.orderCount,
        r.totalSpent,
        r.lastOrderDate.toISOString().slice(0, 10),
      ].join(','),
    )

    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="clientes-${dateStr}.csv"`)
    res.send(bom + headers + '\n' + data.join('\n'))
  } catch (error) {
    next(error)
  }
}

export const exportCustomersXlsx = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ExcelJS = require('exceljs')
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT
        (array_agg("customerName" ORDER BY "createdAt" DESC))[1] as "customerName",
        "customerEmail",
        (array_agg("customerPhone" ORDER BY "createdAt" DESC))[1] as "customerPhone",
        COUNT(*)::int as "orderCount",
        SUM("total")::float as "totalSpent",
        MAX("createdAt") as "lastOrderDate"
      FROM "Order"
      GROUP BY "customerEmail"
      ORDER BY "totalSpent" DESC`,
    )

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Clientes')

    sheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Teléfono', key: 'phone', width: 18 },
      { header: 'Órdenes', key: 'orderCount', width: 10 },
      { header: 'Total Gastado', key: 'totalSpent', width: 16 },
      { header: 'Última Orden', key: 'lastOrderDate', width: 16 },
    ]

    for (const r of rows as Array<{
      customerName: string
      customerEmail: string
      customerPhone: string | null
      orderCount: number
      totalSpent: number
      lastOrderDate: Date
    }>) {
      sheet.addRow({
        name: r.customerName,
        email: r.customerEmail,
        phone: r.customerPhone ?? '',
        orderCount: r.orderCount,
        totalSpent: r.totalSpent,
        lastOrderDate: r.lastOrderDate.toISOString().slice(0, 10),
      })
    }

    sheet.getRow(1).font = { bold: true }

    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="clientes-${dateStr}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}
