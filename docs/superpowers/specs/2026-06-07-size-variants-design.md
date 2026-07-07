# Size Variants — Design Spec
**Date:** 2026-06-07  
**Status:** Approved

---

## Overview

Add a size/weight variant selector to the product page for food products (perro-alimentos, gato-alimentos). Each variant is displayed as a small card showing the product's own photo, weight label, and price. Selecting a variant navigates to that variant's product URL.

---

## Scope

- Applies **only** to food categories (`perro-alimentos`, `gato-alimentos`)
- All other product types are unaffected
- Each size variant is a full `Product` record with its own slug, price, stock, and image
- No changes to `Order`, `OrderItem`, cart, or checkout logic

---

## Section 1: Data Model

### Schema change

Add one nullable field to the `Product` model:

```prisma
model Product {
  // ... all existing fields unchanged ...
  sizeGroup  String?   // e.g. "royal-canin-adult-maxi"
}
```

Migration name: `add_size_group_to_product`

### Rules

- Products sharing the same `sizeGroup` string are size siblings
- Only `isActive = true` products appear in the selector
- Products with `sizeGroup = null` show no selector (zero impact on existing behavior)
- Size label is extracted at query time from the product name via regex: `/(\d+(?:\.\d+)?)\s*kg/i` → `"15 kg"`

---

## Section 2: API

### `GET /api/products/:slug`

No new route. The existing endpoint is enriched: when the fetched product has a non-null `sizeGroup`, a second Prisma query fetches all active siblings in the same group.

The response gains an optional `variants` array:

```typescript
variants?: {
  id: number
  name: string
  slug: string
  price: number
  salePrice?: number
  stock: number
  imageUrl?: string
  sizeLabel: string   // extracted from name, e.g. "15 kg"
}[]
```

- The current product is included in `variants` (so the UI can mark it as selected)
- Sorted ascending by numeric weight (3 kg → 7 kg → 15 kg)
- If `sizeGroup` is null, `variants` is omitted from the response

### Type change — `frontend/src/types/index.ts`

```typescript
export interface ProductVariant {
  id: number
  name: string
  slug: string
  price: number
  salePrice?: number
  stock: number
  imageUrl?: string
  sizeLabel: string
}

export interface ProductType {
  // ... all existing fields ...
  sizeGroup?: string
  variants?: ProductVariant[]
}
```

---

## Section 3: Frontend UI

### Placement

The size selector renders in the product page right column, **between the price block and the description**, only when `product.variants` is present and has more than one item.

### Card design

Each variant renders as a small clickable card (80px wide):

- Product's own `imageUrl` as a square thumbnail (56×56px, `object-fit: contain`)
- Weight label below the image (`sizeLabel`, e.g. "15 kg")
- Price below the label (shows `salePrice` if set, otherwise `price`)
- **Selected state** (current product): blue border (`border-blue-600`), blue background (`bg-blue-50`), blue ✓ badge top-right
- **Out of stock**: same styling + `opacity-50`
- Clicking navigates to `/producto/<variant.slug>` via React Router `<Link>`

### Section header

```
Tamaño
```
Small uppercase label (`text-xs font-semibold uppercase tracking-wide text-gray-500`) above the card row.

### No-selector fallback

If `product.variants` is absent or has ≤ 1 item, no selector is rendered. The page is visually identical to today.

---

## Section 4: Scraping Script

**File:** `backend/prisma/seed-size-groups.ts`

**Purpose:** One-time bootstrap that populates `sizeGroup` values and creates missing size variants by scraping superzoo.cl.

**Steps:**
1. Query DB for all active products in `perro-alimentos` and `gato-alimentos` categories
2. For each product, search SuperZoo (by product name stem) to find the matching product page
3. Extract available size pills from the page (weight label + price + stock status)
4. For each size not yet in our DB: create a new `Product` record (same name stem, correct weight appended, same `categoryId`, `brandId`, `imageUrl` from SuperZoo)
5. Compute a shared `sizeGroup` slug (kebab-case from the name stem, e.g. `"royal-canin-adult-maxi"`)
6. Update all sibling products (existing + newly created) with the same `sizeGroup`

**Constraints:**
- Uses Playwright for JS-rendered SuperZoo pages
- Idempotent: safe to re-run (upserts existing records, won't duplicate)
- Never deletes existing products
- Skips products where no SuperZoo match is found (logs a warning)

---

## Section 5: Admin UI

### Location

Existing admin product edit form (`AdminProducts.tsx` / product edit modal or page).

### New field

| Property | Value |
|---|---|
| Label | Grupo de tamaños |
| Input type | Text, nullable |
| Placeholder | `royal-canin-adult-maxi` |
| Helper text | Productos con el mismo valor se agrupan como variantes de tamaño |

No new admin page. The field is included in the existing product `PUT /admin/products/:id` payload and persisted via Prisma update. The `updateProduct` handler in `adminProductController.ts` must be extended to read and write `sizeGroup`.

---

## Out of Scope

- Variant selector for non-food categories
- Color / flavor variants
- Admin UI to visually reorder variants (order is always ascending by weight)
- Bulk-assign `sizeGroup` via admin (use the seed script for that)
