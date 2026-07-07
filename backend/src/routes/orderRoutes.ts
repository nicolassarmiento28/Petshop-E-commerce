import { Router } from 'express'
import { createOrder, getOrder } from '../controllers/orderController'
import { validateRequest } from '../middleware/validateRequest'
import { createOrderSchema } from '../schemas'

const router = Router()

router.post('/', validateRequest(createOrderSchema), createOrder)
router.get('/:orderNumber', getOrder)

export default router
