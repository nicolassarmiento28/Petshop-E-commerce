import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

export default function PageLoader({ isLoading, text = 'Cargando...', delay = 300 }: { isLoading: boolean; text?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [isLoading, delay])

  if (!visible) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoaderCircle size={40} className="text-blue-600 animate-spin" />
      <p className="text-sm text-gray-500 dark:text-[#8892a4]">{text}</p>
    </div>
  )
}
