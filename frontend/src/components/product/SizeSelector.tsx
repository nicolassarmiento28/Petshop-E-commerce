import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import type { ProductVariant } from '@/types'

interface SizeSelectorProps {
  variants: ProductVariant[]
  currentSlug: string
}

function parseKg(label: string): number {
  const num = parseFloat(label.replace(',', '.').replace(/[^0-9.,]/g, ''))
  return isNaN(num) ? 0 : num
}

function formatPrice(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CL')
}

export default function SizeSelector({ variants, currentSlug }: SizeSelectorProps) {
  const navigate = useNavigate()
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const isNavigating = navigatingSlug !== null

  useEffect(() => {
    if (!isNavigating) {
      setShowSpinner(false)
      return
    }
    const timer = setTimeout(() => setShowSpinner(true), 300)
    return () => clearTimeout(timer)
  }, [isNavigating])

  const handleClick = (e: React.MouseEvent, slug: string) => {
    if (slug === currentSlug) return
    e.preventDefault()
    setNavigatingSlug(slug)
    setTimeout(() => navigate(`/producto/${slug}`), 50)
  }

  return (
    <div className="relative">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8892a4] mb-3">
        Seleccionar Peso
      </p>
      <div className="flex flex-col gap-2">
        {variants.map((v) => {
          const isSelected = v.slug === currentSlug
          const outOfStock = v.stock === 0
          const kg = parseKg(v.sizeLabel)
          const displayPrice = v.salePrice ?? v.price
          const pricePerKg = kg > 0 ? formatPrice(displayPrice / kg) : null

          return (
            <Link
              key={v.id}
              to={`/producto/${v.slug}`}
              onClick={(e) => handleClick(e, v.slug)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-700'
              } ${outOfStock ? 'opacity-45 pointer-events-none' : ''} ${
                isNavigating ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {v.imageUrl ? (
                <img src={v.imageUrl} alt={v.sizeLabel} className="w-10 h-10 object-contain rounded-md shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#222222] rounded-md shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-[#e8eaf0]'}`}>
                  {v.sizeLabel}
                </p>
                {pricePerKg && (
                  <p className="text-xs text-gray-400 dark:text-[#8892a4]">
                    {pricePerKg}x KG
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {outOfStock ? (
                  <span className="text-xs text-red-500 font-medium">Sin stock</span>
                ) : v.salePrice ? (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-[#8892a4] line-through">{formatPrice(v.price)}</p>
                    <p className="text-sm font-bold text-orange-500">{formatPrice(v.salePrice)}</p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaf0]">{formatPrice(v.price)}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {showSpinner && (
        <div className="absolute inset-0 bg-white/60 dark:bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <LoaderCircle className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  )
}
