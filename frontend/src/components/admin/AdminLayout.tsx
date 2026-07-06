import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, QrCode, LogOut, Menu, X, PawPrint } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/productos', icon: Package },
  { label: 'Órdenes', href: '/admin/ordenes', icon: ShoppingCart },
  { label: 'Marcas', href: '/admin/marcas', icon: Tag },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Cupones', href: '/admin/cupones', icon: Percent },
  { label: 'Código QR', href: '/admin/qr', icon: QrCode },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const sidebar = (
    <aside className="relative w-60 overflow-hidden bg-gradient-to-br from-blue-800 to-blue-600 dark:from-blue-900 dark:to-blue-700 flex flex-col shrink-0 h-full">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 px-6 py-5">
        <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
          <div className="relative w-fit">
            <div className="hidden dark:block absolute inset-0 -m-2 rounded-full bg-orange-500/30 blur-xl" />
            <PawPrint size={24} className="relative text-orange-500 shrink-0" />
          </div>
          <span className="text-lg font-bold text-white">Petshop</span>
        </Link>
        <p className="text-xs text-white/70 mt-0.5">Panel de administración</p>
      </div>

      <nav className="relative z-10 flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              title={item.label}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="relative z-10 px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-white rounded-lg z-10"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 dark:bg-dark-bg min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
