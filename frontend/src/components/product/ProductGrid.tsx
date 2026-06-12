import { motion } from 'framer-motion'
import { LoaderCircle, PawPrint } from 'lucide-react'
import ProductCard from './ProductCard'
import type { ProductType } from '@/types'

interface ProductGridProps {
  products?: ProductType[]
  isLoading?: boolean
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No se encontraron productos.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <LoaderCircle size={36} className="text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-[#8892a4]">Cargando productos...</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-4"><PawPrint size={48} className="text-orange-500" /></div>
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
