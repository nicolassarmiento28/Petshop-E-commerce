import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

export const getCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit
    const search = req.query.search ? String(req.query.search) : undefined

    const where = search
      ? { code: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    res.json({ coupons, total, page, totalPages })
  } catch (error) {
    next(error)
  }
}

export const createCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt } =
      req.body as {
        code?: unknown
        discountType?: unknown
        discountValue?: unknown
        minPurchase?: unknown
        maxUses?: unknown
        expiresAt?: unknown
      }

    if (!code || !discountType || discountValue === undefined || discountValue === null) {
      res.status(400).json({ error: 'code, discountType, and discountValue are required' })
      return
    }

    const upperCode = String(code).toUpperCase()

    const existing = await prisma.coupon.findUnique({ where: { code: upperCode } })
    if (existing) {
      res.status(409).json({ error: 'Coupon code already exists' })
      return
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: upperCode,
        discountType: String(discountType),
        discountValue: Number(discountValue),
        minPurchase: minPurchase !== undefined && minPurchase !== null ? Number(minPurchase) : undefined,
        maxUses: maxUses !== undefined && maxUses !== null ? Number(maxUses) : undefined,
        expiresAt: expiresAt !== undefined && expiresAt !== null ? new Date(String(expiresAt)) : undefined,
      },
    })

    res.status(201).json(coupon)
  } catch (error) {
    next(error)
  }
}

export const updateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Coupon not found' })
      return
    }

    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt, isActive } =
      req.body as Record<string, unknown>

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: String(code).toUpperCase() }),
        ...(discountType !== undefined && { discountType: String(discountType) }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minPurchase !== undefined && { minPurchase: minPurchase !== null ? Number(minPurchase) : null }),
        ...(maxUses !== undefined && { maxUses: maxUses !== null ? Number(maxUses) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt !== null ? new Date(String(expiresAt)) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    res.json(coupon)
  } catch (error) {
    next(error)
  }
}

export const deleteCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Coupon not found' })
      return
    }

    await prisma.coupon.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
