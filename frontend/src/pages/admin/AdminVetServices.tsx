import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AdminLayout from '@/components/admin/AdminLayout'
import VetSubNav from '@/components/admin/VetSubNav'
import { formatCLP } from '@/utils/formatters'
import { useAdminVetServices, useCreateVetService, useUpdateVetService } from '@/hooks/useAdminVet'
import type { VetServiceType } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  durationMin: z.coerce.number().int().positive('Debe ser mayor a 0'),
  price: z.coerce.number().positive('Debe ser mayor a 0'),
})
type ServiceFormValues = z.infer<typeof serviceSchema>

const inputClass =
  'w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface-elevated dark:text-[#e8eaf0]'

function ServiceModal({ service, onClose }: { service: VetServiceType | null; onClose: () => void }) {
  const isEdit = service !== null
  const createMutation = useCreateVetService()
  const updateMutation = useUpdateVetService()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: isEdit
      ? { name: service.name, description: service.description ?? '', durationMin: service.durationMin, price: service.price }
      : { durationMin: 30 },
  })

  const onSubmit = (values: ServiceFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: service.id, data: values }, { onSuccess: onClose })
    } else {
      createMutation.mutate(values, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">
            {isEdit ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[#8892a4] dark:hover:text-[#e8eaf0] text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Nombre *</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Descripción</label>
            <textarea {...register('description')} rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Duración (min) *</label>
              <input type="number" {...register('durationMin')} className={inputClass} />
              {errors.durationMin && <p className="text-red-500 text-xs mt-1">{errors.durationMin.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Precio *</label>
              <input type="number" {...register('price')} className={inputClass} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>
          {mutation.isError && <p className="text-red-500 text-sm">Error al guardar. Intenta de nuevo.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminVetServices() {
  const { data: services, isLoading } = useAdminVetServices()
  const [modalService, setModalService] = useState<VetServiceType | null | 'new'>(null)
  const updateMutation = useUpdateVetService()

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Veterinaria | Petshop</title>
      </Helmet>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]">Veterinaria</h1>
        <button
          onClick={() => setModalService('new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nuevo servicio
        </button>
      </div>
      <VetSubNav />

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
        {isLoading ? (
          <p className="p-6 text-gray-500 dark:text-[#8892a4]">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-dark-surface-elevated text-gray-500 dark:text-[#8892a4] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Duración</th>
                  <th className="px-4 py-3 text-left">Precio</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {services?.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-elevated">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-[#e8eaf0]">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-400 dark:text-[#8892a4]">{service.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{service.durationMin} min</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-[#e8eaf0]">{formatCLP(service.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          service.isActive
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-[#0f2b1a] dark:text-green-400 dark:border-[#164028]'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-surface-elevated dark:text-gray-400 dark:border-dark-border'
                        }`}
                      >
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalService(service)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: service.id, data: { isActive: !service.isActive } })}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-dark-surface-elevated transition-colors"
                        >
                          {service.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 dark:text-[#8892a4]">
                      No hay servicios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalService !== null && (
        <ServiceModal service={modalService === 'new' ? null : modalService} onClose={() => setModalService(null)} />
      )}
    </AdminLayout>
  )
}
