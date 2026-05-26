import api from './api'
import type { OrderType, CreateOrderInput } from '@/types'

export const createOrder = async (input: CreateOrderInput): Promise<{ orderId: number; orderNumber: string; total: number }> => {
  const { data } = await api.post('/orders', input)
  return data
}

export const getOrder = async (orderNumber: string): Promise<OrderType> => {
  const { data } = await api.get<OrderType>(`/orders/${orderNumber}`)
  return data
}
