# Design Spec: Home Page Products + Admin Order Status + UI Polish

**Date:** 2026-06-05  
**Status:** Approved

---

## 1. Context

The petshop e-commerce has 496+ products scraped from superzoo.cl in the database. Two issues:
- The home page "Novedades" and "Productos más vendidos" sections are empty because they filter by `isFeatured = true` and `salePrice != null` — flags that scraped products don't have.
- The admin dashboard shows total order count but no breakdown of orders by status.
- Product cards and category pages have minor UX rough edges.

---

## 2. Home Page: Populate Novedades + Más Vendidos

### Novedades
- Query change: remove `featured: true`, use `{ sort: 'newest', limit: 8 }`.
- Shows the 8 most recently added products regardless of flags — always populated from scraped catalog.

### Productos más vendidos
- Query change: remove `sale: true`, use `{ category: randomCategory, sort: 'newest', limit: 8 }`.
- `randomCategory` is selected from `['perro', 'gato', 'farmacia', 'peluqueria']` using `useMemo(() => POPULAR_CATEGORIES[Math.floor(Math.random() * POPULAR_CATEGORIES.length)], [])` — picks once on mount, varies between visits.
- Remove the `{onSale.length > 0 && (...)}` guard so the section always renders.
- Subtitle dynamically reads "Más populares en [Categoría]" to reflect which category is shown.

### Files changed
- `frontend/src/pages/Home.tsx` — update two `useProducts` calls and section rendering.

---

## 3. Admin Dashboard: Order Status Breakdown

### Backend
- Add controller function `getOrderStats` in `backend/src/controllers/adminOrderController.ts` (alongside the existing `getAdminOrders`):
  ```typescript
  export const getOrderStats = async (req, res, next) => {
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    const result = Object.fromEntries(stats.map(s => [s.status, s._count.id]))
    res.json(result)
  }
  ```
- Add route `GET /admin/orders/stats` in `backend/src/routes/adminRoutes.ts`, protected by `authMiddleware`. **Must be registered before any future `GET /orders/:id` route** to prevent Express matching the literal string `stats` as an ID parameter.

### Frontend
- In `AdminDashboard.tsx`, add a second parallel fetch to `/admin/orders/stats`.
- Render a second row of colored stat cards below the existing 3 stat cards, one per status:

| Status | Color | Label (ES) |
|---|---|---|
| PENDING | yellow | Pendiente |
| PAID | green | Pagado |
| PROCESSING | blue | En proceso |
| SHIPPED | indigo | Enviado |
| DELIVERED | emerald | Entregado |
| CANCELLED | red | Cancelado |
| REFUNDED | gray | Reembolsado |

- Only render a card if the status has at least 1 order (omit zeros to reduce clutter).
- Section header: "Estado de órdenes".

### Files changed
- `backend/src/controllers/adminOrderController.ts` — add `getOrderStats`
- `backend/src/routes/adminRoutes.ts` — add route
- `frontend/src/pages/admin/AdminDashboard.tsx` — add fetch + render status cards

---

## 4. UI Polish: Product Cards + Category Page + Mobile

### Product card (`ProductCard.tsx`)
- Add category name as a small label above the product name (e.g., "Perros" in gray text), sourced from `product.category.name`.
- Tighten bottom padding on mobile (`p-3` already used, verify consistent on 360px).
- Image fallback: keep `🐾` but add a subtle border on the fallback container for visual definition.

### Category page (`CategoryPage.tsx`)
- Replace `products.length` with `data?.total ?? 0` for the product count line so it shows the real catalog total, not just loaded items.
- Make the filter bar sticky: wrap in `<div className="sticky top-16 z-10 bg-[#FAFAF8] dark:bg-[#111111] py-3 -mx-4 px-4">` (top-16 accounts for the navbar height).

### Mobile
- Verify category filter `<select>` elements are full-width on screens below `sm:` breakpoint — add `w-full sm:w-auto` if needed.
- Verify cart drawer (`Sheet`) closes properly on navigation (already handled by `uiStore`).

### Files changed
- `frontend/src/components/product/ProductCard.tsx`
- `frontend/src/pages/CategoryPage.tsx`

---

## 5. ESLint Fix (completed)

- Created `frontend/eslint.config.js` (ESLint v9 flat config).
- Extracted `checkoutSchema` + `CheckoutFormData` to `frontend/src/components/checkout/checkoutSchema.ts` to fix `react-refresh/only-export-components` warning.
- Both `npm run lint` and `npm run type-check` now pass with 0 errors/warnings.

---

## 6. Out of Scope

- `isFeatured` / `isBestSeller` manual curation flags in admin.
- Real sales analytics (no order-item sales volume tracking).
- Product image CDN migration (superzoo.cl URLs kept as-is).
- Customer login / reviews / blog.
