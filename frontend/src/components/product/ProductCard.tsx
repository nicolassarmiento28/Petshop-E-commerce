import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCLP } from '@/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import type { ProductType } from '@/types'

interface ProductCardProps {
  product: ProductType
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useUiStore((s) => s.openCart)
  const hasDiscount = product.salePrice != null && product.salePrice < product.price
  const outOfStock = product.stock === 0

  function handleAddToCart() {
    if (outOfStock) return
    addItem(product, 1)
    toast.success(`${product.name} agregado al carrito`)
    openCart()
  }

  return (
    <div className="group bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2a2a] shadow-sm hover:shadow-md hover:shadow-blue-100/60 dark:hover:shadow-none transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link to={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50 dark:bg-[#222222]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-blue-50 dark:bg-[#222222]">
            🐾
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Oferta
            </span>
          )}
          {outOfStock && (
            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Agotado
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        {product.brand && (
          <div className="h-6 flex items-center">
            {product.brand.logoUrl ? (
              <img
                src={product.brand.logoUrl}
                alt={product.brand.name}
                className="max-h-5 max-w-[80px] w-auto object-contain opacity-60 dark:opacity-80 dark:brightness-150"
              />
            ) : (
              <p className="text-xs text-gray-400 dark:text-[#8892a4] font-medium uppercase tracking-wide">
                {product.brand.name}
              </p>
            )}
          </div>
        )}
        <Link to={`/producto/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-[#e8eaf0] line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                {formatCLP(product.salePrice!)}
              </span>
              <span className="text-xs text-gray-400 dark:text-[#8892a4] line-through">
                {formatCLP(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-[#e8eaf0]">
              {formatCLP(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={cn(
            'mt-2 w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
            outOfStock
              ? 'bg-gray-100 dark:bg-[#222222] text-gray-400 dark:text-[#8892a4] cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95',
          )}
        >
          <ShoppingCart size={15} />
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
