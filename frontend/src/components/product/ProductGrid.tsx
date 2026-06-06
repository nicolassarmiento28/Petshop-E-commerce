import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import type { ProductType } from '@/types'

interface ProductGridProps {
  products?: ProductType[]
  isLoading?: boolean
  emptyMessage?: string
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2a2a] animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-[#222222]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 dark:bg-[#222222] rounded w-1/3" />
        <div className="h-4 bg-gray-100 dark:bg-[#222222] rounded w-full" />
        <div className="h-4 bg-gray-100 dark:bg-[#222222] rounded w-3/4" />
        <div className="h-8 bg-gray-100 dark:bg-[#222222] rounded-xl mt-2" />
      </div>
    </div>
  )
}

export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No se encontraron productos.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🐾</p>
        <p className="text-gray-500 dark:text-[#8892a4] text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  )
}
