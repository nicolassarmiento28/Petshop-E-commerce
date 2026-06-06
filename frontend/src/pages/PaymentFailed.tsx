import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { XCircle } from 'lucide-react'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderNumber = searchParams.get('order')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center">
      <Helmet>
        <title>Pago rechazado | Petshop</title>
      </Helmet>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-5 text-center">
        <XCircle size={64} className="text-red-500" />

        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0]" style={{ fontFamily: 'Fraunces, serif' }}>
          Pago rechazado
        </h1>

        <p className="text-gray-500 dark:text-[#8892a4]">Tu pago no pudo ser procesado.</p>

        {orderNumber && (
          <p className="text-sm text-gray-400 dark:text-[#8892a4]">Orden #{orderNumber}</p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Reintentar
          </button>
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-[#e8eaf0] font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
