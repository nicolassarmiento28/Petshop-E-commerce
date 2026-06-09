import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, LogOut, Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/productos', icon: Package },
  { label: 'Órdenes', href: '/admin/ordenes', icon: ShoppingCart },
  { label: 'Marcas', href: '/admin/marcas', icon: Tag },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Cupones', href: '/admin/cupones', icon: Percent },
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
    <aside className="w-60 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col shrink-0 h-full">
      <div className="px-6 py-5 bg-[#2b44d4] dark:bg-[#1e33a8]">
        <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
          <span className="text-lg font-bold text-white">🐾</span>
          <span className="text-lg font-bold text-white">Petshop</span>
        </Link>
        <p className="text-xs text-blue-200 mt-0.5">Panel de administración</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-100 dark:hover:bg-[#222222]'
              }`}
            >
              <item.icon size={18} className={active ? 'text-blue-600 dark:text-blue-400' : ''} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 dark:border-[#2a2a2a]">
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-[#8892a4] hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111111]">
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
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 dark:bg-[#111111] min-w-0">
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
