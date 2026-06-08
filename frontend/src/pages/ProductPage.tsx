import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react'
import { toast } from 'sonner'
import { formatCLP } from '@/utils/formatters'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductGrid from '@/components/product/ProductGrid'
import SizeSelector from '@/components/product/SizeSelector'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug ?? '')
  const { data: related = [] } = useRelatedProducts(slug ?? '')
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useUiStore((s) => s.openCart)
  const [selectedThumb, setSelectedThumb] = useState(0)
  const [qty, setQty] = useState(1)

  const serifStyle = { fontFamily: "'Fraunces', Georgia, serif" } as const

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-[#111111]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div>
            <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl mb-3" />
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded w-24" />
            <div className="h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded w-3/4" />
            <div className="h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded w-1/3" />
            <div className="h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded" />
            <div className="h-12 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center dark:bg-[#111111]">
        <p className="text-6xl mb-4">🐾</p>
        <h2
          className="text-2xl font-bold text-gray-800 dark:text-[#e8eaf0] mb-2"
          style={serifStyle}
        >
          Producto no encontrado
        </h2>
        <p className="text-gray-500 dark:text-[#8892a4] mb-6">No pudimos encontrar este producto.</p>
        <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price
  const isOnSale = !!product.salePrice && product.salePrice < product.price
  const outOfStock = product.stock === 0

  const thumbImage = product.imageUrl

  const decrement = () => setQty((q) => Math.max(1, q - 1))
  const increment = () => setQty((q) => Math.min(product.stock, q + 1))

  const handleAddToCart = () => {
    if (!outOfStock) {
      addItem(product, qty)
      toast.success(`${product.name} agregado al carrito`)
      openCart()
      setQty(1)
    }
  }

  const stock =
    product.stock === 0
      ? { text: 'Sin stock', className: 'text-red-500' }
      : product.stock <= 5
        ? { text: `Solo ${product.stock} unidades`, className: 'text-orange-500' }
        : { text: `${product.stock} unidades disponibles`, className: 'text-gray-500 dark:text-[#8892a4]' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-[#111111]">
      <Helmet>
        <title>{product.name} | Petshop</title>
        <meta name="description" content={product.description ? product.description.slice(0, 160) : `${product.name} en Petshop`} />
      </Helmet>

      <Breadcrumbs
        items={[
          ...(product.category ? [{ label: product.category.name, href: `/categoria/${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left — image + thumbnail strip */}
        <div>
          <div className="aspect-square bg-blue-50 dark:bg-[#1a1a1a] rounded-3xl overflow-hidden mb-3">
            {thumbImage ? (
              <img
                src={thumbImage}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8rem]">🐾</div>
            )}
          </div>
          {/* Thumbnail strip — 4 slots, all same image */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setSelectedThumb(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedThumb === i ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                {thumbImage ? (
                  <img src={thumbImage} alt={`${product.name} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-50 dark:bg-[#1a1a1a] flex items-center justify-center text-2xl">🐾</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — product info */}
        <div className="flex flex-col gap-5">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8892a4]">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0] leading-tight"
            style={serifStyle}
          >
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-blue-600">{formatCLP(displayPrice)}</span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 dark:text-[#8892a4] line-through">{formatCLP(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Oferta
                </span>
              </>
            )}
          </div>

          {product.variants && product.variants.length > 1 && (
            <SizeSelector variants={product.variants} currentSlug={product.slug} />
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.isFeatured && (
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Destacado
              </span>
            )}
            {product.category && (
              <span className="bg-gray-100 dark:bg-[#222222] text-gray-600 dark:text-[#e8eaf0] text-xs font-semibold px-2.5 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 dark:text-[#e8eaf0] leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm ${stock.className}`}>
            <Package size={15} />
            <span>{stock.text}</span>
          </div>

          {/* Quantity selector + Add to cart */}
          <div className="flex flex-col gap-3 mt-2">
            {/* Qty selector */}
            <div className="flex items-center border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden dark:bg-[#222222]">
                <button
                  onClick={decrement}
                  disabled={outOfStock || qty <= 1}
                  className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-800 dark:text-[#e8eaf0] py-3">{qty}</span>
                <button
                  onClick={increment}
                  disabled={outOfStock || qty >= product.stock}
                  className="px-4 py-3 text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                +
                </button>
              </div>

            <button
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors active:scale-95"
            >
              <ShoppingCart size={18} />
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6"
            style={serifStyle}
          >
            También te puede interesar
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
