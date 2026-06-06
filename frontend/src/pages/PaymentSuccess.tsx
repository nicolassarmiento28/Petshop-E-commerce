import { useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { getPaymentStatus } from '@/services/paymentService'
import { useCartStore } from '@/store/cartStore'
import { formatCLP } from '@/utils/formatters'

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
      <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-600 dark:text-[#8892a4]">Cargando información del pago…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 text-center space-y-4">
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center">
      <Helmet>
        <title>Pago exitoso | Petshop</title>
      </Helmet>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-5 text-center">
        <CheckCircle size={64} className="text-green-500" />

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
