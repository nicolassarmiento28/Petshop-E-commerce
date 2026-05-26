import { Router } from 'express'
import { getProducts, getProductBySlug, getRelatedProducts } from '../controllers/productController'

const router = Router()

router.get('/', getProducts)
router.get('/:slug/related', getRelatedProducts)
router.get('/:slug', getProductBySlug)

export default router
