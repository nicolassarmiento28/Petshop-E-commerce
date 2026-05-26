import { Router } from 'express'
import { createPayment, paymentReturn, getPaymentStatus } from '../controllers/paymentController'

const router = Router()

router.post('/create', createPayment)
router.get('/return', paymentReturn)
router.get('/status/:orderNumber', getPaymentStatus)

export default router
