import { Router } from 'express'
import { loginLimiter } from '../middleware/rateLimiter'
import { adminLogin } from '../controllers/adminController'
import { authMiddleware } from '../middleware/authMiddleware'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getTopSellingProducts,
  exportProductsCsv,
  exportProductsXlsx,
} from '../controllers/adminProductController'
import { getAdminOrders, updateOrderStatus, getOrderStats, exportOrdersCsv, exportOrdersXlsx } from '../controllers/adminOrderController'
import { getRevenue } from '../controllers/adminRevenueController'
import { getSalesByCategory, getMonthComparison, getRecentOrdersFeed } from '../controllers/adminAnalyticsController'
import { getBrands, createBrand, updateBrand, deleteBrand, autoAssignBrands } from '../controllers/adminBrandController'
import { getCustomers, exportCustomersCsv, exportCustomersXlsx } from '../controllers/adminCustomerController'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/adminCouponController'

const router = Router()

// Public
router.post('/login', loginLimiter, adminLogin)

// Protected — products
router.get('/products/low-stock', authMiddleware, getLowStockProducts) // must precede /products/:id
router.get('/products/top-selling', authMiddleware, getTopSellingProducts) // must precede /products/:id
router.get('/products', authMiddleware, getAdminProducts)
router.post('/products', authMiddleware, createProduct)
router.put('/products/:id', authMiddleware, updateProduct)
router.get('/products/export/csv', authMiddleware, exportProductsCsv)
router.get('/products/export/xlsx', authMiddleware, exportProductsXlsx)
router.delete('/products/:id', authMiddleware, deleteProduct)

// Protected — analytics
router.get('/analytics/sales-by-category', authMiddleware, getSalesByCategory)
router.get('/analytics/month-comparison', authMiddleware, getMonthComparison)

// Protected — brands
router.get('/brands', authMiddleware, getBrands)
router.post('/brands', authMiddleware, createBrand)
router.put('/brands/:id', authMiddleware, updateBrand)
router.delete('/brands/:id', authMiddleware, deleteBrand)
router.post('/brands/auto-assign', authMiddleware, autoAssignBrands)

// Protected — customers
router.get('/customers/export/csv', authMiddleware, exportCustomersCsv)
router.get('/customers/export/xlsx', authMiddleware, exportCustomersXlsx)
router.get('/customers', authMiddleware, getCustomers)

// Protected — coupons
router.get('/coupons', authMiddleware, getCoupons)
router.post('/coupons', authMiddleware, createCoupon)
router.put('/coupons/:id', authMiddleware, updateCoupon)
router.delete('/coupons/:id', authMiddleware, deleteCoupon)

// Protected — orders (specific routes must precede /orders/:id)
router.get('/orders/recent-feed', authMiddleware, getRecentOrdersFeed)
router.get('/orders/export/csv', authMiddleware, exportOrdersCsv)
router.get('/orders/export/xlsx', authMiddleware, exportOrdersXlsx)
router.get('/orders/stats', authMiddleware, getOrderStats)
router.get('/orders', authMiddleware, getAdminOrders)
router.put('/orders/:id/status', authMiddleware, updateOrderStatus)

// Protected — revenue
router.get('/revenue', authMiddleware, getRevenue)

export default router
