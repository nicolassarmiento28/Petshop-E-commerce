import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminVetServices,
  createAdminVetService,
  updateAdminVetService,
  fetchAdminVetAvailability,
  createAdminVetAvailability,
  fetchAdminVetExceptions,
  createAdminVetException,
  deleteAdminVetException,
  fetchAdminAppointments,
  updateAppointmentStatus,
} from '@/services/adminVetService'
import type { AppointmentStatus } from '@/types'

export const useAdminVetServices = () =>
  useQuery({ queryKey: ['admin', 'vetServices'], queryFn: fetchAdminVetServices })

export const useCreateVetService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminVetService,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'vetServices'] }),
  })
}

export const useUpdateVetService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateAdminVetService>[1] }) =>
      updateAdminVetService(id, data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'vetServices'] }),
  })
}

export const useAdminVetAvailability = () =>
  useQuery({ queryKey: ['admin', 'vetAvailability'], queryFn: fetchAdminVetAvailability })

export const useCreateVetAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminVetAvailability,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'vetAvailability'] }),
  })
}

export const useAdminVetExceptions = () =>
  useQuery({ queryKey: ['admin', 'vetExceptions'], queryFn: fetchAdminVetExceptions })

export const useCreateVetException = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminVetException,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'vetExceptions'] }),
  })
}

export const useDeleteVetException = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminVetException,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'vetExceptions'] }),
  })
}

export const useAdminAppointments = (params: { page: number; status?: string; date?: string }) =>
  useQuery({
    queryKey: ['admin', 'appointments', params],
    queryFn: () => fetchAdminAppointments(params),
  })

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => updateAppointmentStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] }),
  })
}
