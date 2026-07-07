import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Citas', to: '/admin/veterinaria' },
  { label: 'Servicios', to: '/admin/veterinaria/servicios' },
  { label: 'Disponibilidad', to: '/admin/veterinaria/disponibilidad' },
]

export default function VetSubNav() {
  const location = useLocation()

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-dark-border">
      {TABS.map((tab) => {
        const active = location.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-[#8892a4] hover:text-gray-700 dark:hover:text-[#e8eaf0]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
