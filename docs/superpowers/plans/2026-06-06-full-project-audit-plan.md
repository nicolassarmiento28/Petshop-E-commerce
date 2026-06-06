# Full Project Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all 20 improvements across frontend, backend, admin, tests, and infrastructure.

**Architecture:** 4 independent workstreams (A: Backend, B: Frontend, C: Tests, D: Infra) that can run in parallel. Shared work between A and B where features cross layers (coupons, pagination, price filter).

**Tech Stack:** Express, React, Prisma, Vitest, Jest, GitHub Actions, Docker, react-helmet-async, framer-motion, express-rate-limit

---

## Workstream A — Backend Improvements

### Task A1: Rate limiting on admin login

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/middleware/rateLimiter.ts`
- Modify: `backend/src/routes/adminRoutes.ts`

- [ ] **Install express-rate-limit**

Run: `cd backend && npm install express-rate-limit`

- [ ] **Create rate limiter middleware**

Create `backend/src/middleware/rateLimiter.ts`:
```typescript
import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})
```

- [ ] **Apply to login route**

In `backend/src/routes/adminRoutes.ts`, add `loginLimiter` to the login route:
```typescript
import { loginLimiter } from '../middleware/rateLimiter'
router.post('/login', loginLimiter, adminLogin)
```

---

### Task A2: Zod validation on admin controllers

**Files:**
- Modify: `backend/src/controllers/adminBrandController.ts`
- Modify: `backend/src/controllers/adminCouponController.ts`
- Modify: `backend/src/controllers/adminProductController.ts`

- [ ] **Add brand validation schema**

In `backend/src/controllers/adminBrandController.ts`, add at top:
```typescript
import { z } from 'zod'

const createBrandSchema = z.object({
  name: z.string().min(2, 'name must be at least 2 characters'),
  slug: z.string().min(2, 'slug must be at least 2 characters').regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional().or(z.literal('')),
})
```

Use in `createBrand`:
```typescript
const parsed = createBrandSchema.parse(req.body)
const brand = await prisma.brand.create({
  data: { name: parsed.name, slug: parsed.slug, logoUrl: parsed.logoUrl || undefined },
})
```

Wrap in try/catch and handle `ZodError`:
```typescript
import { ZodError } from 'zod'
// in catch:
if (error instanceof ZodError) {
  res.status(400).json({ error: error.errors.map(e => e.message).join(', ') })
  return
}
```

- [ ] **Add coupon validation schema**

Same pattern in `adminCouponController.ts`.

- [ ] **Add product validation schema**

Same pattern in `adminProductController.ts` for `createProduct`.

---

### Task A3: Price range filter on products API

**Files:**
- Modify: `backend/src/controllers/productController.ts`

- [ ] **Add minPrice/maxPrice filters**

In `getProducts`, add to the where clause:
```typescript
const where: Prisma.ProductWhereInput = {
  isActive: true,
  ...(category && { category: { slug: category as string } }),
  ...(brand && { brand: { slug: brand as string } }),
  ...(sale === 'true' && { salePrice: { not: null } }),
  ...(featured === 'true' && { isFeatured: true }),
  ...(search && { name: { contains: search as string, mode: 'insensitive' } }),
  // Add these:
  ...(req.query.minPrice && {
    OR: [
      { price: { gte: parseFloat(req.query.minPrice as string) } },
      { salePrice: { gte: parseFloat(req.query.minPrice as string) } },
    ],
  }),
  ...(req.query.maxPrice && {
    OR: [
      { price: { lte: parseFloat(req.query.maxPrice as string) } },
      { salePrice: { lte: parseFloat(req.query.maxPrice as string) } },
    ],
  }),
}
```

---

### Task A4: Server-side pagination for all products

**Files:**
- Modify: `backend/src/controllers/productController.ts`

The `getProducts` already has cursor-based pagination. No backend changes needed — the frontend needs to use `useProductsInfinite` hook instead of fetching all. This will be handled in the frontend workstream.

---

### Task A5: Brand controller rename (avoid collision)

**Files:**
- Modify: `backend/src/controllers/categoryController.ts`
- Modify: `backend/src/routes/brandsRoutes.ts`

- [ ] **Rename conflicting export**

In `backend/src/controllers/categoryController.ts`, the `getBrands` function is used by both `brandsRoutes.ts` and `categoryRoutes.ts`. Since `adminBrandController.ts` also exports `getBrands`, rename the one in categoryController:

Change `export const getBrands` to `export const getPublicBrands` in categoryController.ts, and update the import in brandsRoutes.ts:
```typescript
import { getPublicBrands } from '../controllers/categoryController'
router.get('/', getPublicBrands)
```

---

### Task A6: Coupon validation + apply in checkout

**Files:**
- Create: `backend/src/controllers/couponController.ts`
- Create: `backend/src/routes/couponRoutes.ts`
- Modify: `backend/src/controllers/orderController.ts`
- Modify: `backend/src/app.ts`

- [ ] **Create coupon public endpoints**

Create `backend/src/controllers/couponController.ts`:
```typescript
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = req.body
    if (!code) {
      res.status(400).json({ error: 'Código de cupón requerido' })
      return
    }
    const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } })
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ error: 'Cupón no encontrado o inactivo' })
      return
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ error: 'Cupón expirado' })
      return
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      res.status(400).json({ error: 'Cupón agotado' })
      return
    }
    if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
      res.status(400).json({ error: `Compra mínima de $${coupon.minPurchase.toLocaleString('es-CL')}` })
      return
    }
    let discount = coupon.discountType === 'PERCENTAGE'
      ? orderTotal * (coupon.discountValue / 100)
      : coupon.discountValue
    if (discount > orderTotal) discount = orderTotal

    res.json({ valid: true, discount, discountType: coupon.discountType, discountValue: coupon.discountValue, code: coupon.code })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Create coupon routes**

