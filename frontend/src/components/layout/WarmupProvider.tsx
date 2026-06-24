import { useState, useEffect } from 'react'
import { LoaderCircle, Wifi, WifiOff } from 'lucide-react'
import api from '@/services/api'

export default function WarmupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(
    sessionStorage.getItem('warmed_up') ? 'ready' : 'loading'
  )

  useEffect(() => {
    if (state !== 'loading') return

    const controller = new AbortController()
    let cancelled = false

    api.get('/health', { signal: controller.signal, timeout: 60000 })
      .then(() => {
        if (!cancelled) {
          sessionStorage.setItem('warmed_up', 'true')
          setState('ready')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState('error')
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [state])

  if (state === 'ready') return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#111111] gap-5 px-4">
      {state === 'loading' ? (
        <>
          <LoaderCircle size={48} className="text-blue-600 animate-spin" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0]">
              Conectando con el servidor...
            </p>
            <p className="text-sm text-gray-500 dark:text-[#8892a4] mt-1">
              Esto puede tomar unos segundos la primera vez
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20">
            <WifiOff size={40} className="text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0]">
              No se pudo conectar con el servidor
            </p>
            <p className="text-sm text-gray-500 dark:text-[#8892a4] mt-1 mb-4">
              Verifica que el backend esté funcionando
            </p>
            <button
              onClick={() => setState('loading')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <Wifi size={16} />
              Reintentar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
