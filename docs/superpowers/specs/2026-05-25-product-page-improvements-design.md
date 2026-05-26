# Product Page Improvements — Design Spec
Date: 2026-05-25

## Overview

Enhance the existing `ProductPage` with three improvements: a thumbnail gallery strip, a quantity selector, and a related products section. No schema changes required.

---

## 1. Layout (Option B — Gallery strip)

Two-column grid on desktop (`lg:grid-cols-2`), single column on mobile.

### Left column — Image area

- Large main image: square aspect ratio, `rounded-3xl`, `bg-blue-50` as fallback background, `object-cover`.
- Fallback when no image: centered 🐾 emoji.
- **Thumbnail strip** below main image: 4 slots, all pointing to the same `imageUrl` (model is single-image; slots are a UI pattern ready for future multi-image support). First thumbnail pre-selected (blue ring border). Clicking any thumbnail swaps the main image (React state — `selectedImage`). Each thumbnail is a small square, `rounded-lg`, `object-cover`.

### Right column — Product info

Order from top to bottom:

1. **Brand name** — `text-xs font-semibold uppercase tracking-widest text-gray-400`
2. **Product name** — Fraunces font, `text-3xl font-bold text-gray-900`
3. **Price row**:
   - On sale: sale price in `text-3xl font-bold text-blue-600` + original in `text-lg text-gray-400 line-through` + red `Oferta` pill (`bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full`)
   - Not on sale: single price in `text-3xl font-bold text-blue-600`
4. **Badges row**: `isFeatured` → "Destacado" (`bg-amber-50 text-amber-700`), category name (`bg-gray-100 text-gray-600`)
5. **Description** — `text-gray-600 leading-relaxed` (hidden if null)
6. **Stock indicator**:
   - `stock > 5`: `text-gray-500` with `Package` icon — "N unidades disponibles"
   - `stock <= 5 && stock > 0`: `text-orange-500` — "Solo N unidades"
   - `stock === 0`: `text-red-500` — "Sin stock"
7. **Quantity selector** (disabled when out of stock):
   - `−` button / numeric display / `+` button
   - Min: 1, Max: `product.stock`
   - Styled: `border border-gray-200 rounded-xl`, buttons `px-4 py-2`, number centered `w-12 text-center font-semibold`
8. **"Agregar al carrito" button** — full width, `bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl`, passes selected quantity to `addItem(product, qty)`. Disabled + gray when out of stock.

---

## 2. Related Products

### Backend

New endpoint: `GET /api/products/:slug/related`

Controller: `getRelatedProducts` in `productController.ts`

Logic:
1. Find current product by slug — extract `categoryId`, `brandId`, `id`.
2. Query up to 8 active products where `id != currentId` AND (`categoryId == currentCategoryId` OR `brandId == currentBrandId`), ordered by `categoryId` match first (same category prioritized), `take: 8`.
3. Exclude the current product.
4. Return array of products with brand (`name`, `logoUrl`) selected — same shape as the existing products list response items.

Route: `GET /api/products/:slug/related` added to `productRoutes.ts`.

### Frontend

**Hook:** `useRelatedProducts(slug: string)` in `hooks/useProducts.ts`
- `useQuery({ queryKey: ['related', slug], queryFn: () => fetchRelatedProducts(slug) })`
- Returns `ProductType[]`

**Service:** `fetchRelatedProducts(slug: string)` in `services/productService.ts`
- `GET /products/:slug/related`
- Returns `ProductType[]`

**UI in `ProductPage.tsx`:** Section below the main product grid, only rendered when `relatedProducts.length > 0`:
- Section title: "También te puede interesar" (Fraunces, `text-2xl font-bold`)
- `ProductGrid` component with the related products array
- 4 columns desktop (`grid-cols-4`), 2 columns mobile (`grid-cols-2`)
- Max 8 items shown

---

## 3. Files Changed

| File | Change |
|---|---|
| `frontend/src/pages/ProductPage.tsx` | Full rewrite: thumbnail strip, quantity selector, related products section |
| `frontend/src/hooks/useProducts.ts` | Add `useRelatedProducts(slug)` |
| `frontend/src/services/productService.ts` | Add `fetchRelatedProducts(slug)` |
| `backend/src/controllers/productController.ts` | Add `getRelatedProducts` handler |
| `backend/src/routes/productRoutes.ts` | Add `GET /:slug/related` route (before `GET /:slug`) |

---

## 4. Constraints

- No schema changes — single `imageUrl` field, thumbnails are cosmetic.
- TypeScript strict mode — no `any`.
- Backend handler must be `async` with `try/catch` and `next(error)`.
- Error shape: `{ error: string }`.
- Use `formatCLP()` for all price display.
- Related products endpoint must be registered **before** `GET /:slug` in the router to avoid slug conflict.
