import { Router } from 'express'
import { adminLogin } from '../controllers/adminController'
import { authMiddleware } from '../middleware/authMiddleware'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getTopSellingProducts,
} from '../controllers/adminProductController'
import { getAdminOrders, updateOrderStatus, getOrderStats } from '../controllers/adminOrderController'
import { getRevenue } from '../controllers/adminRevenueController'

const router = Router()

// Public
router.post('/login', adminLogin)

// Protected — products
router.get('/products/low-stock', authMiddleware, getLowStockProducts) // must precede /products/:id
router.get('/products/top-selling', authMiddleware, getTopSellingProducts) // must precede /products/:id
router.get('/products', authMiddleware, getAdminProducts)
router.post('/products', authMiddleware, createProduct)
router.put('/products/:id', authMiddleware, updateProduct)
router.delete('/products/:id', authMiddleware, deleteProduct)

// Protected — orders
router.get('/orders/stats', authMiddleware, getOrderStats)   // must precede any /orders/:id route
router.get('/orders', authMiddleware, getAdminOrders)
router.put('/orders/:id/status', authMiddleware, updateOrderStatus)

// Protected — revenue
router.get('/revenue', authMiddleware, getRevenue)

export default router
