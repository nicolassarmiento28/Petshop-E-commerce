import { Router } from 'express'
import { createPayment, paymentReturn, getPaymentStatus } from '../controllers/paymentController'
import { validateRequest } from '../middleware/validateRequest'
import { createPaymentSchema } from '../schemas'

const router = Router()

router.post('/create', validateRequest(createPaymentSchema), createPayment)
router.get('/return', paymentReturn)
router.get('/status/:orderNumber', getPaymentStatus)

export default router
