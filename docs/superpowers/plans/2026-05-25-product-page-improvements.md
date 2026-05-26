# Product Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the product detail page with a thumbnail gallery strip, quantity selector, and a "related products" section sourced from a new backend endpoint.

**Architecture:** A new `GET /api/products/:slug/related` endpoint is added to the backend and returns up to 8 products sharing the same category or brand. The frontend adds `fetchRelatedProducts` + `useRelatedProducts` and rewrites `ProductPage` with the Option B layout (thumbnail strip left, details right, related grid below). No schema changes.

**Tech Stack:** React 18 · TypeScript 5 · Zustand · React Query 5 · Express 4 · Prisma 5 · Tailwind CSS 3

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/src/controllers/productController.ts` | Modify | Add `getRelatedProducts` handler |
| `backend/src/routes/productRoutes.ts` | Modify | Register `GET /:slug/related` before `GET /:slug` |
| `frontend/src/services/productService.ts` | Modify | Add `fetchRelatedProducts(slug)` |
| `frontend/src/hooks/useProducts.ts` | Modify | Add `useRelatedProducts(slug)` |
| `frontend/src/pages/ProductPage.tsx` | Rewrite | Option B layout: gallery strip, qty selector, related products |

---

## Task 1: Backend — `getRelatedProducts` handler

**Files:**
- Modify: `backend/src/controllers/productController.ts`

- [ ] **Step 1: Add the handler at the bottom of `productController.ts`**

Append after the existing `getProductBySlug` export:

```typescript
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = req.params['slug'] as string

    const current = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true, brandId: true },
    })

    if (!current || !current.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: current.id },
        OR: [
          { categoryId: current.categoryId },
          { brandId: current.brandId },
        ],
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    })

    res.json(related)
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd backend && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd backend
git add src/controllers/productController.ts
git commit -m "feat: add getRelatedProducts controller"
```

---

## Task 2: Backend — Register the route

**Files:**
- Modify: `backend/src/routes/productRoutes.ts`

- [ ] **Step 1: Update `productRoutes.ts`**

Replace the entire file content with:

```typescript
import { Router } from 'express'
import { getProducts, getProductBySlug, getRelatedProducts } from '../controllers/productController'

const router = Router()

router.get('/', getProducts)
router.get('/:slug/related', getRelatedProducts)
router.get('/:slug', getProductBySlug)

export default router
```

Note: `/:slug/related` must be registered **before** `/:slug` or Express will match the slug route first.

- [ ] **Step 2: Verify type-check passes**

```bash
cd backend && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Manual smoke test (requires backend running)**

```bash
# In a separate terminal: cd backend && npm run dev
curl http://localhost:3001/api/products/royal-canin-adult-maxi/related
```

Expected: JSON array (may be empty if no related products in seed, but no 404 or 500).

- [ ] **Step 4: Commit**

```bash
cd backend
git add src/routes/productRoutes.ts
git commit -m "feat: register GET /:slug/related route"
```

---

## Task 3: Frontend service — `fetchRelatedProducts`

**Files:**
- Modify: `frontend/src/services/productService.ts`

- [ ] **Step 1: Add the function to `productService.ts`**

Append after `fetchBrands`:

```typescript
export const fetchRelatedProducts = async (slug: string): Promise<ProductType[]> => {
  const { data } = await api.get<ProductType[]>(`/products/${slug}/related`)
  return data
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd frontend && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/services/productService.ts
git commit -m "feat: add fetchRelatedProducts service function"
```

---

## Task 4: Frontend hook — `useRelatedProducts`

**Files:**
- Modify: `frontend/src/hooks/useProducts.ts`

- [ ] **Step 1: Add import and hook to `useProducts.ts`**

Update the import line at the top:

```typescript
import { fetchProducts, fetchProductBySlug, fetchCategories, fetchBrands, fetchRelatedProducts } from '@/services/productService'
```

Append at the bottom of the file:

```typescript
export const useRelatedProducts = (slug: string) =>
  useQuery({
    queryKey: ['related', slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: !!slug,
  })
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd frontend && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/hooks/useProducts.ts
git commit -m "feat: add useRelatedProducts hook"
```

---

## Task 5: Frontend — Rewrite `ProductPage`

**Files:**
- Rewrite: `frontend/src/pages/ProductPage.tsx`

- [ ] **Step 1: Replace `ProductPage.tsx` with the new implementation**

