import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/productos', icon: Package },
  { label: 'Órdenes', href: '/admin/ordenes', icon: ShoppingCart },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111111]">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col shrink-0">
        <div className="px-6 py-5 bg-[#2b44d4] dark:bg-[#1e33a8]">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">🐾</span>
            <span className="text-lg font-bold text-white">Petshop</span>
          </Link>
          <p className="text-xs text-blue-200 mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
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
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-[#8892a4] hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto p-8 dark:bg-[#111111]">{children}</main>
    </div>
  )
}

export default AdminLayout
