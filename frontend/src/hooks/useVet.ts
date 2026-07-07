import { useQuery, useMutation } from '@tanstack/react-query'
import {
  fetchVetServices,
  fetchAvailableSlots,
  createAppointment,
  createVetPayment,
} from '@/services/vetService'
import { submitToTransbank } from '@/utils/transbank'
import type { CreateAppointmentInput } from '@/types'

export const useVetServices = () =>
  useQuery({
    queryKey: ['vetServices'],
    queryFn: fetchVetServices,
  })

export const useAvailableSlots = (date: string | undefined, serviceId: number | undefined) =>
  useQuery({
    queryKey: ['vetAvailability', date, serviceId],
    queryFn: () => fetchAvailableSlots(date!, serviceId!),
    enabled: Boolean(date) && Boolean(serviceId),
  })

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
  })

export function useVetPayment() {
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (appointmentId: number) => createVetPayment(appointmentId),
  })

  return { mutateAsync, submitToTransbank, isPending, isError }
}
