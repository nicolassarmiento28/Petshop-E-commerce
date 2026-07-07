import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PaymentResultCard from '@/components/payment/PaymentResultCard'

export default function VetAppointmentFailed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const appointmentNumber = searchParams.get('cita')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
      <Helmet>
        <title>Pago rechazado | Petshop</title>
      </Helmet>
      <PaymentResultCard
        variant="failed"
        title="Pago rechazado"
        message="Tu pago no pudo ser procesado y la cita no quedó confirmada."
        identifier={appointmentNumber ? `Cita #${appointmentNumber}` : undefined}
        primaryAction={{ label: 'Reintentar', onClick: () => navigate('/veterinaria') }}
        secondaryAction={{ label: 'Volver al inicio', to: '/' }}
      />
    </div>
  )
}
