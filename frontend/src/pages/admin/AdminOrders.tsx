import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'
import type { OrderType, OrderStatus } from '@/types'

interface OrdersResponse {
  orders: OrderType[]
  total: number
  page: number
  totalPages: number
}

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

const fetchOrders = (page: number, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (status) params.set('status', status)
  return api.get<OrdersResponse>(`/admin/orders?${params.toString()}`).then((r) => r.data)
}

const AdminOrders = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter],
    queryFn: () => fetchOrders(page, statusFilter || undefined),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/admin/orders/export/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ordenes-${new Date().toISOString().slice(0, 10)}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // Silently handle — token will be attached by api interceptor
    }
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Órdenes | Petshop</title>
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Órdenes</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> XLSX
          </button>
          {/* Status filter */}
          <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0]"
        >
          <option value="">Todos los estados</option>
            {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">N° Orden</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Cambiar estado</th>
                  <th className="px-4 py-3 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {data?.orders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#222222]">
                      <td className="px-4 py-3 font-mono text-gray-700 dark:text-[#e8eaf0]">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800 dark:text-[#e8eaf0]">{order.customerName}</p>
                        <p className="text-gray-400 dark:text-[#8892a4] text-xs">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{formatCLP(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={order.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })
                          }
                          className="border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0]"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                        >
                          {expandedId === order.id ? 'Ocultar' : 'Ver items'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-blue-50 dark:bg-[#1a1a1a]">
                        <td colSpan={6} className="px-8 py-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-[#8892a4] uppercase mb-2">Items del pedido</p>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-[#e8eaf0]">
                                <span>{item.product?.name ?? `Producto #${item.productId}`} × {item.quantity}</span>
                                <span>{formatCLP(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                          {order.shippingAddress && (
                            <p className="text-xs text-gray-500 dark:text-[#8892a4] mt-2">Dirección: {order.shippingAddress}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 dark:text-[#8892a4]">
                      No hay órdenes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} órdenes)</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-[#2a2a2a] dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-[#2a2a2a] dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminOrders
