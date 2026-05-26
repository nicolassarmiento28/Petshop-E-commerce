import { Trash2, Minus, Plus } from 'lucide-react'
import type { CartItemType } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatCLP } from '@/utils/formatters'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const handleDecrement = () => {
    if (item.quantity === 1) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl" aria-hidden="true">🐾</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-[#e8eaf0] truncate">{item.name}</p>
        <p className="text-sm text-blue-600 font-semibold mt-0.5">{formatCLP(item.unitPrice)}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#8892a4] hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-medium text-gray-800 dark:text-[#e8eaf0]">{item.quantity}</span>
        <button
          onClick={handleIncrement}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#8892a4] hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeItem(item.id)}
        className="p-1.5 text-gray-400 dark:text-[#8892a4] hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
        aria-label="Eliminar producto"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
