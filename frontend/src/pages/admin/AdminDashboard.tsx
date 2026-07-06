import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, DollarSign, Package, ShoppingCart, ArrowUp, ArrowDown, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_CLASSES, ORDER_STATUS_BADGE_BASE } from '@/utils/orderStatus'
import { useThemeStore } from '@/store/themeStore'
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

interface SalesByCategoryItem {
  name: string
  revenue: number
  percentage: number
}

interface SalesByCategoryResponse {
  categories: SalesByCategoryItem[]
}

interface MonthComparisonResponse {
  currentMonth: { revenue: number; orders: number }
  previousMonth: { revenue: number; orders: number }
  revenueChange: number
  ordersChange: number
}

interface RecentOrdersFeedResponse {
  orders: { id: number; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[]
}

const STATUS_META: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING',    label: 'Pendiente' },
  { status: 'PAID',       label: 'Pagado' },
  { status: 'PROCESSING', label: 'En proceso' },
  { status: 'SHIPPED',    label: 'Enviado' },
  { status: 'DELIVERED',  label: 'Entregado' },
  { status: 'CANCELLED',  label: 'Cancelado' },
  { status: 'REFUNDED',   label: 'Reembolsado' },
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

const fetchSalesByCategory = () =>
  api.get<SalesByCategoryResponse>('/admin/analytics/sales-by-category').then((r) => r.data)

const fetchMonthComparison = () =>
  api.get<MonthComparisonResponse>('/admin/analytics/month-comparison').then((r) => r.data)

const fetchRecentOrdersFeed = () =>
  api.get<RecentOrdersFeedResponse>('/admin/orders/recent-feed').then((r) => r.data)

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace unos segundos'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

const DONUT_COLORS = ['#f97316', '#059669', '#fbbf24', '#3b82f6', '#a855f7', '#ec4899']

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof DollarSign }) => (
  <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">{value}</p>
    </div>
    {Icon && <Icon size={22} className="text-gray-400 dark:text-[#8892a4]" />}
  </div>
)

const HighlightStatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gradient-to-br from-blue-800 to-blue-600 dark:from-blue-900 dark:to-blue-700 rounded-xl p-6 flex flex-col justify-center">
    <p className="text-sm text-white/80 mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
)

const AdminDashboard = () => {
  const theme = useThemeStore((s) => s.theme)
  const chartColor = theme === 'dark' ? '#60a5fa' : '#2563eb'

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

  const { data: salesByCategory } = useQuery({
    queryKey: ['admin', 'salesByCategory'],
    queryFn: fetchSalesByCategory,
  })

  const { data: monthComparison } = useQuery({
    queryKey: ['admin', 'monthComparison'],
    queryFn: fetchMonthComparison,
  })

  const { data: recentFeed } = useQuery({
    queryKey: ['admin', 'recentOrdersFeed'],
    queryFn: fetchRecentOrdersFeed,
  })

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Dashboard | Petshop</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Dashboard</h1>
      {isLoading && <p className="text-gray-500 dark:text-[#8892a4]">Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar datos</p>}
      {data && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Órdenes totales" value={String(data.totalOrders)} icon={ShoppingCart} />
            <StatCard label="Productos activos" value={String(data.totalProducts)} icon={Package} />
            <HighlightStatCard label="Ingresos totales" value={formatCLP(data.revenue)} />
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${ORDER_STATUS_BADGE_CLASSES[m.status]}`}
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
              <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 dark:text-[#e8eaf0]">Ingresos (últimos 30 días)</h2>
                  <span className="text-xs text-gray-400 dark:text-[#8892a4]">{revenueData.orderCount} órdenes</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: string) => v.slice(5)}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#e8eaf0',
                        fontSize: '13px',
                      }}
                      formatter={(value) => [formatCLP(Number(value) || 0), 'Ingresos']}
                      labelFormatter={(label) => {
                        const d = new Date(String(label) + 'T00:00:00')
                        return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      dot={false}
                      activeDot={{ r: 4, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top selling products */}
            {topSelling && topSelling.length > 0 && (
              <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
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
              <div className="bg-white dark:bg-dark-surface rounded-xl border border-orange-200 dark:border-orange-800 overflow-hidden">
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
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
                <h2 className="font-semibold text-gray-800 dark:text-[#e8eaf0]">Órdenes recientes</h2>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
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
                        <span className={`${ORDER_STATUS_BADGE_BASE} ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
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
          </div>

          {/* Sales by category + Month comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales by category donut */}
            {salesByCategory && salesByCategory.categories.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Ventas por categoría</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={salesByCategory.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="revenue"
                      nameKey="name"
                    >
                      {salesByCategory.categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCLP(Number(value)), 'Ingresos']} />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-sm text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Month comparison */}
            {monthComparison && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Comparación mensual</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ingresos</p>
                    <p className="text-xl font-bold text-gray-900">{formatCLP(monthComparison.currentMonth.revenue)}</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${monthComparison.revenueChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {monthComparison.revenueChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(monthComparison.revenueChange)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Órdenes</p>
                    <p className="text-xl font-bold text-gray-900">{monthComparison.currentMonth.orders}</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${monthComparison.ordersChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {monthComparison.ordersChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(monthComparison.ordersChange)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders 24h feed */}
          {recentFeed && recentFeed.orders.length > 0 && (
            <div className="bg-white rounded-xl border p-6 overflow-hidden mb-8">
              <h2 className="font-semibold text-gray-800 mb-4">Órdenes últimas 24h</h2>
              <div className="divide-y divide-gray-100">
                {recentFeed.orders.map((order) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Clock size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-gray-700">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCLP(order.total)}</p>
                      <span className={`${ORDER_STATUS_BADGE_BASE} ${ORDER_STATUS_BADGE_CLASSES[order.status as OrderStatus]}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard
