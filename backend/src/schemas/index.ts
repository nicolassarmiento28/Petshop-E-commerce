import { z } from 'zod'
import { OrderStatus, AppointmentStatus } from '@prisma/client'

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  description: z.string().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  sku: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.number().optional(),
  brandId: z.number().nullable().optional(),
  sizeGroup: z.string().nullable().optional(),
})

export const updateBrandSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().nullable().optional(),
  sku: z.string().nullable().optional(),
})

export const updateCouponSchema = z.object({
  code: z.string().min(3).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().positive().optional(),
  minPurchase: z.number().nullable().optional(),
  maxUses: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export const createVetServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMin: z.number().int().positive(),
  price: z.number().positive(),
})

export const updateVetServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  durationMin: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
})

export const createVetAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
})

export const createVetExceptionSchema = z
  .object({
    date: z.string().min(1),
    type: z.enum(['BLOCKED_FULL_DAY', 'BLOCKED_SLOT', 'EXTRA_SLOT']),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine((data) => data.type === 'BLOCKED_FULL_DAY' || (!!data.startTime && !!data.endTime), {
    message: 'startTime and endTime are required for this type',
  })

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  couponCode: z.string().optional(),
})

export const createPaymentSchema = z.object({
  orderId: z.number().positive(),
})

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().nonnegative(),
})

export const createAppointmentSchema = z.object({
  serviceId: z.number(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(1),
  petName: z.string().min(1),
  petType: z.string().optional(),
  notes: z.string().optional(),
})

export const createVetPaymentSchema = z.object({
  appointmentId: z.number().positive(),
})
