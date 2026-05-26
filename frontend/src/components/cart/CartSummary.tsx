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
    <div className="border-t border-gray-100 dark:border-[#2a2a2a] pt-4 space-y-3">
      <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-[#e8eaf0]">
        <span>Total</span>
        <span className="text-blue-600">{formatCLP(totalPrice)}</span>
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
