import { useAvailableSlots } from '@/hooks/useVet'

interface SlotPickerProps {
  serviceId: number | undefined
  date: string
  onDateChange: (date: string) => void
  slot: string | null
  onSlotChange: (slot: string) => void
  minDate?: string
}

const dateInputClass =
  'w-full max-w-xs border border-gray-200 dark:border-[#2a2f3d] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm bg-white dark:bg-[#1a1f2b] text-gray-900 dark:text-zinc-100'

export function SlotPicker({ serviceId, date, onDateChange, slot, onSlotChange, minDate }: SlotPickerProps) {
  const { data: availability, isLoading: loadingSlots } = useAvailableSlots(date, serviceId)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
      <input
        type="date"
        value={date}
        min={minDate}
        onChange={(e) => onDateChange(e.target.value)}
        className={`${dateInputClass} mb-5`}
      />

      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Horario disponible</label>
      {loadingSlots && <p className="text-gray-500 dark:text-[#8892a4] text-sm">Cargando horarios…</p>}
      {!loadingSlots && availability?.slots.length === 0 && (
        <p className="text-gray-500 dark:text-[#8892a4] text-sm">No hay horarios disponibles para esta fecha.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {availability?.slots.map((s) => {
          const selected = slot === s
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSlotChange(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selected
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-dark-border text-gray-700 dark:text-[#e8eaf0] hover:border-blue-600'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
