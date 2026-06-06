import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import CategoryPage from '@/pages/CategoryPage'
import ProductPage from '@/pages/ProductPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PaymentReturn from '@/pages/PaymentReturn'
import PaymentSuccess from '@/pages/PaymentSuccess'
import PaymentFailed from '@/pages/PaymentFailed'
import AllProductsPage from '@/pages/AllProductsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import ReturnsPage from '@/pages/ReturnsPage'
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminBrands from '@/pages/admin/AdminBrands'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminCoupons from '@/pages/admin/AdminCoupons'
import PrivateRoute from '@/components/admin/PrivateRoute'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout><Home /></Layout>} path="/" />
        <Route element={<Layout><CategoryPage /></Layout>} path="/categoria/:slug" />
        <Route element={<Layout><CategoryPage /></Layout>} path="/categoria/:slug/:sub" />
        <Route element={<Layout><ProductPage /></Layout>} path="/producto/:slug" />
        <Route element={<Layout><CartPage /></Layout>} path="/carrito" />
        <Route element={<Layout><CheckoutPage /></Layout>} path="/checkout" />
        <Route element={<Layout><PaymentReturn /></Layout>} path="/pago/retorno" />
        <Route element={<Layout><PaymentSuccess /></Layout>} path="/pago/exito" />
        <Route element={<Layout><PaymentFailed /></Layout>} path="/pago/fallido" />
        <Route element={<Layout><AllProductsPage /></Layout>} path="/productos" />
        <Route element={<PrivacyPage />} path="/privacidad" />
        <Route element={<TermsPage />} path="/terminos" />
        <Route element={<ReturnsPage />} path="/devoluciones" />
        {/* Admin routes (no public layout) */}
        <Route element={<AdminLogin />} path="/admin" />
        <Route element={<PrivateRoute><AdminDashboard /></PrivateRoute>} path="/admin/dashboard" />
        <Route element={<PrivateRoute><AdminProducts /></PrivateRoute>} path="/admin/productos" />
        <Route element={<PrivateRoute><AdminOrders /></PrivateRoute>} path="/admin/ordenes" />
        <Route element={<PrivateRoute><AdminBrands /></PrivateRoute>} path="/admin/marcas" />
        <Route element={<PrivateRoute><AdminCustomers /></PrivateRoute>} path="/admin/clientes" />
        <Route element={<PrivateRoute><AdminCoupons /></PrivateRoute>} path="/admin/cupones" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
