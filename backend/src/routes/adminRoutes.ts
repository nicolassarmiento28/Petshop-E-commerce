import { Router } from 'express'
import { adminLogin } from '../controllers/adminController'
import { authMiddleware } from '../middleware/authMiddleware'
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../controllers/adminProductController'
import { getAdminOrders, updateOrderStatus, getOrderStats } from '../controllers/adminOrderController'

const router = Router()

// Public
router.post('/login', adminLogin)

// Protected — products
router.get('/products', authMiddleware, getAdminProducts)
router.post('/products', authMiddleware, createProduct)
router.put('/products/:id', authMiddleware, updateProduct)
router.delete('/products/:id', authMiddleware, deleteProduct)

// Protected — orders
router.get('/orders/stats', authMiddleware, getOrderStats)   // ← BEFORE /orders/:id
router.get('/orders', authMiddleware, getAdminOrders)
router.put('/orders/:id/status', authMiddleware, updateOrderStatus)

export default router
