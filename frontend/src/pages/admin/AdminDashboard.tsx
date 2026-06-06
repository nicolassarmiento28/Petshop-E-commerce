import { useQuery } from '@tanstack/react-query'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'
import type { OrderType, OrderStatus } from '@/types'

interface ProductsResponse {
  products: { id: number }[]
  total: number
}

interface OrdersResponse {
  orders: OrderType[]
  total: number
}

type OrderStatsResponse = Partial<Record<OrderStatus, number>>

const STATUS_META: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'PENDING',    label: 'Pendiente',   color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' },
  { status: 'PAID',       label: 'Pagado',       color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' },
  { status: 'PROCESSING', label: 'En proceso',   color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' },
  { status: 'SHIPPED',    label: 'Enviado',      color: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' },
  { status: 'DELIVERED',  label: 'Entregado',    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' },
  { status: 'CANCELLED',  label: 'Cancelado',    color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' },
  { status: 'REFUNDED',   label: 'Reembolsado',  color: 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-400' },
]

const fetchSummary = async () => {
  const [productsRes, ordersRes] = await Promise.all([
    api.get<ProductsResponse>('/admin/products?limit=1'),
    api.get<OrdersResponse>('/admin/orders?limit=100'),
  ])
  const orders = ordersRes.data.orders
  const revenue = orders
    .filter((o) => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPED')
    .reduce((sum, o) => sum + o.total, 0)
  return {
    totalProducts: productsRes.data.total,
    totalOrders: ordersRes.data.total,
    revenue,
    recentOrders: orders.slice(0, 5),
  }
}

const fetchOrderStats = () =>
  api.get<OrderStatsResponse>('/admin/orders/stats').then((r) => r.data)

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
    <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">{value}</p>
  </div>
)

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: fetchSummary,
  })

  const { data: orderStats } = useQuery({
    queryKey: ['admin', 'orderStats'],
    queryFn: fetchOrderStats,
  })

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Dashboard</h1>
      {isLoading && <p className="text-gray-500 dark:text-[#8892a4]">Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar datos</p>}
      {data && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Órdenes totales" value={String(data.totalOrders)} />
            <StatCard label="Productos activos" value={String(data.totalProducts)} />
            <StatCard label="Ingresos (pagado/enviado/entregado)" value={formatCLP(data.revenue)} />
          </div>

          {/* Order status breakdown */}
          {orderStats && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8892a4] uppercase tracking-widest mb-3">
                Estado de órdenes
              </h2>
              <div className="flex flex-wrap gap-3">
                {STATUS_META.filter((m) => (orderStats[m.status] ?? 0) > 0).map((m) => (
                  <div
                    key={m.status}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${m.color}`}
                  >
                    <span className="text-lg font-bold">{orderStats[m.status]}</span>
                    <span>{m.label}</span>
                  </div>
                ))}
                {STATUS_META.every((m) => (orderStats[m.status] ?? 0) === 0) && (
                  <p className="text-sm text-gray-400 dark:text-[#8892a4]">Sin órdenes aún</p>
                )}
              </div>
            </div>
          )}

          {/* Recent orders table */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
              <h2 className="font-semibold text-gray-800 dark:text-[#e8eaf0]">Órdenes recientes</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">N° Orden</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#222222]">
                    <td className="px-6 py-3 font-mono text-gray-700 dark:text-[#e8eaf0]">{order.orderNumber}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-[#e8eaf0]">{order.customerName}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-[#e8eaf0]">{formatCLP(order.total)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-400 dark:text-[#8892a4]">
                      Sin órdenes aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard
