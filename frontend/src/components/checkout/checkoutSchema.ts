import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customerEmail: z.string().email('Ingresa un correo electrónico válido'),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
