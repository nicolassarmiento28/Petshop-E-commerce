import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react'
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

interface LowStockItem {
  id: number
  name: string
  slug: string
  stock: number
  category: { name: string }
}

interface TopProduct {
  product: { id: number; name: string; price: number; imageUrl: string | null } | null
  totalSold: number
}

interface RevenueData {
  daily: { date: string; revenue: number }[]
  totalRevenue: number
  orderCount: number
}

type OrderStatsResponse = Record<OrderStatus, number>

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

const fetchLowStock = () =>
  api.get<{ products: LowStockItem[]; total: number }>('/admin/products/low-stock?threshold=5').then((r) => r.data)

const fetchTopSelling = () =>
  api.get<TopProduct[]>('/admin/products/top-selling').then((r) => r.data)

const fetchRevenue = () =>
  api.get<RevenueData>('/admin/revenue?days=30').then((r) => r.data)

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

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof DollarSign }) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">{value}</p>
    </div>
    {Icon && (
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
        <Icon size={22} />
      </div>
    )}
  </div>
)

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: fetchSummary,
  })

  const { data: orderStats, isError: isStatsError } = useQuery({
    queryKey: ['admin', 'orderStats'],
    queryFn: fetchOrderStats,
  })

  const { data: lowStock } = useQuery({
    queryKey: ['admin', 'lowStock'],
    queryFn: fetchLowStock,
  })

  const { data: topSelling } = useQuery({
    queryKey: ['admin', 'topSelling'],
    queryFn: fetchTopSelling,
  })

  const { data: revenueData } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: fetchRevenue,
  })

  const maxRevenue = Math.max(...(revenueData?.daily.map((d) => d.revenue) ?? [0]), 1)

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Dashboard</h1>
      {isLoading && <p className="text-gray-500 dark:text-[#8892a4]">Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar datos</p>}
      {data && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Órdenes totales" value={String(data.totalOrders)} icon={ShoppingCart} />
            <StatCard label="Productos activos" value={String(data.totalProducts)} icon={Package} />
            <StatCard label="Ingresos totales" value={formatCLP(data.revenue)} icon={DollarSign} />
            <StatCard
              label="Ingresos (30 días)"
              value={formatCLP(revenueData?.totalRevenue ?? 0)}
              icon={TrendingUp}
            />
          </div>

          {/* Order status breakdown */}
          {isStatsError ? (
            <p className="text-sm text-red-500 mb-8">No se pudo cargar el estado de órdenes.</p>
          ) : orderStats ? (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-[#8892a4] uppercase tracking-widest mb-3">
                Estado de órdenes
              </h2>
              <div className="flex flex-wrap gap-3">
                {STATUS_META.filter((m) => orderStats[m.status] > 0).map((m) => (
                  <div
                    key={m.status}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${m.color}`}
                  >
                    <span className="text-lg font-bold">{orderStats[m.status]}</span>
                    <span>{m.label}</span>
                  </div>
                ))}
                {STATUS_META.every((m) => orderStats[m.status] === 0) && (
                  <p className="text-sm text-gray-400 dark:text-[#8892a4]">Sin órdenes aún</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue chart */}
            {revenueData && revenueData.daily.length > 0 && (
              <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 dark:text-[#e8eaf0]">Ingresos (últimos 30 días)</h2>
                  <span className="text-xs text-gray-400 dark:text-[#8892a4]">{revenueData.orderCount} órdenes</span>
                </div>
                <div className="flex items-end gap-[3px] h-32">
                  {revenueData.daily.map((d) => (
                    <div
                      key={d.date}
                      className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t hover:opacity-80 transition-opacity relative group"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }}
                      title={`${d.date}: ${formatCLP(d.revenue)}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Top selling products */}
            {topSelling && topSelling.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
                <h2 className="font-semibold text-gray-800 dark:text-[#e8eaf0] mb-4">Más vendidos</h2>
                <div className="space-y-3">
                  {topSelling.slice(0, 6).map((item, i) => (
                    <div key={item.product?.id ?? i} className="flex items-center gap-3">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-[#222222]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-[#e8eaf0] truncate">
                          {item.product?.name ?? 'Producto eliminado'}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-[#8892a4] shrink-0">
                        {item.totalSold} vend.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Low stock alerts + Recent orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Low stock */}
            {lowStock && lowStock.products.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-orange-200 dark:border-orange-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-orange-100 dark:border-orange-800 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <h2 className="font-semibold text-orange-700 dark:text-orange-400">Stock bajo ({lowStock.total})</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                  {lowStock.products.slice(0, 8).map((p) => (
                    <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-[#e8eaf0]">{p.name}</p>
                        <p className="text-xs text-gray-400 dark:text-[#8892a4]">{p.category?.name}</p>
                      </div>
                      <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                        {p.stock} uds.
                      </span>
                    </div>
                  ))}
                  {lowStock.total > 8 && (
                    <Link
                      to="/admin/productos"
                      className="block px-6 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver todos ({lowStock.total})
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Recent orders */}
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
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard
