import api from './api'
import type { VetServiceType, AppointmentType, AppointmentStatus } from '@/types'

export interface VetAvailabilityType {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface VetExceptionType {
  id: number
  date: string
  type: 'BLOCKED_FULL_DAY' | 'BLOCKED_SLOT' | 'EXTRA_SLOT'
  startTime: string | null
  endTime: string | null
  reason: string | null
  createdAt: string
}

export interface AdminAppointmentsResponse {
  appointments: AppointmentType[]
  total: number
  page: number
  totalPages: number
}

// ── Services ──────────────────────────────────────────────────────────────
export const fetchAdminVetServices = () =>
  api.get<VetServiceType[]>('/admin/vet/services').then((r) => r.data)

export const createAdminVetService = (data: { name: string; description?: string; durationMin: number; price: number }) =>
  api.post<VetServiceType>('/admin/vet/services', data).then((r) => r.data)

export const updateAdminVetService = (id: number, data: Partial<{ name: string; description: string; durationMin: number; price: number; isActive: boolean }>) =>
  api.put<VetServiceType>(`/admin/vet/services/${id}`, data).then((r) => r.data)

// ── Availability ──────────────────────────────────────────────────────────
export const fetchAdminVetAvailability = () =>
  api.get<VetAvailabilityType[]>('/admin/vet/availability').then((r) => r.data)

export const createAdminVetAvailability = (data: { dayOfWeek: number; startTime: string; endTime: string }) =>
  api.post<VetAvailabilityType>('/admin/vet/availability', data).then((r) => r.data)

// ── Exceptions ────────────────────────────────────────────────────────────
export const fetchAdminVetExceptions = () =>
  api.get<VetExceptionType[]>('/admin/vet/exceptions').then((r) => r.data)

export const createAdminVetException = (data: {
  date: string
  type: 'BLOCKED_FULL_DAY' | 'BLOCKED_SLOT' | 'EXTRA_SLOT'
  startTime?: string
  endTime?: string
  reason?: string
}) => api.post<VetExceptionType>('/admin/vet/exceptions', data).then((r) => r.data)

export const deleteAdminVetException = (id: number) => api.delete(`/admin/vet/exceptions/${id}`)

// ── Appointments ──────────────────────────────────────────────────────────
export const fetchAdminAppointments = (params: { page: number; status?: string; date?: string }) => {
  const query = new URLSearchParams({ page: String(params.page), limit: '20' })
  if (params.status) query.set('status', params.status)
  if (params.date) query.set('date', params.date)
  return api.get<AdminAppointmentsResponse>(`/admin/vet/appointments?${query.toString()}`).then((r) => r.data)
}

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) =>
  api.put<AppointmentType>(`/admin/vet/appointments/${id}/status`, { status }).then((r) => r.data)
