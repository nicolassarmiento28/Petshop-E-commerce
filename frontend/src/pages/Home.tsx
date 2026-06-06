import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import BrandsCarousel from '@/components/product/BrandsCarousel'
import { useProducts, useBrands } from '@/hooks/useProducts'

const CATEGORIES = [
  { label: 'Perros', slug: 'perro', emoji: '🐶' },
  { label: 'Gatos', slug: 'gato', emoji: '🐱' },
  { label: 'Farmacia', slug: 'farmacia', emoji: '💊' },
  { label: 'Peluquería', slug: 'peluqueria', emoji: '✂️' },
  { label: 'Ofertas', slug: 'ofertas', emoji: '🏷️' },
  { label: 'Marcas', slug: 'marcas', emoji: '⭐' },
]

const POPULAR_CATEGORIES = ['perro', 'gato', 'farmacia', 'peluqueria'] as const

const CATEGORY_LABELS: Record<string, string> = {
  perro: 'Perros',
  gato: 'Gatos',
  farmacia: 'Farmacia',
  peluqueria: 'Peluquería',
}

export default function Home() {
  // Novedades: newest 8 products overall
  const { data: featuredData, isLoading: loadingFeatured } = useProducts({ sort: 'newest', limit: 8 })
  // Más Vendidos: newest 8 from a random category (chosen once on mount)
  const [randomCategory] = useState(
    () => POPULAR_CATEGORIES[Math.floor(Math.random() * POPULAR_CATEGORIES.length)],
  )
  const { data: bestSellerData, isLoading: loadingBestSellers } = useProducts({
    category: randomCategory,
    sort: 'newest',
    limit: 8,
  })
  const { data: brands } = useBrands()

  const featured = featuredData?.products ?? []
  const bestSellers = bestSellerData?.products ?? []

  return (
    <div className="bg-[#FAFAF8] dark:bg-[#111111] transition-colors duration-300">

      {/* ── 1. Hero ───────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-[#111111] dark:to-[#1a1a1a] overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] gap-4 sm:gap-8">
            <div className="py-8 sm:py-12 max-w-lg flex-1">
              <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 sm:mb-4">
                Tu tienda de mascotas
              </span>
              <h1
                className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-[#e8eaf0] leading-tight mb-3 sm:mb-4"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Todo lo que tu mascota{' '}
                <span className="text-blue-600 dark:text-blue-400">necesita</span>
              </h1>
              <p className="text-gray-600 dark:text-[#8892a4] mb-5 sm:mb-7 leading-relaxed text-sm sm:text-base">
                Alimentos premium, accesorios, farmacia veterinaria y mucho más. Envío a todo Chile.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors shadow-md shadow-blue-200 dark:shadow-none text-sm sm:text-base"
                >
                  Ver productos <ArrowRight size={16} />
                </Link>
                <Link
                  to="/categoria/ofertas"
                  className="inline-flex items-center gap-2 bg-white dark:bg-[#222222] hover:bg-blue-50 dark:hover:bg-[#2a2a2a] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-[#2a2a2a] font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
                >
                  Ver ofertas
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <img
                src="/hero_foto/Banner-Bravery.jpg"
                alt="Perro y gato"
                className="h-[340px] w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Banner principal (despacho) ────────────────────────────── */}
      <section className="w-full">
        <Link to="/productos" className="block w-full hover:opacity-95 transition-opacity">
          <img
            src="/banners/despacho.png"
            alt="Despacho gratis por compras sobre $29.990"
            className="w-full h-auto object-cover"
          />
        </Link>
      </section>

      {/* ── 3. Carrusel de marcas ─────────────────────────────────────── */}
      {brands && brands.length > 0 && (
        <section className="bg-white dark:bg-[#1a1a1a] border-y border-gray-100 dark:border-[#2a2a2a] py-4 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            <BrandsCarousel brands={brands} />
          </div>
        </section>
      )}

      {/* ── 4. Íconos de categorías ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-none transition-all duration-200"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                {cat.emoji}
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center whitespace-pre-line leading-tight transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Banner de marcas destacadas ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <Link to="/categoria/marcas" className="block rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-95 transition-opacity">
          <div className="flex items-center justify-between px-10 py-8">
            <div className="text-white">
              <p className="text-blue-200 dark:text-white text-sm font-medium mb-1">Marcas líderes en nutrición</p>
              <h2
                className="text-3xl font-bold mb-3"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Descubre todas las marcas
              </h2>
              <span className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                Ver todas <ArrowRight size={15} />
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 shrink-0">
              {(brands ?? []).slice(0, 4).map((brand) =>
                brand.logoUrl ? (
                  <div key={brand.slug} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center justify-center">
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-10 max-w-[90px] w-auto object-contain"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </Link>
      </section>

      {/* ── 6. Novedades ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Destacados</p>
            <h2
              className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Novedades
            </h2>
          </div>
          <Link to="/productos" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featured} isLoading={loadingFeatured} />
      </section>

      {/* ── 7. Banners secundarios ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/categoria/perro" className="block rounded-2xl overflow-hidden hover:opacity-95 transition-opacity hover:shadow-lg">
            <img
              src="/banners/exact.jpg"
              alt="Brit Care - Alimento súper premium para perros"
              className="w-full h-full object-cover"
            />
          </Link>

          <Link
            to="/categoria/ofertas"
            className="group relative flex items-center rounded-2xl overflow-hidden px-8 py-8 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] min-h-[200px]"
          >
            <img
              src="/ofertas/churuoferta.jpg"
              alt="Churu oferta"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Sección especial</p>
              <h3 className="text-2xl font-bold text-white mb-1 drop-shadow" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                Ofertas y descuentos
              </h3>
              <p className="text-white/80 text-sm mb-5">Hasta 40% off en productos seleccionados</p>
              <span className="inline-block bg-white text-gray-800 group-hover:bg-orange-500 group-hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                Ver ofertas →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 8. Productos más vendidos ────────────────────────────────── */}
      {(loadingBestSellers || bestSellers.length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">
              Más populares en {CATEGORY_LABELS[randomCategory]}
            </p>
            <h2
              className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Productos más vendidos
            </h2>
          </div>
          <Link
            to={`/categoria/${randomCategory}`}
            className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={bestSellers} isLoading={loadingBestSellers} />
      </section>
      )}
    </div>
  )
}
