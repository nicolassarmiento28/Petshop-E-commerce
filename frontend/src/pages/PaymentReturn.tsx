export default function PaymentReturn() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm p-8 max-w-md w-full mx-auto mt-20 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <div>
          <p className="text-lg font-semibold text-gray-800 dark:text-[#e8eaf0]">Procesando tu pago…</p>
          <p className="text-sm text-gray-500 dark:text-[#8892a4] mt-1">No cierres esta ventana.</p>
        </div>
      </div>
    </div>
  )
}
