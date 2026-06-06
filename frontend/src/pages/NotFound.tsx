import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '@/components/layout/Layout'

const NotFound = () => (
  <Layout>
    <Helmet>
      <title>Página no encontrada | Petshop</title>
    </Helmet>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-[#8892a4] mb-8">Página no encontrada</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
        Volver al inicio
      </Link>
    </div>
  </Layout>
)
export default NotFound
