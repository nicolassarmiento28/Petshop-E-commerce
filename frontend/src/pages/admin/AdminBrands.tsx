import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/services/api'
import type { BrandType } from '@/types'

interface BrandWithCount extends BrandType {
  _count: { products: number }
}

interface BrandsResponse {
  brands: BrandWithCount[]
  total: number
  page: number
  totalPages: number
}

const fetchBrands = (page: number, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)
  return api.get<BrandsResponse>(`/admin/brands?${params.toString()}`).then((r) => r.data)
}

const brandSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  slug: z.string().min(2, 'Mínimo 2 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type BrandFormValues = z.infer<typeof brandSchema>

interface BrandModalProps {
  brand: BrandType | null
  onClose: () => void
}

const inputClass = 'w-full border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]'

const BrandModal = ({ brand, onClose }: BrandModalProps) => {
  const queryClient = useQueryClient()
  const isEdit = brand !== null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: isEdit
      ? {
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl ?? '',
        }
      : {},
  })

  const mutation = useMutation({
    mutationFn: (values: BrandFormValues) =>
      isEdit
        ? api.put(`/admin/brands/${brand.id}`, values)
        : api.post('/admin/brands', values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">
            {isEdit ? 'Editar marca' : 'Nueva marca'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[#8892a4] dark:hover:text-[#e8eaf0] text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Nombre *</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Slug *</label>
            <input {...register('slug')} className={inputClass} />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">URL Logo</label>
            <input {...register('logoUrl')} placeholder="https://..." className={inputClass} />
            {errors.logoUrl && <p className="text-red-500 text-xs mt-1">{errors.logoUrl.message}</p>}
          </div>
          {mutation.isError && <p className="text-red-500 text-sm">Error al guardar. Intenta de nuevo.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors">
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

const ConfirmDialog = ({
  open,
  title,
  message,
  error,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  message: string
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0] mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-6">{message}</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminBrands = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalBrand, setModalBrand] = useState<BrandType | null | 'new'>(null)
  const [confirmBrand, setConfirmBrand] = useState<BrandType | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'brands', page, search],
    queryFn: () => fetchBrands(page, search || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/brands/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      setConfirmBrand(null)
      setDeleteError(null)
    },
    onError: (err) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al eliminar la marca'
      setDeleteError(msg)
    },
  })

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Marcas | Petshop</title>
      </Helmet>
      <ConfirmDialog
        open={confirmBrand !== null}
        title="Eliminar marca"
        message={
          confirmBrand
            ? `¿Eliminar "${confirmBrand.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        error={deleteError}
        onConfirm={() => confirmBrand && deleteMutation.mutate(confirmBrand.id)}
        onCancel={() => {
          setConfirmBrand(null)
          setDeleteError(null)
          deleteMutation.reset()
        }}
        loading={deleteMutation.isPending}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Marcas</h1>
        <button
          onClick={() => setModalBrand('new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nueva marca
        </button>
      </div>

      <div className="relative max-w-xs mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-white dark:bg-[#222222] focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
        />
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Logo</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Productos</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {data?.brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-[#222222]">
                    <td className="px-4 py-3">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-[#222222] rounded-lg" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#e8eaf0]">{brand.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-[#8892a4] text-xs">{brand.slug}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{brand._count.products}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalBrand(brand)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmBrand(brand)}
                          className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} marcas)</span>
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

      {modalBrand !== null && (
        <BrandModal
          brand={modalBrand === 'new' ? null : modalBrand}
          onClose={() => setModalBrand(null)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminBrands
