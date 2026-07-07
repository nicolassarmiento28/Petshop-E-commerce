import { useMutation } from '@tanstack/react-query'
import { createPayment } from '@/services/paymentService'
import { submitToTransbank } from '@/utils/transbank'

export function usePayment() {
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (orderId: number) => createPayment(orderId),
  })

  return { mutateAsync, submitToTransbank, isPending, isError }
}
