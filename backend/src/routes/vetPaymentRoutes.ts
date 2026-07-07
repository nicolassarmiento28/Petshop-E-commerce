import { Router } from 'express'
import { createVetPayment, vetPaymentReturn, getVetPaymentStatus } from '../controllers/vetPaymentController'

const router = Router()

router.post('/create', createVetPayment)
router.get('/return', vetPaymentReturn)
router.get('/status/:appointmentNumber', getVetPaymentStatus)

export default router
