import { Router } from 'express'
import { getProducts, getProductBySlug, getRelatedProducts } from '../controllers/productController'
import { reassignCategories } from '../controllers/categorizeController'

const router = Router()

router.post('/categorize', reassignCategories)
router.get('/', getProducts)
router.get('/:slug/related', getRelatedProducts)
router.get('/:slug', getProductBySlug)

export default router
