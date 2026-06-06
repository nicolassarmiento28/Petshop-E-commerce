import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const navigate = useNavigate()

  const handleCheckout = () => {
    navigate('/checkout')
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>Carrito de compras | Petshop</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-8">Tu Carrito</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
          <span className="text-6xl">🐾</span>
          <p className="text-xl text-gray-500 dark:text-[#8892a4] font-medium">Tu carrito está vacío</p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Items list */}
          <div className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] shadow-sm px-6 py-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
            <div className="pt-4">
              <Link
                to="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] shadow-sm px-6 py-5 h-fit">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0] mb-4">Resumen</h2>
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </main>
  )
}
