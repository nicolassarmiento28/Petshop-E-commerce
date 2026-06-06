import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/services/api'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
type FormValues = z.infer<typeof schema>

const AdminLogin = () => {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const { data } = await api.post<{ token: string }>('/admin/login', values)
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/dashboard')
    } catch {
      setServerError('Credenciales inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111111]">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-blue-600">🐾</span>
          <span className="text-xl font-bold text-gray-900 dark:text-[#e8eaf0]">Petshop Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#222222] dark:text-[#e8eaf0] dark:placeholder:text-[#8892a4]"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <div className="rounded-lg bg-gray-100 dark:bg-[#222222] border border-gray-200 dark:border-[#2a2a2a] p-3 text-xs text-gray-500 dark:text-[#8892a4] space-y-0.5">
            <p>Credenciales de prueba:</p>
            <p className="font-mono">admin@petshop.cl / admin123</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
