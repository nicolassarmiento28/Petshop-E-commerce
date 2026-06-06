import { Router } from 'express'
import { getPublicBrands } from '../controllers/categoryController'

const router = Router()

router.get('/', getPublicBrands)

export default router
