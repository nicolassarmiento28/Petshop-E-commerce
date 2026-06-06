import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb { label: string; href?: string }
interface BreadcrumbsProps { items: Crumb[] }

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#8892a4] mb-4 flex-wrap">
    <Link to="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        <ChevronRight size={14} />
        {item.href ? (
          <Link to={item.href} className="hover:text-orange-500 transition-colors">{item.label}</Link>
        ) : (
          <span className="text-gray-800 dark:text-[#e8eaf0] font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
)
export default Breadcrumbs
