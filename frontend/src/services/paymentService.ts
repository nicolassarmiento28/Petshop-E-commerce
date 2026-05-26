import api from './api'

export interface PaymentStatusResponse {
  orderNumber: string
  status: string
  total: number
  payment: {
    status: string
    tbkAuthCode: string | null
    tbkCardNumber: string | null
    tbkAmount: number | null
  } | null
}

export const createPayment = async (orderId: number): Promise<{ token: string; url: string }> => {
  const { data } = await api.post('/payment/create', { orderId })
  return data
}

export const getPaymentStatus = async (orderNumber: string): Promise<PaymentStatusResponse> => {
  const { data } = await api.get<PaymentStatusResponse>(`/payment/status/${orderNumber}`)
  return data
}