Create `backend/src/routes/couponRoutes.ts`:
```typescript
import { Router } from 'express'
import { validateCoupon } from '../controllers/couponController'
const router = Router()
router.post('/validate', validateCoupon)
export default router
```

- [ ] **Mount in app.ts**

In `backend/src/app.ts`, add:
```typescript
import couponRoutes from './routes/couponRoutes'
app.use('/api/coupons', couponRoutes)
```

- [ ] **Modify createOrder to accept coupon**

In `backend/src/controllers/orderController.ts`, modify `createOrder` to accept optional `couponCode` and apply the discount inside the transaction:
```typescript
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, couponCode } = req.body

    // existing validation...
    if (!items || !items.length) {
      res.status(400).json({ error: 'Carrito vacío' })
      return
    }

    const result = await prisma.$transaction(async (tx) => {
      // existing product fetching...
      const productIds = items.map((i: { productId: number }) => i.productId)
      const products = await tx.product.findMany({ where: { id: { in: productIds }, isActive: true } })

      let total = 0
      const orderItemsData = []

      for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) throw new Error(`Producto ID ${item.productId} no encontrado`)
        if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`)

        const unitPrice = product.salePrice ?? product.price
        const subtotal = unitPrice * item.quantity
        total += subtotal

        await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: item.quantity } } })

        orderItemsData.push({ productId: product.id, quantity: item.quantity, unitPrice, subtotal })
      }

      // Apply coupon if provided
      let discount = 0
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: String(couponCode).toUpperCase() } })
        if (coupon && coupon.isActive) {
          if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
            if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
              if (!coupon.minPurchase || total >= coupon.minPurchase) {
                discount = coupon.discountType === 'PERCENTAGE'
                  ? total * (coupon.discountValue / 100)
                  : coupon.discountValue
                if (discount > total) discount = total
                await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
              }
            }
          }
        }
      }

      const finalTotal = total - discount
      const orderNumber = `ORD-${Date.now()}`
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          total: finalTotal,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          items: { create: orderItemsData },
        },
      })

      return { orderId: order.id, orderNumber: order.orderNumber, total: finalTotal, originalTotal: total, discount }
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}
```

Also update the `CreateOrderInput` type in the frontend to include optional `couponCode`.

---

## Workstream B — Frontend Improvements

### Task B1: 404 Page

**Files:**
- Create: `frontend/src/pages/NotFound.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Create NotFound page**

Create `frontend/src/pages/NotFound.tsx`:
```tsx
import { Link } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

const NotFound = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-[#8892a4] mb-8">Página no encontrada</p>
      <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
        Volver al inicio
      </Link>
    </div>
  </Layout>
)
export default NotFound
```

- [ ] **Add route**

In `App.tsx`, add: `<Route element={<NotFound />} path="*" />` at the end of the Routes, inside the Layout wrapper.

---

### Task B2: About page

**Files:**
- Create: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Create About page**

Create `frontend/src/pages/AboutPage.tsx` with static content about the pet shop (location Viña del Mar, history, values, team). Use `<Layout>` wrapper.

- [ ] **Add route**

`<Route element={<AboutPage />} path="/nosotros" />`

---

### Task B3: Breadcrumbs component

**Files:**
- Create: `frontend/src/components/layout/Breadcrumbs.tsx`
- Modify: `frontend/src/pages/CategoryPage.tsx`
- Modify: `frontend/src/pages/ProductPage.tsx`
- Modify: `frontend/src/pages/AllProductsPage.tsx`

