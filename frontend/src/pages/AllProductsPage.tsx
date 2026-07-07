import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductGrid from '@/components/product/ProductGrid'
import { useProducts, useBrands } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

const PAGE_SIZES = [12, 24, 48]

export default function AllProductsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [brandFilter, setBrandFilter] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  // Sync when URL param changes (e.g. navbar search)
  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setSearch(q)
    setPage(1)
  }, [searchParams])

  const { data, isLoading } = useProducts({
    search: search || undefined,
    brand: brandFilter || undefined,
    sort: sort || undefined,
    limit: 200,
  })

  const { data: allBrands = [] } = useBrands()

  const products = data?.products ?? []
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const paginated = products.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = !!(search || brandFilter || sort)

  function applyFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  function goToPage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-dark-bg">
      <Helmet>
        <title>Todos los productos | Petshop</title>
      </Helmet>

      <Breadcrumbs items={[{ label: 'Todos los productos' }]} />

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Catálogo</p>
        <h1
          className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Todos los productos
        </h1>
        {!isLoading && (
          <p className="text-sm text-gray-400 dark:text-[#8892a4] mt-1">{products.length} productos encontrados</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            placeholder="Buscar productos..."
            className="w-full pl-8 pr-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => applyFilter(() => setBrandFilter(e.target.value))}
          className="px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
        >
          <option value="">Todas las marcas</option>
          {allBrands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => applyFilter(() => setSort(e.target.value))}
          className="px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
        >
          <option value="">Más relevantes</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
          <option value="newest">Más nuevos</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setBrandFilter(''); setSort(''); setPage(1) }}
            className="px-3 py-2.5 text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            Limpiar
          </button>
        )}

        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
          className="px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} por página</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <ProductGrid
        products={paginated}
        isLoading={isLoading}
        emptyMessage={
          hasFilters
            ? 'No se encontraron productos con esos filtros.'
            : 'No hay productos disponibles.'
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white dark:bg-dark-surface dark:text-[#e8eaf0]"
          >
            <ChevronLeft size={18} />
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-[#8892a4] text-sm select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p as number)}
                className={cn(
                  'min-w-[36px] h-9 rounded-xl text-sm font-medium border transition-colors',
                  page === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-[#e8eaf0] border-gray-200 dark:border-dark-border hover:border-blue-300',
                )}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white dark:bg-dark-surface dark:text-[#e8eaf0]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
