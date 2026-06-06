import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import brandsRoutes from './routes/brandsRoutes'
import orderRoutes from './routes/orderRoutes'
import paymentRoutes from './routes/paymentRoutes'
import couponRoutes from './routes/couponRoutes'
import adminRoutes from './routes/adminRoutes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://petshop-e-commerce.vercel.app',
      process.env.FRONTEND_URL ?? ''
    ],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/brands', brandsRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/admin', adminRoutes)

// Centralized error handler (must be last)
app.use(errorHandler)

export default app