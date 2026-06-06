import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { formatCLP } from '@/utils/formatters'
import api from '@/services/api'

interface CouponType {
  id: number
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchase: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

interface CouponsResponse {
  coupons: CouponType[]
  total: number
  page: number
  totalPages: number
}

const fetchCoupons = (page: number, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)
  return api.get<CouponsResponse>(`/admin/coupons?${params.toString()}`).then((r) => r.data)
}

// ── Form schema ────────────────────────────────────────────────────────────────
const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[A-Za-z0-9]+$/, 'Solo letras y números'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive('Debe ser positivo'),
  minPurchase: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().optional(),
  ),
  maxUses: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
  expiresAt: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().optional(),
  ),
})

type CouponFormValues = z.infer<typeof couponSchema>

// ── Modal ──────────────────────────────────────────────────────────────────────
interface CouponModalProps {
  coupon: CouponType | null
  onClose: () => void
}

const inputClass = 'w-full border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]'

const CouponModal = ({ coupon, onClose }: CouponModalProps) => {
  const queryClient = useQueryClient()
  const isEdit = coupon !== null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: isEdit
      ? {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase ?? undefined,
          maxUses: coupon.maxUses ?? undefined,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : undefined,
        }
      : { discountType: 'PERCENTAGE' },
  })

  const mutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      isEdit
        ? api.put(`/admin/coupons/${coupon.id}`, values)
        : api.post('/admin/coupons', values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">
            {isEdit ? 'Editar cupón' : 'Nuevo cupón'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[#8892a4] dark:hover:text-[#e8eaf0] text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Código *</label>
            <input {...register('code')} className={inputClass} placeholder="Ej: BIENVENIDO10" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>
          {/* Discount Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Tipo *</label>
              <select {...register('discountType')} className={inputClass}>
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Monto fijo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Valor *</label>
              <input type="number" {...register('discountValue')} className={inputClass} placeholder="Ej: 10 o 5000" />
              {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue.message}</p>}
            </div>
          </div>
          {/* Min Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Compra mínima (CLP)</label>
            <input type="number" {...register('minPurchase')} className={inputClass} placeholder="Opcional" />
          </div>
          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Usos máximos</label>
            <input type="number" {...register('maxUses')} className={inputClass} placeholder="Opcional" />
          </div>
          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Fecha de vencimiento</label>
            <input type="date" {...register('expiresAt')} className={inputClass} />
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

// ── Main page ──────────────────────────────────────────────────────────────────
const AdminCoupons = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalCoupon, setModalCoupon] = useState<CouponType | null | 'new'>(null)
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
    queryKey: ['admin', 'coupons', page, search],
    queryFn: () => fetchCoupons(page, search || undefined),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.put(`/admin/coupons/${id}`, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
  })

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Cupones | Petshop</title>
      </Helmet>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Cupones</h1>
        <button
          onClick={() => setModalCoupon('new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nuevo cupón
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xs mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por código..."
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
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Valor</th>
                  <th className="px-4 py-3 text-left">Mínimo</th>
                  <th className="px-4 py-3 text-left">Usos / Límite</th>
                  <th className="px-4 py-3 text-left">Vence</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {data?.coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-[#222222]">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#e8eaf0]">{coupon.code}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      {coupon.discountType === 'PERCENTAGE' ? '%' : '$'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}%`
                        : formatCLP(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      {coupon.minPurchase ? formatCLP(coupon.minPurchase) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0]">
                      <span className={isExpired(coupon.expiresAt) ? 'text-red-500' : ''}>
                        {formatExpiry(coupon.expiresAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        coupon.isActive && !isExpired(coupon.expiresAt)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {coupon.isActive && !isExpired(coupon.expiresAt) ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalCoupon(coupon)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })
                          }
                          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                            coupon.isActive
                              ? 'border-red-200 text-red-500 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {coupon.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-sm text-gray-500 dark:text-[#8892a4]">
                <span>Página {data.page} de {data.totalPages} ({data.total} cupones)</span>
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

      {modalCoupon !== null && (
        <CouponModal
          coupon={modalCoupon === 'new' ? null : modalCoupon}
          onClose={() => setModalCoupon(null)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminCoupons
