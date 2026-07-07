import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Download } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'
import type { ProductType, CategoryType, BrandType } from '@/types'

interface ProductsResponse {
  products: ProductType[]
  total: number
  page: number
  totalPages: number
}

const fetchProducts = (page: number, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)
  return api.get<ProductsResponse>(`/admin/products?${params.toString()}`).then((r) => r.data)
}

const fetchCategories = () =>
  api.get<CategoryType[]>('/categories').then((r) => r.data)

const fetchBrands = () =>
  api.get<BrandType[]>('/brands').then((r) => r.data)

// ── Form schema ────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  slug: z.string().min(2, 'Mínimo 2 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Debe ser positivo'),
  salePrice: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().optional(),
  ),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  sku: z.string().optional(),
  categoryId: z.coerce.number().positive('Selecciona una categoría'),
  brandId: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().optional(),
  ),
  isFeatured: z.boolean().optional(),
  sizeGroup: z.string().optional(),
  isActive: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

// ── Modal ──────────────────────────────────────────────────────────────────────
interface ProductModalProps {
  product: ProductType | null
  categories: CategoryType[]
  brands: BrandType[]
  onClose: () => void
}

const flattenCategories = (cats: CategoryType[], depth = 0): { id: number; label: string }[] =>
  cats.flatMap((c) => [
    { id: c.id, label: `${'  '.repeat(depth)}${c.name}` },
    ...(c.children ? flattenCategories(c.children, depth + 1) : []),
  ])

const inputClass = 'w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]'

const ProductModal = ({ product, categories, brands, onClose }: ProductModalProps) => {
  const queryClient = useQueryClient()
  const isEdit = product !== null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          price: product.price,
          salePrice: product.salePrice ?? undefined,
          stock: product.stock,
          imageUrl: product.imageUrl ?? '',
          sku: product.sku ?? '',
          categoryId: product.categoryId,
          brandId: product.brandId ?? undefined,
          isFeatured: product.isFeatured,
          sizeGroup: product.sizeGroup ?? '',
          isActive: product.isActive,
        }
      : { isFeatured: false, isActive: true },
  })

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      isEdit
        ? api.put(`/admin/products/${product.id}`, values)
        : api.post('/admin/products', values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      onClose()
    },
  })

  const flatCats = flattenCategories(categories)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[#8892a4] dark:hover:text-[#e8eaf0] text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Nombre *</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Slug *</label>
            <input {...register('slug')} className={inputClass} />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Descripción</label>
            <textarea {...register('description')} rows={3} className={`${inputClass} resize-none`} />
          </div>
          {/* Price + SalePrice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Precio *</label>
              <input type="number" {...register('price')} className={inputClass} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Precio oferta</label>
              <input type="number" {...register('salePrice')} className={inputClass} />
            </div>
          </div>
          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Stock *</label>
            <input type="number" {...register('stock')} className={inputClass} />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
          </div>
          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">URL Imagen</label>
            <input {...register('imageUrl')} placeholder="https://..." className={inputClass} />
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">SKU</label>
            <input {...register('sku')} placeholder="ej: ACA-RFP-11KG" className={inputClass} />
          </div>
          {/* Size Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Grupo de tamaños</label>
            <input {...register('sizeGroup')} placeholder="ej: royal-canin-adult-maxi" className={inputClass} />
            <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-1">Productos con el mismo valor se agrupan como variantes de tamaño</p>
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Categoría *</label>
            <select {...register('categoryId')} className={inputClass}>
              <option value="">Seleccionar...</option>
              {flatCats.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Marca</label>
            <select {...register('brandId')} className={inputClass}>
              <option value="">Sin marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#e8eaf0] cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-blue-600" />
              Destacado
            </label>
            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#e8eaf0] cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="accent-blue-600" />
                Activo
              </label>
            )}
          </div>
          {mutation.isError && <p className="text-red-500 text-sm">Error al guardar. Intenta de nuevo.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0] mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
const AdminProducts = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalProduct, setModalProduct] = useState<ProductType | null | 'new'>(null)
  const [confirmProduct, setConfirmProduct] = useState<ProductType | null>(null)
  const queryClient = useQueryClient()

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
      const response = await api.get(`/admin/products/export/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `productos-${new Date().toISOString().slice(0, 10)}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // Silently handle
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: () => fetchProducts(page, search || undefined),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      setConfirmProduct(null)
    },
  })

  const flatCats = flattenCategories(categories)

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Productos | Petshop</title>
      </Helmet>
      <ConfirmDialog
        open={confirmProduct !== null}
        title="Desactivar producto"
        message={
          confirmProduct
            ? `¿Desactivar "${confirmProduct.name}"? El producto dejará de mostrarse en la tienda.`
            : ''
        }
        onConfirm={() => confirmProduct && deactivateMutation.mutate(confirmProduct.id)}
        onCancel={() => setConfirmProduct(null)}
        loading={deactivateMutation.isPending}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Productos</h1>
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
          <button
            onClick={() => setModalProduct('new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xs mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-white dark:bg-dark-surface-elevated focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
        />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-dark-surface-elevated text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Imagen</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-left">Precio</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Grupo</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {data?.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-elevated">
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-dark-surface-elevated rounded-lg" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-[#e8eaf0]">{product.name}</p>
                      <p className="text-gray-400 dark:text-[#8892a4] text-xs">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      {product.sku ? (
                        <span className="font-mono text-xs text-gray-500 dark:text-[#8892a4]">{product.sku}</span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-[#444]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      {flatCats.find((c) => c.id === product.categoryId)?.label.trim() ?? product.categoryId}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">
                      {product.salePrice ? (
                        <span>
                          <span className="line-through text-gray-400 mr-1">{formatCLP(product.price)}</span>
                          <span className="text-blue-600">{formatCLP(product.salePrice)}</span>
                        </span>
                      ) : (
                        formatCLP(product.price)
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{product.stock}</td>
                    <td className="px-4 py-3">
                      {product.sizeGroup ? (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">{product.sizeGroup}</span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-[#444]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalProduct(product)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                        >
                          Editar
                        </button>
                        {product.isActive && (
                          <button
                            onClick={() => setConfirmProduct(product)}
                            className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} productos)</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border dark:text-[#e8eaf0] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === 'new' ? null : modalProduct}
          categories={categories}
          brands={brands}
          onClose={() => setModalProduct(null)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminProducts
