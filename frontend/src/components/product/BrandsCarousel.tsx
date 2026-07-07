import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BrandType } from '@/types'

interface BrandsCarouselProps {
  brands: BrandType[]
}

const SCROLL_AMOUNT = 320

export default function BrandsCarousel({ brands }: BrandsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [brands])

  function scroll(dir: 'left' | 'right') {
    trackRef.current?.scrollBy({
      left: dir === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-label="Anterior"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4
          w-9 h-9 rounded-full bg-white dark:bg-dark-surface-elevated shadow-md border border-gray-200 dark:border-dark-border
          flex items-center justify-center text-gray-600 dark:text-[#8892a4]
          hover:bg-blue-600 dark:hover:bg-dark-surface-elevated hover:text-white hover:border-blue-600
          disabled:opacity-0 disabled:pointer-events-none
          transition-all duration-200"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex items-center gap-10 overflow-x-auto scroll-smooth px-2 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            to={`/categoria/marcas?brand=${brand.slug}`}
            title={brand.name}
            className="shrink-0 flex items-center justify-center h-14 opacity-50 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                loading="lazy"
                className="max-h-12 max-w-[130px] w-auto object-contain"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        aria-label="Siguiente"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4
          w-9 h-9 rounded-full bg-white dark:bg-dark-surface-elevated shadow-md border border-gray-200 dark:border-dark-border
          flex items-center justify-center text-gray-600 dark:text-[#8892a4]
          hover:bg-blue-600 dark:hover:bg-dark-surface-elevated hover:text-white hover:border-blue-600
          disabled:opacity-0 disabled:pointer-events-none
          transition-all duration-200"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
