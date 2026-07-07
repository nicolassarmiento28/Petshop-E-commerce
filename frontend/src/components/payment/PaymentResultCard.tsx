import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, XCircle } from 'lucide-react'

const CONFETTI = [
  { left: '8%', delay: '0.1s', color: 'text-orange-500' },
  { left: '22%', delay: '0.3s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '36%', delay: '0.2s', color: 'text-orange-500' },
  { left: '52%', delay: '0.5s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '65%', delay: '0.4s', color: 'text-orange-500' },
  { left: '78%', delay: '0.6s', color: 'text-blue-600 dark:text-blue-400' },
  { left: '90%', delay: '0.7s', color: 'text-orange-500' },
]

export interface DetailRow {
  label: string
  value: ReactNode
}

interface ResultAction {
  label: string
  to?: string
  onClick?: () => void
}

interface PaymentResultCardProps {
  variant: 'success' | 'failed'
  title: string
  identifier?: string
  details?: DetailRow[]
  amountLabel?: string
  amountValue?: ReactNode
  message?: string
  primaryAction: ResultAction
  secondaryAction?: ResultAction
}

function ActionButton({ action, className }: { action: ResultAction; className: string }) {
  if (action.to) {
    return (
      <Link to={action.to} onClick={action.onClick} className={className}>
        {action.label}
      </Link>
    )
  }
  return (
    <button onClick={action.onClick} className={className}>
      {action.label}
    </button>
  )
}

/**
 * Tarjeta de resultado compartida entre el pago de productos (PaymentSuccess/PaymentFailed)
 * y el pago de citas veterinarias (VetAppointmentSuccess/VetAppointmentFailed) — misma
 * animación de entrada y misma estructura visual, solo cambian los datos mostrados.
 */
export default function PaymentResultCard({
  variant,
  title,
  identifier,
  details,
  amountLabel,
  amountValue,
  message,
  primaryAction,
  secondaryAction,
}: PaymentResultCardProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-5 text-center">
      {variant === 'success' ? (
        <>
          {CONFETTI.map((c, i) => (
            <PawPrint
              key={i}
              size={14}
              className={`absolute top-0 animate-fall ${c.color}`}
              style={{ left: c.left, animationDelay: c.delay }}
              aria-hidden="true"
            />
          ))}

          <div className="relative w-24 h-24 mt-2 animate-circle-in">
            <div className="w-24 h-24 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5l5 5L20 6"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-check"
                />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-orange-500 border-2 border-white dark:border-dark-bg flex items-center justify-center animate-stamp">
              <PawPrint size={18} className="text-white" />
            </div>
          </div>
        </>
      ) : (
        <XCircle size={64} className="text-red-500" />
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8eaf0]" style={{ fontFamily: 'Fraunces, serif' }}>
        {title}
      </h1>

      {message && <p className="text-gray-500 dark:text-[#8892a4] text-sm">{message}</p>}
      {identifier && <p className="text-gray-500 dark:text-[#8892a4] text-sm">{identifier}</p>}

      {details && details.length > 0 && (
        <div className="w-full space-y-1.5">
          {details.map((d) => (
            <div key={d.label} className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-[#8892a4]">{d.label}</span>
              <span className="text-gray-800 dark:text-[#e8eaf0] font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {amountValue !== undefined && (
        <div className="w-full flex justify-between items-baseline pt-2">
          <span className="text-sm text-gray-500 dark:text-[#8892a4]">{amountLabel ?? 'Total'}</span>
          <span className="text-2xl font-semibold text-gray-800 dark:text-[#e8eaf0]">{amountValue}</span>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <ActionButton
          action={primaryAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        />
        {secondaryAction && (
          <ActionButton
            action={secondaryAction}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface-elevated dark:hover:bg-dark-border text-gray-700 dark:text-[#e8eaf0] font-semibold px-5 py-3 rounded-xl transition-colors"
          />
        )}
      </div>
    </div>
  )
}
