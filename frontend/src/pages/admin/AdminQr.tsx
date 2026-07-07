import { Helmet } from 'react-helmet-async'
import { Download } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminQr() {
  const qrUrl = '/qr-petshop.png'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = 'qr-petshop.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin - Código QR | Petshop</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0] mb-6">Código QR</h1>
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 max-w-md">
        <img
          src={qrUrl}
          alt="Código QR Petshop"
          className="w-full aspect-square object-contain mb-6"
        />
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <Download size={18} />
          Descargar QR
        </button>
      </div>
    </AdminLayout>
  )
}
