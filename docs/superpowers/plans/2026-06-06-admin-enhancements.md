# Admin Panel Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add 7 features to the admin panel: sales-by-category chart, month-over-month comparison, 24h orders feed, brands CRUD, customers list, CSV export, coupons system.

**Architecture:** Independent features built in parallel — each has its own backend endpoint(s) and frontend component/page. All follow existing patterns (Express controllers, React pages with AdminLayout, React Query hooks).

**Tech Stack:** Backend: Express + Prisma + recharts (already in deps). Frontend: React + Recharts + React Query.

**Prerequisites:** Admin routes use `authMiddleware` for auth, response shape `{ error: "message" }` for errors.

---
**File Tree (new/modified):**

```
backend/src/
├── controllers/
│   ├── adminBrandController.ts    (NEW)  — brands CRUD
│   ├── adminCustomerController.ts (NEW)  — customers list + stats
│   ├── adminCouponController.ts   (NEW)  — coupons CRUD
│   └── adminAnalyticsController.ts (NEW) — category sales, month comparison
├── routes/
│   └── adminRoutes.ts             (MODIFY) — add new routes
backend/prisma/
├── schema.prisma                  (MODIFY) — add Coupon model
└── seed-orders.js                 (MODIFY) — add coupon seed

frontend/src/
├── pages/admin/
│   ├── AdminBrands.tsx            (NEW)  — brands CRUD page
│   ├── AdminCustomers.tsx         (NEW)  — customers list page
│   ├── AdminCoupons.tsx           (NEW)  — coupons CRUD page
│   └── AdminDashboard.tsx         (MODIFY) — add chart, widget, comparison card
├── components/admin/
│   └── AdminLayout.tsx            (MODIFY) — add nav links for new pages
└── App.tsx                        (MODIFY) — add routes
```

---

## Task A: Dashboard — Sales by Category (Donut Chart)

- [ ] **Backend: `adminAnalyticsController.ts`** — add `getSalesByCategory`
  - Query: group OrderItems by product → category, sum subtotal for paid/delivered/shipped orders in last 30d
  - Return: `{ categories: { name: string; revenue: number; percentage: number }[] }`

- [ ] **Route: `adminRoutes.ts`** — add `router.get('/analytics/sales-by-category', authMiddleware, getSalesByCategory)`

- [ ] **Frontend: `AdminDashboard.tsx`** — add donut chart using Recharts `<PieChart>` + `<Pie>`
  - Fetch from `/admin/analytics/sales-by-category`
  - Render below the revenue chart

## Task B: Dashboard — Month vs Month Comparison

- [ ] **Backend: `adminAnalyticsController.ts`** — add `getMonthComparison`
  - Compare current month (so far) vs previous month for: revenue (paid/delivered/shipped), order count
  - Return: `{ currentMonth: { revenue: number, orders: number }, previousMonth: { revenue: number, orders: number }, revenueChange: number, ordersChange: number }`

- [ ] **Route: `adminRoutes.ts`** — add `router.get('/analytics/month-comparison', authMiddleware, getMonthComparison)`

- [ ] **Frontend: `AdminDashboard.tsx`** — add stat cards showing month-over-month comparison with % change indicator (green up / red down)

## Task C: Dashboard — Orders 24h Feed

- [ ] **Backend: `adminOrderController.ts`** — add `getRecentOrdersFeed`
  - Query: last 10 orders in last 24h, include customerName, total, status, createdAt
  - Return: `{ orders: Order[] }`

- [ ] **Route: `adminRoutes.ts`** — add `router.get('/orders/recent-feed', authMiddleware, getRecentOrdersFeed)`

- [ ] **Frontend: `AdminDashboard.tsx`** — add "Órdenes (24h)" widget listing recent orders with time-ago display

## Task D: Brands CRUD

- [ ] **Backend: `adminBrandController.ts`** — add CRUD: list, create, update, delete brands (soft delete via isActive flag)
  - `getBrands`, `createBrand`, `updateBrand`, `deleteBrand`
  - Follow existing product controller patterns exactly

- [ ] **Route: `adminRoutes.ts`** — add brand routes (all with authMiddleware)

- [ ] **Frontend: `AdminBrands.tsx`** — table listing + modal form (same pattern as AdminProducts.tsx)

- [ ] **Nav link: `AdminLayout.tsx`** — add "Marcas" nav item

- [ ] **Route: `App.tsx`** — add `/admin/marcas` route

## Task E: Customers List

- [ ] **Backend: `adminCustomerController.ts`** — add `getCustomers`
  - Group orders by customerEmail, aggregate: name, email, phone, order count, total spent, last order date
  - Paginate with page/limit
  - Search by name or email
  - Return: `{ customers: CustomerSummary[], total, page, totalPages }`

- [ ] **Route: `adminRoutes.ts`** — add `router.get('/customers', authMiddleware, getCustomers)`

- [ ] **Frontend: `AdminCustomers.tsx`** — table with search, pagination, order count, total spent, last order date

- [ ] **Nav link: `AdminLayout.tsx`** — add "Clientes" nav item

- [ ] **Route: `App.tsx`** — add `/admin/clientes` route

## Task F: Export CSV

- [ ] **Backend: `adminOrderController.ts`** — add `exportOrdersCsv`
  - Query orders (all, no pagination), format as CSV with headers: orderNumber, customerName, customerEmail, total, status, createdAt
  - Return with `Content-Type: text/csv` header

- [ ] **Route: `adminRoutes.ts`** — add `router.get('/orders/export', authMiddleware, exportOrdersCsv)`

- [ ] **Frontend: `AdminOrders.tsx`** — add "Exportar CSV" button that triggers download

## Task G: Coupons / Discounts System

- [ ] **DB: `schema.prisma`** — add Coupon model:
  ```
  model Coupon {
    id          Int       @id @default(autoincrement())
    code        String    @unique
    discountType String    // PERCENTAGE or FIXED
    discountValue Float
    minPurchase Float?
    maxUses     Int?
    usedCount   Int       @default(0)
    isActive    Boolean   @default(true)
    expiresAt   DateTime?
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
  }
  ```

- [ ] **Backend: `adminCouponController.ts`** — add CRUD for coupons (list, create, update, delete)

- [ ] **Route: `adminRoutes.ts`** — add coupon routes

- [ ] **Frontend: `AdminCoupons.tsx`** — table listing + modal form (same pattern as AdminProducts.tsx)

- [ ] **Nav link: `AdminLayout.tsx`** — add "Cupones" nav item

- [ ] **Route: `App.tsx`** — add `/admin/cupones` route

- [ ] **Seed: `seed-orders.js`** — add a few test coupons (PERCENTAGE 10%, FIXED 5000, etc.)

---

**Sub-tasks for each feature:**
1. All backend controllers + routes + db schema (where applicable)
2. All frontend pages/components
3. Nav links and routing
4. Run TypeScript type-check and lint, fix errors
5. Commit
