import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import AdminLayout from '@/components/admin/AdminLayout'
import VetSubNav from '@/components/admin/VetSubNav'
import { formatDate } from '@/utils/formatters'
import { useAdminAppointments, useUpdateAppointmentStatus } from '@/hooks/useAdminVet'
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_BADGE_BASE,
} from '@/utils/appointmentStatus'
import type { AppointmentStatus } from '@/types'

const APPOINTMENT_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

const inputClass =
  'border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]'

export default function AdminVetAppointments() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Veterinaria | Petshop</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-2">Veterinaria</h1>
      <VetSubNav />

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
                    <th className="px-4 py-3 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {data?.appointments.map((appt) => (
                    <>
                      <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-elevated">
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
                          <td colSpan={8} className="px-8 py-4">
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
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {data?.appointments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400 dark:text-[#8892a4]">
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
    </AdminLayout>
  )
}
