import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Search, Download } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'

interface CustomerSummary {
  name: string
  email: string
  phone: string | null
  orderCount: number
  totalSpent: number
  lastOrderDate: string
}

interface CustomersResponse {
  customers: CustomerSummary[]
  total: number
  page: number
  totalPages: number
}

const fetchCustomers = (page: number, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)
  return api.get<CustomersResponse>(`/admin/customers?${params.toString()}`).then((r) => r.data)
}

const AdminCustomers = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = (value: string) => {
    setSearchInput(value)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 350)
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/admin/customers/export/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `clientes-${new Date().toISOString().slice(0, 10)}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // Silently handle
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', page, search],
    queryFn: () => fetchCustomers(page, search || undefined),
  })

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Clientes | Petshop</title>
      </Helmet>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Clientes</h1>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="relative max-w-xs mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-white dark:bg-[#222222] focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
        />
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Órdenes</th>
                  <th className="px-4 py-3 text-left">Total Gastado</th>
                  <th className="px-4 py-3 text-left">Última orden</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {data?.customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-gray-50 dark:hover:bg-[#222222]">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#e8eaf0]">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">{customer.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{formatCLP(customer.totalSpent)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      {new Date(customer.lastOrderDate).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} clientes)</span>
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

export default AdminCustomers
