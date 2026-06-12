import { LoaderCircle } from 'lucide-react'

export default function PageLoader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoaderCircle size={40} className="text-blue-600 animate-spin" />
      <p className="text-sm text-gray-500 dark:text-[#8892a4]">{text}</p>
    </div>
  )
}
