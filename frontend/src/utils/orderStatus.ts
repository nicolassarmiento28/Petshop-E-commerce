import type { OrderStatus } from '@/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

// Semántico: pendiente=ámbar, en curso (pagado/procesando/enviado)=azul, entregado=verde, cancelado=rojo, reembolsado=gris
export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-[#2d2410] dark:text-amber-400 dark:border-[#453410]',
  PAID: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#0f2247] dark:text-blue-400 dark:border-[#163461]',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#0f2247] dark:text-blue-400 dark:border-[#163461]',
  SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#0f2247] dark:text-blue-400 dark:border-[#163461]',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200 dark:bg-[#0f2b1a] dark:text-green-400 dark:border-[#164028]',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-[#2b1414] dark:text-red-400 dark:border-[#402020]',
  REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-surface-elevated dark:text-gray-400 dark:border-dark-border',
}

export const ORDER_STATUS_BADGE_BASE = 'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium'
