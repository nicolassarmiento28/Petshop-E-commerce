import { useCartStore } from '@/store/cartStore'
import { formatCLP } from '@/utils/formatters'

interface CartSummaryProps {
  onCheckout: () => void
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const items = useCartStore((s) => s.items)
  const totalPrice = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0)
  const isEmpty = items.length === 0

  return (
    <div className="bg-blue-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-5 pt-4 pb-6 space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
        <span className="text-lg font-medium text-gray-900 dark:text-zinc-100">{formatCLP(totalPrice)}</span>
      </div>
      <button
        onClick={onCheckout}
        disabled={isEmpty}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Ir al checkout
      </button>
    </div>
  )
}
