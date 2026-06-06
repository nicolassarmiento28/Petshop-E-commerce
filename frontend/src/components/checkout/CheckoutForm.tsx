import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from './checkoutSchema'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isSubmitting: boolean
}

const inputBase =
  'w-full border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-[#222222] text-gray-900 dark:text-[#e8eaf0] placeholder:text-gray-400 dark:placeholder:text-[#8892a4]'
const inputError = 'border-red-400'

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* customerName */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Nombre completo
        </label>
        <input
          id="customerName"
          type="text"
          className={`${inputBase} ${errors.customerName ? inputError : ''}`}
          {...register('customerName')}
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
        )}
      </div>

      {/* customerEmail */}
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Correo electrónico
        </label>
        <input
          id="customerEmail"
          type="email"
          className={`${inputBase} ${errors.customerEmail ? inputError : ''}`}
          {...register('customerEmail')}
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
        )}
      </div>

      {/* customerPhone */}
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Teléfono (opcional)
        </label>
        <input
          id="customerPhone"
          type="tel"
          className={`${inputBase} ${errors.customerPhone ? inputError : ''}`}
          {...register('customerPhone')}
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
        )}
      </div>

      {/* shippingAddress */}
      <div>
        <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
          Dirección de envío
        </label>
        <input
          id="shippingAddress"
          type="text"
          className={`${inputBase} ${errors.shippingAddress ? inputError : ''}`}
          {...register('shippingAddress')}
        />
        {errors.shippingAddress && (
          <p className="text-red-500 text-sm mt-1">{errors.shippingAddress.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
      >
        {isSubmitting ? 'Procesando…' : 'Confirmar pedido'}
      </button>

      {import.meta.env.DEV && (
        <div className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-xs text-yellow-800 dark:text-yellow-300 space-y-1">
          <p className="font-semibold">🧪 Datos de tarjeta de prueba</p>
          <p>Número: <span className="font-mono">4051 8856 0044 6623</span></p>
          <p>Vencimiento: <span className="font-mono">12/26</span> · CVV: <span className="font-mono">123</span></p>
          <p>RUT: <span className="font-mono">11.111.111-1</span> · Clave: <span className="font-mono">123</span></p>
        </div>
      )}
    </form>
  )
}
