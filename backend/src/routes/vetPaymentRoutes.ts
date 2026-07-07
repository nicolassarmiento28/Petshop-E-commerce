import { Router } from 'express'
import { createVetPayment, vetPaymentReturn, getVetPaymentStatus } from '../controllers/vetPaymentController'
import { validateRequest } from '../middleware/validateRequest'
import { createVetPaymentSchema } from '../schemas'

const router = Router()

router.post('/create', validateRequest(createVetPaymentSchema), createVetPayment)
router.get('/return', vetPaymentReturn)
router.get('/status/:appointmentNumber', getVetPaymentStatus)

export default router