- [ ] **Create Breadcrumbs component**

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#8892a4] mb-4">
    <Link to="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        <ChevronRight size={14} />
        {item.href ? (
          <Link to={item.href} className="hover:text-orange-500 transition-colors">{item.label}</Link>
        ) : (
          <span className="text-gray-800 dark:text-[#e8eaf0] font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
)
export default Breadcrumbs
```

- [ ] **Add to category, product, and all-products pages**

Import and use `<Breadcrumbs items={[...]} />` at the top of each page content area.

---

### Task B4: Lazy loading images

**Files:**
- Modify: `frontend/src/components/product/ProductCard.tsx`
- Modify: `frontend/src/pages/ProductPage.tsx`
- Modify: `frontend/src/components/product/BrandsCarousel.tsx`

- [ ] **Add loading="lazy" to all img tags**

Find every `<img` tag and add `loading="lazy"`.

---

### Task B5: Sidebar tooltips in AdminLayout

**Files:**
- Modify: `frontend/src/components/admin/AdminLayout.tsx`

- [ ] **Add title attributes to sidebar nav items**

Add `title` attribute with nav item name to each sidebar link/icon button. Also wrap in `<span className="sr-only">` for accessibility.

---

### Task B6: SEO with react-helmet-async

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/main.tsx`
- Modify: Every page component to add `<Helmet>`

- [ ] **Install react-helmet-async**

Run: `cd frontend && npm install react-helmet-async`

- [ ] **Wrap app with HelmetProvider**

In `frontend/src/main.tsx`:
```tsx
import { HelmetProvider } from 'react-helmet-async'
// Wrap <App /> with <HelmetProvider>
```

- [ ] **Add SEO to each page**

In each page component, add:
```tsx
import { Helmet } from 'react-helmet-async'
// Inside render:
<Helmet>
  <title>Producto | Petshop</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
</Helmet>
```

Pages to update: Home (title "Petshop | Tienda de Mascotas"), CategoryPage (dynamic title), ProductPage (dynamic product name), AllProductsPage, CartPage, CheckoutPage, PrivacyPage, TermsPage, ReturnsPage, AboutPage, admin pages.

---

### Task B7: Coupon input in checkout

**Files:**
- Modify: `frontend/src/components/checkout/CheckoutForm.tsx`
- Modify: `frontend/src/pages/CheckoutPage.tsx`
- Modify: `frontend/src/services/api.ts` (or create couponService)
- Modify: `frontend/src/types/index.ts`

- [ ] **Add coupon types**

In `types/index.ts`:
```typescript
export interface CouponValidation {
  valid: boolean
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  code: string
}
```

- [ ] **Add coupon service**

In `frontend/src/services/api.ts` or new file:
```typescript
export const validateCoupon = async (code: string, orderTotal: number) =>
  api.post('/coupons/validate', { code, orderTotal }).then(r => r.data)
```

- [ ] **Add coupon UI to checkout**

In `CheckoutPage.tsx`, add a coupon section before the cart summary:
- Input for coupon code + "Validar" button
- On validate: POST `/api/coupons/validate`, show discount or error
- Pass `couponCode` to createOrder

Modify `CheckoutForm.tsx` to accept `couponCode` and pass it to `createOrder`.

- [ ] **Update CreateOrderInput type**

Add optional `couponCode?: string` to `CreateOrderInput`.

---

### Task B8: Price range filter UI

**Files:**
- Modify: `frontend/src/pages/CategoryPage.tsx`

- [ ] **Add price range inputs**

Add two number inputs for min/max price in the filter bar of CategoryPage. When changed, update the `useProductsInfinite` call with new `minPrice`/`maxPrice` params.

Add to `ProductFilters` type:
```typescript
export interface ProductFilters {
  // existing...
  minPrice?: number
  maxPrice?: number
}
```

---

### Task B9: Page size selector

**Files:**
- Modify: `frontend/src/pages/CategoryPage.tsx` (uses infinite scroll, maybe add limit control)
- Modify: `frontend/src/pages/AllProductsPage.tsx`

- [ ] **Add items-per-page control**

In AllProductsPage, add a dropdown with options 12, 24, 48 that re-fetches data with new limit.

For CategoryPage (infinite scroll), add a similar control.

---

### Task B10: Framer Motion animations

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/product/ProductGrid.tsx`
- Modify: `frontend/src/components/cart/CartDrawer.tsx`

- [ ] **Install framer-motion**

Run: `cd frontend && npm install framer-motion`

- [ ] **Add page transitions**

In `App.tsx`, wrap routes with `<AnimatePresence>` and add `motion.div` with fade/slide transitions.

- [ ] **Add card entrance animations**

In `ProductGrid.tsx`, wrap ProductCard items with `motion.div` with staggered entrance animations.

- [ ] **Enhance CartDrawer animation**

Already animated, but refine with framer-motion.

---

## Workstream C — Tests

### Task C1: Frontend test setup

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test-setup.ts`

- [ ] **Install test dependencies**

Run: `cd frontend && npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

- [ ] **Create vitest config**

Create `frontend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

- [ ] **Create test setup**

Create `frontend/src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Add commit-msg script**

Add to package.json: `"test": "vitest run"`

### Task C2: Frontend tests

**Files:**
- Create: `frontend/src/utils/__tests__/formatters.test.ts`
- Create: `frontend/src/store/__tests__/cartStore.test.ts`
- Create: `frontend/src/components/product/__tests__/ProductCard.test.tsx`

- [ ] **Write formatter tests**

```typescript
import { describe, it, expect } from 'vitest'
import { formatCLP, formatDate } from '@/utils/formatters'

describe('formatCLP', () => {
  it('formats integer price', () => {
    expect(formatCLP(15990)).toBe('$15.990')
  })
  it('formats zero', () => {
    expect(formatCLP(0)).toBe('$0')
  })
  it('formats large number', () => {
    expect(formatCLP(1000000)).toBe('$1.000.000')
  })
})

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2026-01-15T00:00:00.000Z')
    expect(result).toContain('2026')
  })
})
```

- [ ] **Write cart store tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cartStore'

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('adds item to empty cart', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 1 })
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().totalItems).toBe(1)
  })

  it('increments quantity when adding existing item', () => {
    const store = useCartStore.getState()
    store.addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 2 })
    store.addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 3 })
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes item', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 1 })
    useCartStore.getState().removeItem(1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears cart', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 1 })
    useCartStore.getState().addItem({ id: 2, name: 'Test2', slug: 'test2', imageUrl: '', unitPrice: 2000, quantity: 2 })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('computes totalPrice', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', unitPrice: 1000, quantity: 2 })
    useCartStore.getState().addItem({ id: 2, name: 'Test2', slug: 'test2', imageUrl: '', unitPrice: 2000, quantity: 3 })
    expect(useCartStore.getState().totalPrice).toBe(8000)
  })
})
```

