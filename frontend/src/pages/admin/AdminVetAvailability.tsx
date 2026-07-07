import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ToggleLeft, ToggleRight, Trash2, Plus } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import VetSubNav from '@/components/admin/VetSubNav'
import {
  useAdminVetAvailability,
  useCreateVetAvailability,
  useAdminVetExceptions,
  useCreateVetException,
  useDeleteVetException,
} from '@/hooks/useAdminVet'
import { formatDate } from '@/utils/formatters'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const inputClass =
  'border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]'

interface DayRowState {
  active: boolean
  startTime: string
  endTime: string
}

function DayRow({ dayOfWeek, existing }: { dayOfWeek: number; existing?: { startTime: string; endTime: string; isActive: boolean } }) {
  const createMutation = useCreateVetAvailability()
  const [state, setState] = useState<DayRowState>({
    active: existing?.isActive ?? false,
    startTime: existing?.startTime ?? '09:00',
    endTime: existing?.endTime ?? '18:00',
  })

  const handleSave = () => {
    createMutation.mutate({ dayOfWeek, startTime: state.startTime, endTime: state.endTime })
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-dark-border last:border-0">
      <button
        onClick={() => setState((s) => ({ ...s, active: !s.active }))}
        className="text-blue-600 dark:text-blue-400 shrink-0"
        aria-label="Activar/desactivar día"
      >
        {state.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-300 dark:text-gray-600" />}
      </button>
      <span className="w-24 shrink-0 text-sm font-medium text-gray-800 dark:text-[#e8eaf0]">{DAYS[dayOfWeek]}</span>
      <input
        type="time"
        value={state.startTime}
        disabled={!state.active}
        onChange={(e) => setState((s) => ({ ...s, startTime: e.target.value }))}
        className={`${inputClass} disabled:opacity-40`}
      />
      <span className="text-gray-400 dark:text-[#8892a4]">a</span>
      <input
        type="time"
        value={state.endTime}
        disabled={!state.active}
        onChange={(e) => setState((s) => ({ ...s, endTime: e.target.value }))}
        className={`${inputClass} disabled:opacity-40`}
      />
      <button
        onClick={handleSave}
        disabled={createMutation.isPending}
        className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
      >
        {createMutation.isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}

function BlockFullDayForm({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const mutation = useCreateVetException()

  return (
    <div className="flex items-end gap-3 p-4 bg-gray-50 dark:bg-dark-surface-elevated rounded-lg mb-4">
      <div>
        <label className="block text-xs text-gray-500 dark:text-[#8892a4] mb-1">Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 dark:text-[#8892a4] mb-1">Razón (opcional)</label>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} w-full`} />
      </div>
      <button
        disabled={!date || mutation.isPending}
        onClick={() =>
          mutation.mutate(
            { date, type: 'BLOCKED_FULL_DAY', reason: reason || undefined },
            { onSuccess: onClose },
          )
        }
        className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
      >
        Bloquear
      </button>
      <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0]">
        Cancelar
      </button>
    </div>
  )
}

function ExtraSlotForm({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('13:00')
  const mutation = useCreateVetException()

  return (
    <div className="flex items-end gap-3 p-4 bg-gray-50 dark:bg-dark-surface-elevated rounded-lg mb-4">
      <div>
        <label className="block text-xs text-gray-500 dark:text-[#8892a4] mb-1">Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-[#8892a4] mb-1">Desde</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-[#8892a4] mb-1">Hasta</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
      </div>
      <button
        disabled={!date || mutation.isPending}
        onClick={() =>
          mutation.mutate({ date, type: 'EXTRA_SLOT', startTime, endTime }, { onSuccess: onClose })
        }
        className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
      >
        Agregar
      </button>
      <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0]">
        Cancelar
      </button>
    </div>
  )
}

const EXCEPTION_LABELS: Record<string, string> = {
  BLOCKED_FULL_DAY: 'Día bloqueado',
  BLOCKED_SLOT: 'Horario bloqueado',
  EXTRA_SLOT: 'Horario extra',
}

export default function AdminVetAvailability() {
  const { data: availability, isLoading } = useAdminVetAvailability()
  const { data: exceptions, isLoading: loadingExceptions } = useAdminVetExceptions()
  const deleteException = useDeleteVetException()
  const [openForm, setOpenForm] = useState<'block' | 'extra' | null>(null)

  const byDay = new Map(availability?.map((a) => [a.dayOfWeek, a]))

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Veterinaria | Petshop</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-2">Veterinaria</h1>
      <VetSubNav />

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8892a4] uppercase tracking-widest mb-3">
          Horario recurrente
        </h2>
        {isLoading ? (
          <p className="text-gray-500 dark:text-[#8892a4] text-sm">Cargando...</p>
        ) : (
          [0, 1, 2, 3, 4, 5, 6].map((day) => <DayRow key={day} dayOfWeek={day} existing={byDay.get(day)} />)
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8892a4] uppercase tracking-widest">Excepciones</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setOpenForm(openForm === 'block' ? null : 'block')}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
            >
              <Plus size={12} /> Bloquear fecha completa
            </button>
            <button
              onClick={() => setOpenForm(openForm === 'extra' ? null : 'extra')}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
            >
              <Plus size={12} /> Agregar horario extra
            </button>
          </div>
        </div>

        {openForm === 'block' && <BlockFullDayForm onClose={() => setOpenForm(null)} />}
        {openForm === 'extra' && <ExtraSlotForm onClose={() => setOpenForm(null)} />}

        {loadingExceptions ? (
          <p className="text-gray-500 dark:text-[#8892a4] text-sm">Cargando...</p>
        ) : exceptions?.length === 0 ? (
          <p className="text-gray-400 dark:text-[#8892a4] text-sm">No hay excepciones definidas</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {exceptions?.map((exc) => (
              <div key={exc.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="font-medium text-gray-800 dark:text-[#e8eaf0]">{formatDate(exc.date)}</span>
                  <span className="ml-2 text-gray-400 dark:text-[#8892a4]">
                    {EXCEPTION_LABELS[exc.type]}
                    {exc.startTime && exc.endTime ? ` · ${exc.startTime}-${exc.endTime}` : ''}
                    {exc.reason ? ` · ${exc.reason}` : ''}
                  </span>
                </div>
                <button
                  onClick={() => deleteException.mutate(exc.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Eliminar excepción"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
