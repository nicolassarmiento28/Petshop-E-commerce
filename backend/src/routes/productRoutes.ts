import { Router } from 'express'
import { getProducts, getProductBySlug, getRelatedProducts, getPriceRange } from '../controllers/productController'

const router = Router()

router.get('/price-range', getPriceRange)
router.get('/', getProducts)
router.get('/:slug/related', getRelatedProducts)
router.get('/:slug', getProductBySlug)

export default router
