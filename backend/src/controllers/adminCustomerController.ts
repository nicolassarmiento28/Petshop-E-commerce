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
