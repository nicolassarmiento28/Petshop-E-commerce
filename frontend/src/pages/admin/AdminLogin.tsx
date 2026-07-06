import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, PawPrint } from 'lucide-react'
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
    <div className="min-h-screen flex bg-white dark:bg-[#0b0f19]">
      <Helmet>
        <title>Admin - Iniciar sesión | Petshop</title>
      </Helmet>

      {/* Panel izquierdo — marca */}
      <div
        className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 to-blue-600 dark:from-blue-900 dark:to-blue-700 p-10"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 text-sm font-medium w-fit"
        >
          <ArrowLeft size={18} />
          Volver a la tienda
        </Link>

        <div className="relative z-10">
          <div className="relative w-fit mb-4">
            <div className="hidden dark:block absolute inset-0 -m-4 rounded-full bg-orange-500/30 blur-2xl" />
            <PawPrint size={48} className="relative text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Panel de administración
          </h2>
          <p className="text-white/80 mt-2 max-w-sm">
            Gestiona productos, órdenes, marcas y cupones de la tienda.
          </p>
        </div>

        <div />
      </div>

      {/* Panel derecho / formulario */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300 text-sm font-medium mb-6"
          >
            <ArrowLeft size={18} />
            Volver a la tienda
          </Link>

          <div className="dark:bg-[#12161f] dark:border dark:border-[#1f2430] dark:rounded-xl dark:p-8">
            <div className="flex items-center gap-2 mb-2">
              <PawPrint size={20} className="text-orange-500 shrink-0" />
              <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">Petshop</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-zinc-100 mb-6">
              Bienvenido de vuelta
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full border border-gray-300 dark:border-[#2a2f3d] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 dark:bg-[#1a1f2b] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full border border-gray-300 dark:border-[#2a2f3d] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 dark:bg-[#1a1f2b] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <p role="alert" className="text-red-500 dark:text-red-400 text-sm">
                  {serverError}
                </p>
              )}

              {import.meta.env.DEV && (
                <details className="rounded-lg bg-gray-100 dark:bg-[#1a1f2b] border border-gray-200 dark:border-[#2a2f3d] p-3 text-xs text-gray-500 dark:text-zinc-400">
                  <summary className="cursor-pointer font-medium">Credenciales de prueba</summary>
                  <p className="font-mono mt-1">admin@petshop.cl / admin123</p>
                </details>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition-colors"
              >
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
