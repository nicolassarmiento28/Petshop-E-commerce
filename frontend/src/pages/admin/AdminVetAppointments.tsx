import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { X, CalendarClock } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import VetSubNav from '@/components/admin/VetSubNav'
import { SlotPicker } from '@/components/vet/SlotPicker'
import { formatDate } from '@/utils/formatters'
import {
  useAdminAppointments,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useRescheduleAppointment,
} from '@/hooks/useAdminVet'
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_BADGE_BASE,
} from '@/utils/appointmentStatus'
import type { AppointmentStatus, AppointmentType } from '@/types'

const APPOINTMENT_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

const inputClass =
  'border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]'

const textareaClass =
  'w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Cancel modal ─────────────────────────────────────────────────────────────
interface CancelModalProps {
  appointment: AppointmentType
  onClose: () => void
  onSuccess: () => void
}

const CancelModal = ({ appointment, onClose, onSuccess }: CancelModalProps) => {
  const [reason, setReason] = useState('')
  const mutation = useCancelAppointment()
  const canSubmit = reason.trim().length >= 5

  const handleConfirm = () => {
    if (!canSubmit) return
    mutation.mutate(
      { id: appointment.id, reason: reason.trim() },
      { onSuccess: () => { onSuccess(); onClose() } },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0] mb-1">Cancelar cita</h3>
        <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-4">
          {appointment.appointmentNumber} · {appointment.ownerName} · {appointment.petName}
        </p>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Motivo de la cancelación *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className={textareaClass}
          placeholder="Ej: el cliente solicitó cancelar por indisponibilidad"
        />
        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2">Hubo un error al cancelar la cita. Intenta nuevamente.</p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit || mutation.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reschedule modal ─────────────────────────────────────────────────────────
interface RescheduleModalProps {
  appointment: AppointmentType
  onClose: () => void
  onSuccess: () => void
}

const RescheduleModal = ({ appointment, onClose, onSuccess }: RescheduleModalProps) => {
  const [date, setDate] = useState(todayISO())
  const [slot, setSlot] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const mutation = useRescheduleAppointment()
  const canSubmit = Boolean(date) && Boolean(slot) && reason.trim().length >= 5

  const handleConfirm = () => {
    if (!canSubmit || !slot) return
    mutation.mutate(
      { id: appointment.id, newDate: date, newStartTime: slot, reason: reason.trim() },
      { onSuccess: () => { onSuccess(); onClose() } },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0] mb-1">Reagendar cita</h3>
        <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-4">
          {appointment.appointmentNumber} · {appointment.ownerName} · {appointment.petName} — actualmente{' '}
          {formatDate(appointment.date)} · {appointment.startTime}
        </p>

        <div className="mb-4">
          <SlotPicker
            serviceId={appointment.serviceId}
            date={date}
            minDate={todayISO()}
            onDateChange={(d) => { setDate(d); setSlot(null) }}
            slot={slot}
            onSlotChange={setSlot}
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Motivo del cambio *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className={textareaClass}
          placeholder="Ej: el veterinario no estará disponible en el horario original"
        />
        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2">Hubo un error al reagendar la cita. Intenta nuevamente.</p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit || mutation.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? 'Reagendando…' : 'Confirmar reagendamiento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminVetAppointments() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AppointmentType | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentType | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data, isLoading } = useAdminAppointments({
    page,
    status: statusFilter || undefined,
    date: dateFilter || undefined,
  })
  const updateStatusMutation = useUpdateAppointmentStatus()

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value)
    setPage(1)
  }

  function showSuccess(message: string) {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 4000)
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Veterinaria | Petshop</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-2">Veterinaria</h1>
      <VetSubNav />

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 dark:border-[#164028] bg-green-50 dark:bg-[#0f2b1a] text-green-800 dark:text-green-400 text-sm px-4 py-2">
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          className="border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]"
        >
          <option value="">Todos los estados</option>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
          className="border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]"
        />
        {dateFilter && (
          <button
            onClick={() => handleFilterChange(setDateFilter, '')}
            className="text-xs text-gray-500 dark:text-[#8892a4] hover:underline"
          >
            Limpiar fecha
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-dark-surface-elevated text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">N° Cita</th>
                    <th className="px-4 py-3 text-left">Dueño</th>
                    <th className="px-4 py-3 text-left">Mascota</th>
                    <th className="px-4 py-3 text-left">Servicio</th>
                    <th className="px-4 py-3 text-left">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Cambiar estado</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                    <th className="px-4 py-3 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {data?.appointments.map((appt) => {
                    const canModify = appt.status === 'PENDING' || appt.status === 'CONFIRMED'
                    return (
                    <Fragment key={appt.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface-elevated">
                        <td className="px-4 py-3 font-mono text-gray-700 dark:text-[#e8eaf0]">{appt.appointmentNumber}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-[#e8eaf0]">{appt.ownerName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{appt.petName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{appt.service?.name}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">
                          {formatDate(appt.date)} · {appt.startTime}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`${APPOINTMENT_STATUS_BADGE_BASE} ${APPOINTMENT_STATUS_BADGE_CLASSES[appt.status]}`}>
                            {APPOINTMENT_STATUS_LABELS[appt.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            defaultValue={appt.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({ id: appt.id, status: e.target.value as AppointmentStatus })
                            }
                            className={inputClass}
                          >
                            {APPOINTMENT_STATUSES.map((s) => (
                              <option key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {canModify && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setRescheduleTarget(appt)}
                                title="Reagendar"
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              >
                                <CalendarClock size={16} />
                              </button>
                              <button
                                onClick={() => setCancelTarget(appt)}
                                title="Cancelar"
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                            className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                          >
                            {expandedId === appt.id ? 'Ocultar' : 'Ver más'}
                          </button>
                        </td>
                      </tr>
                      {expandedId === appt.id && (
                        <tr key={`${appt.id}-detail`} className="bg-blue-50 dark:bg-dark-surface">
                          <td colSpan={9} className="px-8 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-[#8892a4] uppercase mb-1">Contacto</p>
                                <p className="text-gray-700 dark:text-[#e8eaf0]">{appt.ownerEmail}</p>
                                <p className="text-gray-700 dark:text-[#e8eaf0]">{appt.ownerPhone}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-[#8892a4] uppercase mb-1">Notas</p>
                                <p className="text-gray-700 dark:text-[#e8eaf0]">{appt.notes || 'Sin notas'}</p>
                                {appt.petType && (
                                  <p className="text-gray-400 dark:text-[#8892a4] text-xs mt-1">Tipo de mascota: {appt.petType}</p>
                                )}
                              </div>
                            </div>
                            {appt.changedByAdmin && appt.changeReason && (
                              <div className="mt-3 pt-3 border-t border-blue-100 dark:border-dark-border text-xs text-gray-500 dark:text-[#8892a4]">
                                {appt.rescheduledFrom ? (
                                  <p>
                                    Reagendada desde {formatDate(appt.rescheduledFrom)} · {appt.rescheduledFromTime} — Motivo:{' '}
                                    {appt.changeReason}
                                  </p>
                                ) : (
                                  <p>Cancelada por el admin — Motivo: {appt.changeReason}</p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                    )
                  })}
                  {data?.appointments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-400 dark:text-[#8892a4]">
                        No hay citas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} citas)</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => showSuccess(`Cita ${cancelTarget.appointmentNumber} cancelada correctamente.`)}
        />
      )}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={() => showSuccess(`Cita ${rescheduleTarget.appointmentNumber} reagendada correctamente.`)}
        />
      )}
    </AdminLayout>
  )
}
