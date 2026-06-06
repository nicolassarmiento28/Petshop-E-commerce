import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, couponCode } = req.body as {
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      shippingAddress?: string
      items?: Array<{ productId: number; quantity: number }>
      couponCode?: string
    }

    if (!customerName || !customerEmail || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for product: ${item.productId}` })
        return
      }
    }

    let total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      const unitPrice = product.salePrice ?? product.price
      return sum + unitPrice * item.quantity
    }, 0)

    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).toUpperCase() } })
      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            if (!coupon.minPurchase || total >= coupon.minPurchase) {
              discount = coupon.discountType === 'PERCENTAGE'
                ? total * (coupon.discountValue / 100)
                : coupon.discountValue
              if (discount > total) discount = total
            }
          }
        }
      }
    }

    const finalTotal = total - discount
    const orderNumber = 'ORD-' + Date.now()

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          total: finalTotal,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!
              const unitPrice = product.salePrice ?? product.price
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                subtotal: unitPrice * item.quantity,
              }
            }),
          },
        },
      }),
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
      ...(discount > 0
        ? [
            prisma.coupon.update({
              where: { code: String(couponCode).toUpperCase() },
              data: { usedCount: { increment: 1 } },
            }),
          ]
        : []),
    ])

    res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      ...(discount > 0 && { discount, originalTotal: total }),
    })
  } catch (error) {
    next(error)
  }
}

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber as string },
      include: { items: { include: { product: true } }, payment: true },
    })
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    res.json(order)
  } catch (error) {
    next(error)
  }
}
