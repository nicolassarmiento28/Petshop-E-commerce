import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = req.body
    if (!code) {
      res.status(400).json({ error: 'Código de cupón requerido' })
      return
    }
    const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } })
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ error: 'Cupón no encontrado o inactivo' })
      return
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ error: 'Cupón expirado' })
      return
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      res.status(400).json({ error: 'Cupón agotado' })
      return
    }
    if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
      res.status(400).json({ error: `Compra mínima de $${coupon.minPurchase.toLocaleString('es-CL')}` })
      return
    }
    let discount = coupon.discountType === 'PERCENTAGE'
      ? orderTotal * (coupon.discountValue / 100)
      : coupon.discountValue
    if (discount > orderTotal) discount = orderTotal
    res.json({ valid: true, discount, discountType: coupon.discountType, discountValue: coupon.discountValue, code: coupon.code })
  } catch (error) {
    next(error)
  }
}
