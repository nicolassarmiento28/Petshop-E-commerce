import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search, User, Sun, Moon, Pill } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import { useUiStore } from '@/store/uiStore'
import CartDrawer from '@/components/cart/CartDrawer'

const NAV_LINKS = [
  { label: 'Todos los productos', to: '/productos' },
  { label: 'Perro', to: '/categoria/perro' },
  { label: 'Gato', to: '/categoria/gato' },
  { label: 'Farmacia', to: '/categoria/farmacia', icon: Pill },
  { label: 'Peluquería', to: '/categoria/peluqueria' },
  { label: 'Ofertas', to: '/categoria/ofertas' },
  { label: 'Marcas', to: '/categoria/marcas' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const { theme, toggle } = useThemeStore()
  const { cartOpen, openCart, closeCart } = useUiStore()
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchQuery('')
    setMobileOpen(false)
    navigate(`/productos?search=${encodeURIComponent(q)}`)
  }

  return (
    <>
      {/* Top info bar */}
      <div className="bg-[#2b44d4] dark:bg-[#1e33a8] text-white text-xs py-1.5 hidden sm:block transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>Envío a todo Chile · Lunes a Sábado</span>
          <span>contacto@petshop.cl · +56 9 1234 5678</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">🐾</span>
              <span
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-[#e8eaf0] tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Petshop
              </span>
            </Link>

            {/* Search bar — center, grows */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex items-center">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas..."
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-[#2a2a2a] rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-gray-50 dark:bg-[#222222] focus:bg-white dark:focus:bg-[#111111] focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto sm:ml-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] rounded-lg transition-colors"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="/admin"
                className="hidden sm:flex p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] rounded-lg transition-colors"
                aria-label="Mi cuenta"
              >
                <User size={20} />
              </Link>

              <button
                onClick={() => openCart()}
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-gray-700 dark:text-[#e8eaf0] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] rounded-lg transition-colors"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile search button */}
              <button
                className="sm:hidden p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] rounded-lg transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              <button
                className="lg:hidden p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] rounded-lg transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Desktop nav links strip */}
          <nav className="hidden lg:flex items-center gap-1 border-t border-gray-100 dark:border-[#2a2a2a] py-1.5 overflow-x-auto">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  item.label === 'Ofertas'
                    ? 'text-gray-600 dark:text-white hover:text-white hover:bg-red-500'
                    : 'text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222]'
                }`}
              >
                {item.icon && <item.icon size={14} className="inline mr-1" />}
                {item.label}
              </Link>
          ))}
        </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-[#2a2a2a] rounded-xl outline-none focus:border-blue-400 bg-gray-50 dark:bg-[#222222] text-gray-700 dark:text-[#e8eaf0] placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
                />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Search size={16} />
                </button>
              </form>
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-[#e8eaf0] rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#222222] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon && <item.icon size={14} className="inline mr-1.5" />}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  )
}
