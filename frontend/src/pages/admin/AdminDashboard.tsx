import { useQuery } from '@tanstack/react-query'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'
import type { OrderType } from '@/types'

interface ProductsResponse {
  products: { id: number }[]
  total: number
}

interface OrdersResponse {
  orders: OrderType[]
  total: number
}

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

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
    <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">{value}</p>
  </div>
)

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: fetchSummary,
  })

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Dashboard</h1>
      {isLoading && <p className="text-gray-500 dark:text-[#8892a4]">Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar datos</p>}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Órdenes totales" value={String(data.totalOrders)} />
            <StatCard label="Productos activos" value={String(data.totalProducts)} />
            <StatCard label="Ingresos (pagado/enviado/entregado)" value={formatCLP(data.revenue)} />
          </div>
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
