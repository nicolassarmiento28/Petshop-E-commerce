import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Productos', href: '/admin/productos' },
  { label: 'Órdenes', href: '/admin/ordenes' },
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
      <aside className="w-56 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#2a2a2a]">
          <span className="text-lg font-bold text-blue-600">🐾 Petshop</span>
          <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 dark:text-[#e8eaf0] hover:bg-gray-100 dark:hover:bg-[#222222]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-[#8892a4] hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
          >
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
