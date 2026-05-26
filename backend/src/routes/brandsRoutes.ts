import { Router } from 'express'
import { getBrands } from '../controllers/categoryController'

const router = Router()

router.get('/', getBrands)

export default router
