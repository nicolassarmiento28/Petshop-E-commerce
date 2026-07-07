import { useEffect, useRef } from 'react'
import { X, PawPrint } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  // Fix 1 — Escape key closes drawer
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Fix 2 — Move focus into panel when opened
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
    }
  }, [open])

  // Fix 3 — Focus trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => !el.hasAttribute('disabled'))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay — Fix 4: z-40 */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Panel — z-50 */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-dark-bg z-50 flex flex-col shadow-2xl transition-transform duration-300 outline-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">
            <PawPrint size={20} className="text-orange-500 shrink-0" />
            Tu carrito
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-[#e8eaf0] dark:hover:bg-dark-surface-elevated rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
            <PawPrint size={40} className="text-gray-300 dark:text-gray-600 opacity-60" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tu carrito está vacío</p>
            <Link
              to="/productos"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold text-sm transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Items — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Summary — sticky bottom */}
            <CartSummary onCheckout={handleCheckout} />
          </>
        )}
      </div>
    </>
  )
}
