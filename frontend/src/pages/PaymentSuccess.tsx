import { useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { PawPrint } from 'lucide-react'
import { getPaymentStatus } from '@/services/paymentService'
import { useCartStore } from '@/store/cartStore'
import { formatCLP } from '@/utils/formatters'

const CONFETTI = [
  { left: '8%', delay: '0.1s', color: 'text-orange-500' },
  { left: '22%', delay: '0.3s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '36%', delay: '0.2s', color: 'text-orange-500' },
  { left: '52%', delay: '0.5s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '65%', delay: '0.4s', color: 'text-orange-500' },
  { left: '78%', delay: '0.6s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '90%', delay: '0.7s', color: 'text-orange-500' },
]

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderNumber = searchParams.get('order') ?? ''
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!orderNumber) navigate('/', { replace: true })
  }, [orderNumber, navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['paymentStatus', orderNumber],
    queryFn: () => getPaymentStatus(orderNumber),
    enabled: Boolean(orderNumber),
  })

  if (!orderNumber) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-600 dark:text-[#8892a4]">Cargando información del pago…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 text-center space-y-4">
          <p className="text-gray-700 dark:text-[#e8eaf0]">No se pudo obtener el estado del pago.</p>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const lastFour = data.payment?.tbkCardNumber
    ? data.payment.tbkCardNumber.slice(-4)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
      <Helmet>
        <title>Pago exitoso | Petshop</title>
      </Helmet>
      <div className="relative overflow-hidden bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-5 text-center">
        {/* Confetti de huellitas */}
        {CONFETTI.map((c, i) => (
          <PawPrint
            key={i}
            size={14}
            className={`absolute top-0 animate-fall ${c.color}`}
            style={{ left: c.left, animationDelay: c.delay }}
            aria-hidden="true"
          />
        ))}

        {/* Círculo de éxito */}
        <div className="relative w-24 h-24 mt-2 animate-circle-in">
          <div className="w-24 h-24 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5l5 5L20 6"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-check"
              />
            </svg>
          </div>

          {/* Sello de la pata */}
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-orange-500 border-2 border-white dark:border-dark-bg flex items-center justify-center animate-stamp">
            <PawPrint size={18} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0]" style={{ fontFamily: 'Fraunces, serif' }}>
          ¡Pago aprobado!
        </h1>

        <p className="text-gray-500 dark:text-[#8892a4] text-sm">Orden #{orderNumber}</p>

        <p className="text-2xl font-semibold text-gray-800 dark:text-[#e8eaf0]">{formatCLP(data.total)}</p>

        {lastFour && (
          <p className="text-sm text-gray-500 dark:text-[#8892a4]">Tarjeta terminada en {lastFour}</p>
        )}

        {data.payment?.tbkAuthCode && (
          <p className="text-sm text-gray-500 dark:text-[#8892a4]">
            Código de autorización: {data.payment.tbkAuthCode}
          </p>
        )}

        <Link
          to="/"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
