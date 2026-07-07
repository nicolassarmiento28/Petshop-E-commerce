import type { AppointmentStatus } from '@/types'

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No-show',
}

// Mismo esquema semántico que ORDER_STATUS_BADGE_CLASSES: ámbar=pendiente, azul=confirmada, verde=completada, rojo=cancelada, gris=no-show
export const APPOINTMENT_STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-[#2d2410] dark:text-amber-400 dark:border-[#453410]',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#0f2247] dark:text-blue-400 dark:border-[#163461]',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200 dark:bg-[#0f2b1a] dark:text-green-400 dark:border-[#164028]',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-[#2b1414] dark:text-red-400 dark:border-[#402020]',
  NO_SHOW: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-surface-elevated dark:text-gray-400 dark:border-dark-border',
}

export const APPOINTMENT_STATUS_BADGE_BASE = 'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium'
