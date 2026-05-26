import { useMutation } from '@tanstack/react-query'
import { createPayment } from '@/services/paymentService'

function submitToTransbank(token: string, url: string): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'token_ws'
  input.value = token
  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
}

export function usePayment() {
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (orderId: number) => createPayment(orderId),
  })

  return { mutateAsync, submitToTransbank, isPending, isError }
}
