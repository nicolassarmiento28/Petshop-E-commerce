import { Router } from 'express'
import { validateCoupon } from '../controllers/couponController'
import { validateRequest } from '../middleware/validateRequest'
import { validateCouponSchema } from '../schemas'
const router = Router()
router.post('/validate', validateRequest(validateCouponSchema), validateCoupon)
export default router
