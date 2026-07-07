import { Router } from 'express'
import { getServices, getAvailability, createAppointment } from '../controllers/vetController'
import { validateRequest } from '../middleware/validateRequest'
import { createAppointmentSchema } from '../schemas'

const router = Router()

router.get('/services', getServices)
router.get('/availability', getAvailability)
router.post('/appointments', validateRequest(createAppointmentSchema), createAppointment)

export default router