```typescript
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react'
import { formatCLP } from '@/utils/formatters'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import ProductGrid from '@/components/product/ProductGrid'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug ?? '')
  const { data: related = [] } = useRelatedProducts(slug ?? '')
  const addItem = useCartStore((s) => s.addItem)
  const [selectedThumb, setSelectedThumb] = useState(0)
  const [qty, setQty] = useState(1)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div>
            <div className="aspect-square bg-gray-100 rounded-3xl mb-3" />
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-6xl mb-4">🐾</p>
        <h2
          className="text-2xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Producto no encontrado
        </h2>
        <p className="text-gray-500 mb-6">No pudimos encontrar este producto.</p>
        <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    )
  }

  const displayPrice = product.salePrice ?? product.price
  const isOnSale = !!product.salePrice && product.salePrice < product.price
  const outOfStock = product.stock === 0

  const thumbImage = product.imageUrl ?? null

  const decrement = () => setQty((q) => Math.max(1, q - 1))
  const increment = () => setQty((q) => Math.min(product.stock, q + 1))

  const handleAddToCart = () => {
    if (!outOfStock) {
      addItem(product, qty)
      setQty(1)
    }
  }

  const stockLabel = () => {
    if (product.stock === 0) return { text: 'Sin stock', className: 'text-red-500' }
    if (product.stock <= 5) return { text: `Solo ${product.stock} unidades`, className: 'text-orange-500' }
    return { text: `${product.stock} unidades disponibles`, className: 'text-gray-500' }
  }
  const stock = stockLabel()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Link
        to={product.category ? `/categoria/${product.category.slug}` : '/'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        {product.category ? product.category.name : 'Volver'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left — image + thumbnail strip */}
        <div>
          <div className="aspect-square bg-blue-50 rounded-3xl overflow-hidden mb-3">
            {thumbImage ? (
              <img
                src={thumbImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8rem]">🐾</div>
            )}
          </div>
          {/* Thumbnail strip — 4 slots, all same image */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setSelectedThumb(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedThumb === i ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                {thumbImage ? (
                  <img src={thumbImage} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-2xl">🐾</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — product info */}
        <div className="flex flex-col gap-5">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h1
            className="text-3xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-blue-600">{formatCLP(displayPrice)}</span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCLP(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Oferta
                </span>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.isFeatured && (
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Destacado
              </span>
            )}
            {product.category && (
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm ${stock.className}`}>
            <Package size={15} />
            <span>{stock.text}</span>
          </div>

          {/* Quantity selector + Add to cart */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-3">
              {/* Qty selector */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={decrement}
                  disabled={outOfStock || qty <= 1}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-800 py-3">{qty}</span>
                <button
                  onClick={increment}
                  disabled={outOfStock || qty >= product.stock}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  +
                </button>
              </div>
            </div>

            <button
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors active:scale-95"
            >
              <ShoppingCart size={18} />
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2
            className="text-2xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            También te puede interesar
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd frontend && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Verify lint passes**

```bash
cd frontend && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Manual visual test**

With both servers running (`npm run dev` in `frontend/` and `backend/`), navigate to any product URL (e.g. `http://localhost:5173/producto/royal-canin-adult-maxi`) and verify:
- Thumbnail strip appears with 4 slots; clicking each highlights it with a blue border
- Quantity selector increments/decrements; cannot go below 1 or above stock
- "Agregar al carrito" passes the correct quantity to the cart
- "También te puede interesar" section appears at the bottom (if seed has related products)
- Out-of-stock products: qty selector and button are disabled

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/pages/ProductPage.tsx
git commit -m "feat: product page gallery strip, qty selector, related products"
```

---

## Self-Review Checklist (completed inline)

- **Spec coverage:**
  - ✅ Thumbnail strip (4 slots, same image, first pre-selected, blue ring on active)
  - ✅ Quantity selector (min 1, max stock, disabled when out of stock)
  - ✅ Sale price with Oferta badge + strikethrough original
  - ✅ Stock label color coding (gray / orange / red)
  - ✅ `getRelatedProducts` backend handler
  - ✅ Route registered before `/:slug`
  - ✅ `fetchRelatedProducts` service
  - ✅ `useRelatedProducts` hook
  - ✅ Related products section (hidden when empty)
- **Placeholder scan:** No TBDs, all code is complete.
- **Type consistency:** `ProductType[]` used consistently across service → hook → component. `slug` param name consistent across all files.
