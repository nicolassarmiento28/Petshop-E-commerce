import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getVetPaymentStatus } from '@/services/vetService'
import { formatCLP, formatDate } from '@/utils/formatters'
import PaymentResultCard from '@/components/payment/PaymentResultCard'

export default function VetAppointmentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const appointmentNumber = searchParams.get('cita') ?? ''

  useEffect(() => {
    if (!appointmentNumber) navigate('/', { replace: true })
  }, [appointmentNumber, navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vetPaymentStatus', appointmentNumber],
    queryFn: () => getVetPaymentStatus(appointmentNumber),
    enabled: Boolean(appointmentNumber),
  })

  if (!appointmentNumber) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-600 dark:text-[#8892a4]">Cargando información de tu cita…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 text-center space-y-4">
          <p className="text-gray-700 dark:text-[#e8eaf0]">No se pudo obtener el estado de tu cita.</p>
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
      <Helmet>
        <title>Cita confirmada | Petshop</title>
      </Helmet>
      <PaymentResultCard
        variant="success"
        title="¡Cita confirmada!"
        identifier={`Cita #${appointmentNumber}`}
        details={[
          { label: 'Servicio', value: data.service.name },
          { label: 'Fecha', value: formatDate(data.date) },
          { label: 'Hora', value: `${data.startTime} - ${data.endTime}` },
          { label: 'Mascota', value: data.petName },
        ]}
        amountLabel="Monto pagado"
        amountValue={formatCLP(data.service.price)}
        primaryAction={{ label: 'Volver al inicio', to: '/' }}
      />
    </div>
  )
}
