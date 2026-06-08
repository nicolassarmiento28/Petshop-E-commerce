export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'TIMEOUT'

export interface CategoryType {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: number
  children?: CategoryType[]
}

export interface BrandType {
  id: number
  name: string
  slug: string
  logoUrl?: string
}

export interface ProductVariant {
  id: number
  name: string
  slug: string
  price: number
  salePrice?: number
  stock: number
  imageUrl?: string
  sizeLabel: string
}

export interface ProductType {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  salePrice?: number
  stock: number
  imageUrl?: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  sizeGroup?: string
  categoryId: number
  category?: CategoryType
  brandId?: number
  brand?: BrandType
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
}

export interface CartItemType {
  id: number
  name: string
  slug: string
  imageUrl?: string
  unitPrice: number
  quantity: number
}

export interface OrderItemType {
  id: number
  productId: number
  product?: ProductType
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface PaymentType {
  id: number
  orderId: number
  status: PaymentStatus
  tbkToken?: string
  tbkBuyOrder?: string
  tbkAuthCode?: string
  tbkResponseCode?: number
  tbkCardNumber?: string
  tbkAmount?: number
  createdAt: string
  updatedAt: string
}

export interface OrderType {
  id: number
  orderNumber: string
  status: OrderStatus
  total: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress?: string
  items: OrderItemType[]
  payment?: PaymentType
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  brand?: string
  sale?: boolean
  featured?: boolean
  search?: string
  sort?: string
  cursor?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
}

export interface CouponValidation {
  valid: boolean
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  code: string
}

export interface CreateOrderInput {
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress?: string
  items: { productId: number; quantity: number }[]
  couponCode?: string
}
