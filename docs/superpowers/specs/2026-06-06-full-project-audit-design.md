# Full Project Audit & Improvements

## Workstream A — Backend Improvements

### A1. Cupones en checkout
- Add `POST /api/coupons/validate` endpoint: checks code, expiry, maxUses, minPurchase
- Modify `createOrder` to accept optional `couponCode`, apply discount in transaction
- Validate coupon + update `usedCount` atomically
- Wire up in frontend CheckoutPage with coupon input + validate button

### A2. Rate limiting en login
- Install `express-rate-limit`
- Apply to `POST /api/admin/login`: max 5 attempts per 15 min per IP

### A3. Zod validation middleware
- Add `validateRequest` middleware to admin controllers that lack it (createBrand, createCoupon, createProduct)

### A4. Price range filter
- Add `minPrice` and `maxPrice` query params to `GET /api/products`
- Filter products with Prisma `price` / `salePrice` range

### A5. Server-side pagination on all products
- Currently AllProductsPage fetches all products and paginates client-side
- Change to use cursor-based pagination from `GET /api/products`

### A6. Brand controller rename
- Rename `getBrands` export in `categoryController.ts` to avoid collision with `adminBrandController.ts`

### A7. Webhook endpoint for Transbank (optional)
- Add `POST /api/payment/webpay-webhook` for async Transbank notifications

---

## Workstream B — Frontend Improvements

### B1. 404 Page
- `NotFound.tsx` at `*` route with friendly message + link to home

### B2. About page
- `AboutPage.tsx` at `/nosotros` with static content about the pet shop

### B3. Breadcrumbs
- Reusable `Breadcrumbs` component for CategoryPage, ProductPage, AllProductsPage
- Shows: Home > Category > Product (when applicable)

### B4. Lazy loading images
- Add `loading="lazy"` to all `<img>` tags in ProductCard, ProductPage, BrandsCarousel

### B5. Sidebar tooltips
- Add `title` attributes or tooltip on hover for icon-only nav items in AdminLayout

### B6. SEO with react-helmet-async
- Install `react-helmet-async`
- Add `<Helmet>` with title, meta description, OG tags to every page
- Dynamic titles from product/category names

### B7. Coupon input in checkout
- Add coupon code field + "Validate" button to CheckoutPage
- Show discount line in CartSummary

### B8. Price range filter UI
- Add min/max price inputs on CategoryPage sidebar

### B9. Page size selector
- Add 12/24/48 items per page control on AllProductsPage and CategoryPage

### B10. Framer Motion animations
- Install `framer-motion`
- Add page transition animations, card entrance animations
- CartDrawer slide animation (already animated, enhance)

---

## Workstream C — Tests

### C1. Frontend test setup
- Install vitest, @testing-library/react, jsdom
- Configure vitest in vite.config.ts
- Write tests for: ProductCard, CartStore, CheckoutForm validation, formatCLP

### C2. Backend test setup
- Install jest, ts-jest, @types/jest
- Configure jest with ts-jest preset
- Write tests for: productController, brandController, orderController

---

## Workstream D — Infrastructure

### D1. CI/CD (GitHub Actions)
- `.github/workflows/ci.yml` — lint + type-check + test on PR to main
- `.github/workflows/deploy.yml` — deploy frontend to Vercel, backend to Railway

### D2. Docker
- `Dockerfile` for backend
- `docker-compose.yml` with backend + postgres

### D3. Low stock notifications
- Add notification badge/banner in admin dashboard for low stock products (already partially done)
- Email notification option (future)
