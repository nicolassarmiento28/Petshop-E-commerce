import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { ProductVariant } from '@/types'

interface SizeSelectorProps {
  variants: ProductVariant[]
  currentSlug: string
}

export default function SizeSelector({ variants, currentSlug }: SizeSelectorProps) {
  if (variants.length <= 1) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8892a4] mb-3">
        Tamaño
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.slug === currentSlug
          const outOfStock = v.stock === 0

          return (
            <Link
              key={v.id}
              to={`/producto/${v.slug}`}
              className={`relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all w-[88px] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-700'
              } ${outOfStock ? 'opacity-45' : ''}`}
            >
              {v.imageUrl ? (
                <img
                  src={v.imageUrl}
                  alt={v.sizeLabel}
                  className="w-12 h-12 object-contain rounded-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 dark:bg-[#222222] rounded-md" />
              )}
              <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-[#e8eaf0]'}`}>
                {v.sizeLabel}
              </span>
              <span className={`text-[11px] ${isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-[#8892a4]'}`}>
                {outOfStock ? 'Sin stock' : `$${v.price.toLocaleString('es-CL')}`}
              </span>
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
