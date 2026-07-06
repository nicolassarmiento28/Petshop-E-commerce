import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Package, CreditCard } from 'lucide-react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import type { CheckoutFormData } from '@/components/checkout/checkoutSchema'
import { useCartStore } from '@/store/cartStore'
import { createOrder } from '@/services/orderService'
import { usePayment } from '@/hooks/usePayment'
import api from '@/services/api'
import type { CouponValidation } from '@/types'

const TEST_CARD = {
  number: '4051 8856 0044 6623',
  expiry: '12/26',
  cvv: '123',
  rut: '11.111.111-1',
  clave: '123',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const totalPrice = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0)
  const payment = usePayment()
  const [ready, setReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isError, setIsError] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  const discountAmount = couponResult?.valid
    ? couponResult.discountType === 'PERCENTAGE'
      ? totalPrice * (couponResult.discountValue / 100)
      : couponResult.discountValue
    : 0
  const finalTotal = Math.max(0, totalPrice - discountAmount)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && items.length === 0) {
      navigate('/carrito')
    }
  }, [ready, items.length, navigate])

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidating(true)
    setCouponError(null)
    setCouponResult(null)
    try {
      const { data } = await api.post<CouponValidation>('/coupons/validate', { code: couponCode.trim(), orderTotal: totalPrice })
      setCouponResult(data)
      if (!data.valid) {
        setCouponError('Cupón no válido')
      }
    } catch {
      setCouponError('Error al validar cupón')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setIsError(false)
    try {
      const { orderId } = await createOrder({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        couponCode: couponResult?.valid ? couponCode.trim() : undefined,
      })
      const { token, url } = await payment.mutateAsync(orderId)
      payment.submitToTransbank(token, url)
    } catch {
      setIsError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-[#8892a4]">Tu carrito está vacío.</p>
        <Link to="/carrito" className="text-blue-600 hover:underline font-medium">
          Volver al carrito
        </Link>
      </div>
    )
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-10">
      <div className="max-w-5xl mx-auto px-4">
        <Helmet>
          <title>Checkout | Petshop</title>
        </Helmet>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#e8eaf0] mb-8">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — form */}
          <div className="flex-1 border border-gray-200 dark:border-dark-border rounded-xl dark:bg-dark-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-[#e8eaf0] mb-6">
              <Package size={20} className="text-blue-600 dark:text-blue-400" />
              Datos del pedido
            </h2>

            {/* Test card info */}
            <div className="rounded-xl border border-amber-200 dark:border-[#453410] bg-amber-50 dark:bg-[#241d0d] p-3 text-xs text-amber-700 dark:text-[#d4a017] space-y-1 mb-5">
              <p className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-400">
                <CreditCard size={14} />
                Datos de tarjeta de prueba
              </p>
              <p>Número: <span className="font-mono">{TEST_CARD.number}</span></p>
              <p>Vencimiento: <span className="font-mono">{TEST_CARD.expiry}</span> · CVV: <span className="font-mono">{TEST_CARD.cvv}</span></p>
              <p>RUT: <span className="font-mono">{TEST_CARD.rut}</span> · Clave: <span className="font-mono">{TEST_CARD.clave}</span></p>
            </div>

            <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            {isError && (
              <p className="text-red-500 text-sm mt-4">
                Hubo un error al procesar tu pedido. Intenta nuevamente.
              </p>
            )}
          </div>

          <OrderSummary
            couponCode={couponCode}
            onCouponCodeChange={(code) => { setCouponCode(code); setCouponResult(null); setCouponError(null) }}
            validating={validating}
            couponResult={couponResult}
            couponError={couponError}
            onValidateCoupon={handleValidateCoupon}
            discountAmount={discountAmount}
            finalTotal={finalTotal}
          />
        </div>
      </div>
    </div>
  )
}
