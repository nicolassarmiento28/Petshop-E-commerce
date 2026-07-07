import { Router } from 'express'
import { loginLimiter } from '../middleware/rateLimiter'
import { adminLogin } from '../controllers/adminController'
import { authMiddleware } from '../middleware/authMiddleware'
import { validateRequest } from '../middleware/validateRequest'
import {
  adminLoginSchema,
  updateProductSchema,
  updateBrandSchema,
  updateCouponSchema,
  updateOrderStatusSchema,
  createVetServiceSchema,
  updateVetServiceSchema,
  createVetAvailabilitySchema,
  createVetExceptionSchema,
  updateAppointmentStatusSchema,
} from '../schemas'
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
import {
  getVetServices,
  createVetService,
  updateVetService,
  deleteVetService,
  getVetAvailability,
  createVetAvailability,
  getVetExceptions,
  createVetException,
  deleteVetException,
  getAdminAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
} from '../controllers/adminVetController'

const router = Router()

// Public
router.post('/login', loginLimiter, validateRequest(adminLoginSchema), adminLogin)

// Protected — products
router.get('/products/low-stock', authMiddleware, getLowStockProducts) // must precede /products/:id
router.get('/products/top-selling', authMiddleware, getTopSellingProducts) // must precede /products/:id
router.get('/products', authMiddleware, getAdminProducts)
router.post('/products', authMiddleware, createProduct)
router.put('/products/:id', authMiddleware, validateRequest(updateProductSchema), updateProduct)
router.get('/products/export/csv', authMiddleware, exportProductsCsv)
router.get('/products/export/xlsx', authMiddleware, exportProductsXlsx)
router.delete('/products/:id', authMiddleware, deleteProduct)

// Protected — analytics
router.get('/analytics/sales-by-category', authMiddleware, getSalesByCategory)
router.get('/analytics/month-comparison', authMiddleware, getMonthComparison)

// Protected — brands
router.get('/brands', authMiddleware, getBrands)
router.post('/brands', authMiddleware, createBrand)
router.put('/brands/:id', authMiddleware, validateRequest(updateBrandSchema), updateBrand)
router.delete('/brands/:id', authMiddleware, deleteBrand)
router.post('/brands/auto-assign', authMiddleware, autoAssignBrands)

// Protected — customers
router.get('/customers/export/csv', authMiddleware, exportCustomersCsv)
router.get('/customers/export/xlsx', authMiddleware, exportCustomersXlsx)
router.get('/customers', authMiddleware, getCustomers)

// Protected — coupons
router.get('/coupons', authMiddleware, getCoupons)
router.post('/coupons', authMiddleware, createCoupon)
router.put('/coupons/:id', authMiddleware, validateRequest(updateCouponSchema), updateCoupon)
router.delete('/coupons/:id', authMiddleware, deleteCoupon)

// Protected — orders (specific routes must precede /orders/:id)
router.get('/orders/recent-feed', authMiddleware, getRecentOrdersFeed)
router.get('/orders/export/csv', authMiddleware, exportOrdersCsv)
router.get('/orders/export/xlsx', authMiddleware, exportOrdersXlsx)
router.get('/orders/stats', authMiddleware, getOrderStats)
router.get('/orders', authMiddleware, getAdminOrders)
router.put('/orders/:id/status', authMiddleware, validateRequest(updateOrderStatusSchema), updateOrderStatus)

// Protected — revenue
router.get('/revenue', authMiddleware, getRevenue)

// Protected — vet services
router.get('/vet/services', authMiddleware, getVetServices)
router.post('/vet/services', authMiddleware, validateRequest(createVetServiceSchema), createVetService)
router.put('/vet/services/:id', authMiddleware, validateRequest(updateVetServiceSchema), updateVetService)
router.delete('/vet/services/:id', authMiddleware, deleteVetService)

// Protected — vet availability (horario recurrente)
router.get('/vet/availability', authMiddleware, getVetAvailability)
router.post('/vet/availability', authMiddleware, validateRequest(createVetAvailabilitySchema), createVetAvailability)

// Protected — vet exceptions (bloqueos/aperturas puntuales)
router.get('/vet/exceptions', authMiddleware, getVetExceptions)
router.post('/vet/exceptions', authMiddleware, validateRequest(createVetExceptionSchema), createVetException)
router.delete('/vet/exceptions/:id', authMiddleware, deleteVetException)

// Protected — vet appointments
router.get('/vet/appointments', authMiddleware, getAdminAppointments)
router.put('/vet/appointments/:id/status', authMiddleware, validateRequest(updateAppointmentStatusSchema), updateAppointmentStatus)
router.put('/vet/appointments/:id/cancel', authMiddleware, cancelAppointment)
router.put('/vet/appointments/:id/reschedule', authMiddleware, rescheduleAppointment)

export default router
