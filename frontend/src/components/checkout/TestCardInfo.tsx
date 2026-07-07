import { CreditCard } from 'lucide-react'

const TEST_CARD = {
  number: '4051 8856 0044 6623',
  expiry: '12/26',
  cvv: '123',
  rut: '11.111.111-1',
  clave: '123',
}

export function TestCardInfo() {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-[#453410] bg-amber-50 dark:bg-[#241d0d] p-3 text-xs text-amber-700 dark:text-[#d4a017] space-y-1">
      <p className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-400">
        <CreditCard size={14} />
        Datos de tarjeta de prueba
      </p>
      <p>Número: <span className="font-mono">{TEST_CARD.number}</span></p>
      <p>Vencimiento: <span className="font-mono">{TEST_CARD.expiry}</span> · CVV: <span className="font-mono">{TEST_CARD.cvv}</span></p>
      <p>RUT: <span className="font-mono">{TEST_CARD.rut}</span> · Clave: <span className="font-mono">{TEST_CARD.clave}</span></p>
    </div>
  )
}
