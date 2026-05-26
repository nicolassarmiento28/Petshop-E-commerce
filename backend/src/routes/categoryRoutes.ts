import { Router } from 'express'
import { getCategories, getBrands } from '../controllers/categoryController'

const router = Router()

router.get('/', getCategories)
router.get('/brands', getBrands)

export default router