- [ ] **Write ProductCard test**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductType } from '@/types'

const product: ProductType = {
  id: 1, name: 'Royal Canin Maxi Adult 15kg', slug: 'royal-canin-maxi-adult-15kg',
  price: 45990, salePrice: 38990, stock: 15, isActive: true, isFeatured: true,
  imageUrl: 'https://example.com/img.jpg', images: [], categoryId: 1, brandId: 1,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<table><tbody><ProductCard product={product} /></tbody></table>)
    expect(screen.getByText('Royal Canin Maxi Adult 15kg')).toBeInTheDocument()
  })

  it('shows sale badge when on sale', () => {
    render(<table><tbody><ProductCard product={product} /></tbody></table>)
    expect(screen.getByText('Oferta')).toBeInTheDocument()
  })

  it('shows Agotado badge when out of stock', () => {
    const outOfStock = { ...product, stock: 0 }
    render(<table><tbody><ProductCard product={outOfStock} /></tbody></table>)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })
})
```

- [ ] **Run tests to verify**

Run: `cd frontend && npx vitest run`
Expected: All tests pass.

---

### Task C3: Backend test setup

**Files:**
- Modify: `backend/package.json`
- Create: `backend/jest.config.ts`

- [ ] **Install test dependencies**

Run: `cd backend && npm install -D jest ts-jest @types/jest`

- [ ] **Create jest config**

Create `backend/jest.config.ts`:
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
}
```

- [ ] **Add test script**

Add to `backend/package.json`: `"test": "jest"`

---

## Workstream D — Infrastructure

### Task D1: CI/CD with GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`

- [ ] **Create CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm run type-check
```

### Task D2: Docker setup

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Create Dockerfile**

Create `Dockerfile` (for backend):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

- [ ] **Create docker-compose.yml**

Create `docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: petshop_db
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/petshop_db
      NODE_ENV: development
      JWT_SECRET: dev_secret_min_32_chars_long_here
      FRONTEND_URL: http://localhost:5173
    depends_on:
      - db

volumes:
  pgdata:
```

### Task D3: Low stock notifications (admin dashboard enhancement)

**Files:**
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`

The dashboard already has `getLowStockProducts`. Just ensure the UI clearly highlights it (already done with stats cards). Optionally add a badge with count in sidebar.
