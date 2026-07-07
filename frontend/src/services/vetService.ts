import api from './api'
import type { VetServiceType, AvailableSlotType, CreateAppointmentInput } from '@/types'

export const fetchVetServices = async (): Promise<VetServiceType[]> => {
  const { data } = await api.get<VetServiceType[]>('/vet/services')
  return data
}

export const fetchAvailableSlots = async (date: string, serviceId: number): Promise<AvailableSlotType> => {
  const { data } = await api.get<AvailableSlotType>('/vet/availability', {
    params: { date, serviceId },
  })
  return data
}

export const createAppointment = async (
  input: CreateAppointmentInput,
): Promise<{ appointmentId: number; appointmentNumber: string; total: number }> => {
  const { data } = await api.post('/vet/appointments', input)
  return data
}

export const createVetPayment = async (appointmentId: number): Promise<{ token: string; url: string }> => {
  const { data } = await api.post('/vet/payment/create', { appointmentId })
  return data
}

export interface VetPaymentStatusResponse {
  appointmentNumber: string
  status: string
  date: string
  startTime: string
  endTime: string
  petName: string
  service: { name: string; price: number }
  payment: {
    status: string
    tbkAuthCode: string | null
    tbkCardNumber: string | null
    tbkAmount: number | null
  } | null
}

export const getVetPaymentStatus = async (appointmentNumber: string): Promise<VetPaymentStatusResponse> => {
  const { data } = await api.get<VetPaymentStatusResponse>(`/vet/payment/status/${appointmentNumber}`)
  return data
}
