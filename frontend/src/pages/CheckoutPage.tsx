import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import type { CheckoutFormData } from '@/components/checkout/checkoutSchema'
import { useCartStore } from '@/store/cartStore'
import { createOrder } from '@/services/orderService'
import { usePayment } from '@/hooks/usePayment'
import { formatCLP } from '@/utils/formatters'

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

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && items.length === 0) {
      navigate('/carrito')
    }
  }, [ready, items.length, navigate])

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#e8eaf0] mb-8">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — form */}
          <div className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0] mb-6">Datos del pedido</h2>

            {/* Test card info */}
            <div className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-xs text-yellow-800 dark:text-yellow-300 space-y-1 mb-5">
              <p className="font-semibold">🧪 Datos de tarjeta de prueba</p>
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

          {/* Right — order summary */}
          <div className="lg:w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0] mb-4">Resumen del pedido</h2>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-[#e8eaf0]">
                  <span className="flex-1 pr-2">
                    {item.name}
                    <span className="text-gray-400 dark:text-[#8892a4]"> × {item.quantity}</span>
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatCLP(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <hr className="border-gray-100 dark:border-[#2a2a2a] mb-4" />
            <div className="flex justify-between font-semibold text-gray-800 dark:text-[#e8eaf0]">
              <span>Total</span>
              <span className="text-blue-600">{formatCLP(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
