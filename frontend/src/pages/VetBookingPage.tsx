import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { PawPrint, Stethoscope, Syringe, HeartHandshake, Scissors, Bone, Check } from 'lucide-react'
import { useVetServices, useCreateAppointment, useVetPayment } from '@/hooks/useVet'
import { TestCardInfo } from '@/components/checkout/TestCardInfo'
import { SlotPicker } from '@/components/vet/SlotPicker'
import { formatCLP } from '@/utils/formatters'
import type { VetServiceType } from '@/types'

const SERVICE_ICONS = [Stethoscope, Syringe, HeartHandshake, Scissors, Bone]

function iconForService(service: VetServiceType, index: number) {
  const name = service.name.toLowerCase()
  if (name.includes('vacuna')) return Syringe
  if (name.includes('cirug') || name.includes('control')) return HeartHandshake
  if (name.includes('peluq') || name.includes('corte')) return Scissors
  return SERVICE_ICONS[index % SERVICE_ICONS.length]
}

const bookingSchema = z.object({
  ownerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ownerEmail: z.string().email('Ingresa un correo electrónico válido'),
  ownerPhone: z.string().min(6, 'Ingresa un teléfono válido'),
  petName: z.string().min(1, 'El nombre de tu mascota es requerido'),
  petType: z.string().optional(),
  notes: z.string().optional(),
})
type BookingFormData = z.infer<typeof bookingSchema>

const inputClass =
  'w-full border border-gray-200 dark:border-[#2a2f3d] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm bg-white dark:bg-[#1a1f2b] text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder-gray-500'

const STEPS = ['Servicio', 'Fecha y hora', 'Datos']

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function VetBookingPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<VetServiceType | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: services, isLoading: loadingServices } = useVetServices()
  const createAppointmentMutation = useCreateAppointment()
  const vetPayment = useVetPayment()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) })

  function selectService(service: VetServiceType) {
    setSelectedService(service)
    setSelectedSlot(null)
    setStep(2)
  }

  function confirmSlot() {
    if (!selectedSlot) return
    setStep(3)
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService || !selectedSlot) return
    setSubmitError(null)
    try {
      const { appointmentId } = await createAppointmentMutation.mutateAsync({
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedSlot,
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        petName: data.petName,
        petType: data.petType || undefined,
        notes: data.notes || undefined,
      })
      const { token, url } = await vetPayment.mutateAsync(appointmentId)
      vetPayment.submitToTransbank(token, url)
    } catch (error) {
      const backendMessage =
        isAxiosError<{ error?: string }>(error) && error.response && error.response.status < 500
          ? error.response.data?.error
          : undefined
      setSubmitError(backendMessage ?? 'Hubo un error al agendar tu hora. Intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-10">
      <Helmet>
        <title>Agenda tu hora | Petshop</title>
      </Helmet>
      <div className={`mx-auto px-4 ${step === 3 ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <div className="flex items-center gap-2 mb-2">
          <PawPrint size={28} className="text-orange-500 shrink-0" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#e8eaf0]">Agenda tu hora</h1>
        </div>
        <p className="text-gray-500 dark:text-[#8892a4] mb-8">
          Reserva una consulta veterinaria para tu mascota en simples pasos.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${
                    active || done ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      done
                        ? 'bg-blue-600 text-white'
                        : active
                          ? 'border-2 border-blue-600'
                          : 'border border-gray-300 dark:border-dark-border'
                    }`}
                  >
                    {done ? <Check size={12} /> : n}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />}
              </div>
            )
          })}
        </div>

        {/* Step 1 — Service */}
        {step === 1 && (
          <div className="max-w-2xl">
            {loadingServices && <p className="text-gray-500 dark:text-[#8892a4]">Cargando servicios…</p>}
            {!loadingServices && services?.length === 0 && (
              <p className="text-gray-500 dark:text-[#8892a4] text-sm">
                No hay servicios configurados por el momento. Vuelve a intentarlo más tarde.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services?.map((service, i) => {
                const Icon = iconForService(service, i)
                const selected = selectedService?.id === service.id
                return (
                  <button
                    key={service.id}
                    onClick={() => selectService(service)}
                    className={`text-left rounded-xl p-4 transition-colors bg-white dark:bg-dark-surface ${
                      selected
                        ? 'border-2 border-blue-600'
                        : 'border border-gray-200 dark:border-dark-border hover:border-blue-600/50'
                    }`}
                  >
                    <Icon size={22} className="text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="font-semibold text-gray-800 dark:text-[#e8eaf0]">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-gray-500 dark:text-[#8892a4] mt-1">{service.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-gray-500 dark:text-[#8892a4]">{service.durationMin} min</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCLP(service.price)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Date & time */}
        {step === 2 && selectedService && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <SlotPicker
                serviceId={selectedService.id}
                date={selectedDate}
                minDate={todayISO()}
                onDateChange={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                slot={selectedSlot}
                onSlotChange={setSelectedSlot}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-[#e8eaf0] font-medium hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={confirmSlot}
                disabled={!selectedSlot}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Owner/pet data */}
        {step === 3 && selectedService && selectedSlot && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 min-w-0 space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 mb-2 text-sm">
              <p className="font-semibold text-gray-800 dark:text-[#e8eaf0]">{selectedService.name}</p>
              <p className="text-gray-500 dark:text-[#8892a4]">
                {selectedDate} · {selectedSlot} · {formatCLP(selectedService.price)}
              </p>
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre completo
              </label>
              <input id="ownerName" type="text" className={inputClass} {...register('ownerName')} />
              {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Correo electrónico
              </label>
              <input id="ownerEmail" type="email" className={inputClass} {...register('ownerEmail')} />
              {errors.ownerEmail && <p className="text-red-500 text-sm mt-1">{errors.ownerEmail.message}</p>}
            </div>

            <div>
              <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teléfono
              </label>
              <input id="ownerPhone" type="tel" className={inputClass} {...register('ownerPhone')} />
              {errors.ownerPhone && <p className="text-red-500 text-sm mt-1">{errors.ownerPhone.message}</p>}
            </div>

            <div>
              <label htmlFor="petName" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre de tu mascota
              </label>
              <input id="petName" type="text" className={inputClass} {...register('petName')} />
              {errors.petName && <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>}
            </div>

            <div>
              <label htmlFor="petType" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Tipo de mascota (opcional)
              </label>
              <select id="petType" className={inputClass} {...register('petType')}>
                <option value="">Selecciona...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Notas (opcional)
              </label>
              <textarea id="notes" rows={3} className={inputClass} {...register('notes')} />
            </div>

            {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-[#e8eaf0] font-medium hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {isSubmitting ? 'Procesando…' : 'Confirmar y pagar'}
              </button>
            </div>
          </form>

          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20">
            <TestCardInfo />
          </aside>
          </div>
        )}
      </div>
    </div>
  )
}
