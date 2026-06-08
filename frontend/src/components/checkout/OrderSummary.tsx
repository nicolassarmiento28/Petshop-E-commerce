import { useCartStore } from '@/store/cartStore'
import { formatCLP } from '@/utils/formatters'
import type { CouponValidation } from '@/types'

interface OrderSummaryProps {
  couponCode: string
  onCouponCodeChange: (code: string) => void
  validating: boolean
  couponResult: CouponValidation | null
  couponError: string | null
  onValidateCoupon: () => void
  discountAmount: number
  finalTotal: number
}

export default function OrderSummary({
  couponCode,
  onCouponCodeChange,
  validating,
  couponResult,
  couponError,
  onValidateCoupon,
  discountAmount,
  finalTotal,
}: OrderSummaryProps) {
  const items = useCartStore((s) => s.items)

  return (
    <div className="lg:w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0] mb-4">Resumen del pedido</h2>

      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-[#2a2a2a]">
        <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-2">Cupón de descuento</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value)}
            placeholder="Código"
            className="min-w-0 flex-1 px-3 py-2 border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-sm bg-white dark:bg-[#222222] text-gray-900 dark:text-[#e8eaf0] focus:outline-none focus:border-blue-400 transition-colors"
          />
          <button
            onClick={onValidateCoupon}
            disabled={validating || !couponCode.trim()}
            className="shrink-0 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {validating ? '...' : 'Validar'}
          </button>
        </div>
        {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
        {couponResult?.valid && (
          <p className="text-green-600 text-xs mt-1">
            Cupón aplicado: {couponResult.discountType === 'PERCENTAGE' ? `${couponResult.discountValue}%` : formatCLP(couponResult.discountValue)} de descuento
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-4">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-[#e8eaf0]">
            <span className="flex-1 pr-2">
              {item.name}
              <span className="text-gray-400 dark:text-[#8892a4]"> × {item.quantity}</span>
            </span>
            <span className="font-medium whitespace-nowrap">
              {formatCLP(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <hr className="border-gray-100 dark:border-[#2a2a2a] mb-4" />
      {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-green-600 mb-2">
          <span>Descuento</span>
          <span>-{formatCLP(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-gray-800 dark:text-[#e8eaf0]">
        <span>Total</span>
        <span className="text-blue-600">{formatCLP(finalTotal)}</span>
      </div>
    </div>
  )
}
