import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search } from 'lucide-react'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductGrid from '@/components/product/ProductGrid'
import { useProductsInfinite, useCategories, useBrands } from '@/hooks/useProducts'
import { formatCLP } from '@/utils/formatters'
import type { ProductFilters, CategoryType } from '@/types'

// ── helpers ────────────────────────────────────────────────────────────────────
function findCategory(cats: CategoryType[], slug: string): CategoryType | undefined {
  for (const c of cats) {
    if (c.slug === slug) return c
    if (c.children) {
      const found = findCategory(c.children, slug)
      if (found) return found
    }
  }
  return undefined
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

// ── Component ──────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { slug, sub } = useParams<{ slug: string; sub?: string }>()
  const [sort, setSort] = useState('name_asc')
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [priceRangeFilter, setPriceRangeFilter] = useState('')

  const isOfertas = slug === 'ofertas'
  const isMarcas = slug === 'marcas'
  const effectiveSlug = sub ?? slug ?? ''

  const { data: allCategories = [] } = useCategories()
  const { data: allBrands = [] } = useBrands()

  // Derive min/max from the priceRangeFilter label string
  const selectedPriceRange = useMemo(() => {
    if (!priceRangeFilter) return null
    const parts = priceRangeFilter.split(' - ')
    if (parts.length === 2) {
      const min = Number(parts[0].replace(/[^0-9]/g, ''))
      const raw = parts[1]
      if (raw.endsWith('+')) {
        return { min, max: undefined as number | undefined }
      }
      const max = Number(raw.replace(/[^0-9]/g, ''))
      return { min, max }
    }
    return null
  }, [priceRangeFilter])

  // Build query filters (no dependency on priceBuckets)
  const filters = useMemo<Omit<ProductFilters, 'cursor'>>(() => {
    const f: Omit<ProductFilters, 'cursor'> = { limit: 100 }
    if (isOfertas) {
      f.sale = true
    } else if (!isMarcas) {
      f.category = effectiveSlug
    }
    if (sort) f.sort = sort
    if (search) f.search = search
    if (brandFilter) f.brand = brandFilter
    if (selectedPriceRange) {
      f.minPrice = selectedPriceRange.min
      if (selectedPriceRange.max !== undefined) f.maxPrice = selectedPriceRange.max
    }
    return f
  }, [isOfertas, isMarcas, effectiveSlug, sort, search, brandFilter, selectedPriceRange])

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfinite(filters)

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.products) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total ?? 0

  const [cachedPriceRange, setCachedPriceRange] = useState<{ min: number; max: number } | null>(null)
  useEffect(() => {
    if (!cachedPriceRange && products.length > 0) {
      const prices = products.flatMap(p => [p.price, p.salePrice].filter((v): v is number => v != null))
      if (prices.length) {
        setCachedPriceRange({ min: Math.min(...prices), max: Math.max(...prices) })
      }
    }
  }, [products, cachedPriceRange])

  type PriceBucket = { label: string; min: number; max?: number }
  const priceBuckets = useMemo(() => {
    if (!cachedPriceRange) return [] as PriceBucket[]
    const { min: rawMin, max: rawMax } = cachedPriceRange
    if (rawMin === rawMax) return [{ label: formatCLP(rawMin), min: rawMin }]
    const spread = rawMax - rawMin
    const stepCount = 6
    const rawStep = spread / stepCount
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const niceStep = Math.ceil(rawStep / magnitude) * magnitude
    const breaks: number[] = []
    let current = Math.ceil(rawMin / niceStep) * niceStep
    while (current < rawMax) {
      breaks.push(current)
      current += niceStep
    }
    const buckets: PriceBucket[] = []
    let prev = rawMin
    for (const b of breaks) {
      buckets.push({ label: `${formatCLP(prev)} - ${formatCLP(b)}`, min: prev, max: b })
      prev = b
    }
    buckets.push({ label: `${formatCLP(prev)}+`, min: prev })
    return buckets
  }, [cachedPriceRange])

  // Subcategories of current parent (for nav pills)
  const parentCat = useMemo(() => {
    if (sub || isOfertas || isMarcas) return null
    return findCategory(allCategories, slug ?? '') ?? null
  }, [allCategories, slug, sub, isOfertas, isMarcas])

  const subcategories = parentCat?.children ?? []

  // Page title
  const pageTitle = isOfertas
    ? 'Ofertas'
    : isMarcas
    ? 'Marcas'
    : sub
    ? capitalize(sub)
    : capitalize(slug ?? '')

  const breadcrumb = sub ? capitalize(slug ?? '') : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-dark-bg">
      <Helmet>
        <title>{pageTitle} | Petshop</title>
      </Helmet>

      <Breadcrumbs items={sub ? [{ label: capitalize(slug ?? ''), href: `/categoria/${slug}` }, { label: pageTitle }] : [{ label: pageTitle }]} />

      {/* Header */}
      <div className="mb-6">
        {breadcrumb && (
          <nav className="text-sm text-gray-400 dark:text-[#8892a4] mb-1">
            <Link to={`/categoria/${slug}`} className="hover:text-blue-600 transition-colors">
              {breadcrumb}
            </Link>
            <span className="mx-1">›</span>
            <span className="text-gray-600 dark:text-[#8892a4]">{pageTitle}</span>
          </nav>
        )}
        <h1
          className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {pageTitle}
        </h1>
        {isOfertas && (
          <p className="text-sm text-gray-500 dark:text-[#8892a4] mt-1">
            Todos los productos con precio de oferta
          </p>
        )}
        {!isLoading && (
          <p className="text-sm text-gray-400 dark:text-[#8892a4] mt-1">
            {total} {total === 1 ? 'producto' : 'productos'}
          </p>
        )}
      </div>

      {/* Subcategory pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            to={`/categoria/${slug}`}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white"
          >
            Todo
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              to={`/categoria/${slug}/${sub.slug}`}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:border-blue-400 hover:text-blue-600 transition-colors bg-white dark:bg-dark-surface"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Brand list for /marcas */}
      {isMarcas && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {allBrands.map((brand) => (
            <Link
              key={brand.id}
              to={`/categoria/marcas?brand=${brand.slug}`}
              onClick={() => setBrandFilter(brand.slug)}
              className="group flex items-center justify-center p-5 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200 bg-white dark:bg-dark-surface"
            >
              <div className="h-16 flex items-center justify-center px-2">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-14 max-w-full w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Filters bar */}
      <div className="sticky top-16 z-10 bg-[#FAFAF8] dark:bg-dark-bg py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-3 border-b border-gray-100 dark:border-dark-border">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en esta categoría..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Brand filter */}
          {!isMarcas && allBrands.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
            >
              <option value="">Todas las marcas</option>
              {allBrands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Price range */}
          <select
            value={priceRangeFilter}
            onChange={(e) => setPriceRangeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
          >
            <option value="">Todos los precios</option>
            {priceBuckets.map((b) => (
              <option key={b.label} value={b.label}>{b.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated hover:border-blue-300 transition-colors outline-none"
          >
            <option value="name_asc">Nombre (A-Z)</option>
            <option value="name_desc">Nombre (Z-A)</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="newest">Más nuevos</option>
          </select>

          {/* Clear filters */}
          {(search || brandFilter || sort !== 'name_asc' || priceRangeFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setBrandFilter('')
                setSort('name_asc')
                setPriceRangeFilter('')
              }}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Products */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyMessage={
          search || brandFilter
            ? 'No se encontraron productos con esos filtros.'
            : 'No hay productos en esta categoría.'
        }
      />

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-8 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más productos'}
          </button>
        </div>
      )}

      {/* Loaded count hint */}
      {!isLoading && total > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-[#8892a4] mt-4">
          Mostrando {products.length} de {total} productos
        </p>
      )}
    </div>
  )
}
