import { Router } from 'express'
import { getCategories, getCategoryBySlug, getPublicBrands } from '../controllers/categoryController'

const router = Router()

router.get('/', getCategories)
router.get('/brands', getPublicBrands)
router.get('/:slug', getCategoryBySlug)

export default router
