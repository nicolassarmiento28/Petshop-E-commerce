# AGENTS.md — Petshop Project

Guidance for agentic coding agents. Architecture source of truth: `CONTEXT.md`. Implementation plan: `PLAN.md`.

---

## Stack

- **Frontend:** React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Shadcn/ui · React Router 6 · React Query 5 · Zustand · React Hook Form + Zod · Axios
- **Backend:** Node.js 20 · Express 4 · TypeScript 5 · Prisma 5 · PostgreSQL 15 · JWT · bcrypt · transbank-sdk
- **Deploy:** Vercel (frontend) · Railway (backend + DB)

---

## Repository Structure

```
petshop/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── components/ui|layout|product|cart|checkout
│       ├── pages/     # Route-level components
│       ├── store/     # cartStore.ts (Zustand)
│       ├── hooks/     # useProducts, useCart, usePayment
│       ├── services/  # api.ts + domain services
│       ├── types/     # index.ts — all shared types
│       └── utils/     # formatters.ts
├── backend/           # Express REST API
│   ├── prisma/        # schema.prisma + seed.ts
│   └── src/
│       ├── controllers|routes|middleware|services|utils|lib
└── CONTEXT.md
```

---

## Commands

### Frontend (`cd frontend`)

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint         # ESLint — must pass before committing
npm run type-check   # tsc --noEmit
```

### Backend (`cd backend`)

```bash
npm install
npm run dev          # ts-node-dev → http://localhost:3001
npm run build        # tsc → dist/
npm run lint
npm run type-check

# Prisma
npx prisma generate
npx prisma migrate dev --name <descriptive_name>
npx prisma db seed
npx prisma studio    # GUI at http://localhost:5555
```

### Running a Single Test

```bash
# Frontend (Vitest)
npx vitest run src/components/product/ProductCard.test.tsx
npx vitest run --reporter=verbose -t "should add item to cart"

# Backend (Jest)
npx jest --testPathPattern="productController"
npx jest -t "should return 404 when product not found"
```

### Local DB

```bash
docker run --name petshop-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=petshop_db \
  -p 5432:5432 -d postgres:15
```

---

## Environment Variables

Copy `.env.example` → `.env` before running locally.

### `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"
JWT_SECRET=<at_least_32_chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
# TBK_COMMERCE_CODE and TBK_API_KEY — production only
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
```

---

## TypeScript

- Strict mode on in all `tsconfig.json` files — zero tolerance for errors.
- No `any` — use `unknown` + narrowing, or define a proper type.
- `interface` for object shapes; `type` for unions/intersections/aliases.
- All shared frontend types live in `frontend/src/types/index.ts`.
- Enums (`OrderStatus`, `PaymentStatus`) must match Prisma schema names exactly.
- `@/` alias maps to `frontend/src/` — configured in `vite.config.ts` and `tsconfig.json`.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase | `ProductCard.tsx` |
| Custom hooks | `use` prefix + camelCase | `useCart.ts` |
| Services | camelCase | `productService.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Prisma models | PascalCase | `Product`, `Order` |
| Route files | camelCase + `Routes` suffix | `productRoutes.ts` |
| Controllers | camelCase + `Controller` suffix | `productController.ts` |
| DB slugs | kebab-case | `royal-canin-adult` |

---

## Imports

- Order: external libs → internal (`@/`) → relative → types.
- No barrel `index.ts` re-exports unless a folder has 3+ exports.
- Shadcn/ui components: `import { Button } from '@/components/ui/button'`.
- Prisma singleton: `import { prisma } from '@/lib/prisma'` (backend).

---

## Key Code Patterns

### Backend controller

```typescript
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error); // centralized errorHandler — never res.status(500) directly
  }
};
```

### Prisma transaction (multi-table updates)

```typescript
await prisma.$transaction([
  prisma.payment.update({ where: { id }, data: { status: 'APPROVED' } }),
  prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
]);
```

### React Query (frontend data fetching)

```typescript
// hooks/useProducts.ts
export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: ['products', filters], queryFn: () => fetchProducts(filters) });

// mutations
const { mutate } = useMutation({ mutationFn: createOrder, onSuccess: (data) => { ... } });
```

### Zustand cart store

```typescript
// store/cartStore.ts — persist to localStorage
export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    items: [],
    addItem: (product, qty) => set((s) => { /* upsert logic */ }),
    removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
    get totalItems() { return get().items.reduce((n, i) => n + i.quantity, 0); },
    get totalPrice() { return get().items.reduce((n, i) => n + i.unitPrice * i.quantity, 0); },
  }), { name: 'petshop-cart' })
);
```

### Form validation (React Hook Form + Zod)

```typescript
const schema = z.object({ customerName: z.string().min(2), customerEmail: z.string().email() });
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
```

---

## Formatting

- Prettier: single quotes, trailing commas, 2-space indent, 100-char line width.
- `npm run lint` must pass — ESLint errors block builds.
- No commented-out code in commits.
- Prices always displayed via `formatCLP(price)` from `utils/formatters.ts`.

---

## API Design

- All routes prefixed `/api/`.
- Status codes: `200` (GET), `201` (POST create), `204` (DELETE), `404` (not found), `401` (unauth).
- Error shape: `{ "error": "<message>" }` — never expose stack traces or Prisma errors.
- Admin routes require `Authorization: Bearer <jwt>`.
- Pagination: cursor-based `?cursor=<id>&limit=20`.

---

## Database / Prisma

- **Soft delete only** for products: `isActive = false`, never `DELETE`.
- All monetary values as `Float` (CLP).
- Always `prisma.$transaction` when writing to multiple related tables.
- Seed file (`prisma/seed.ts`) must be idempotent.
- Migration names must be descriptive: `add_featured_flag_to_product`.

---

## Transbank Rules

- Outside `NODE_ENV=production`, always use hardcoded sandbox credentials (in `transbankService.ts`).
- Never log the full TBK token.
- Frontend must submit to Transbank via a native `<form method="POST">` — never `fetch`/`axios`.
- After `Transaction.commit()`, update `Payment` + `Order` in one `prisma.$transaction`.
- Sandbox card: `4051 8856 0044 6623` · Vencimiento `12/26` · CVV `123` · RUT `11.111.111-1` · clave `123`.

---

## UI / Style

- Colors: `orange-500` (primary) · `emerald-600` (secondary) · `amber-400` (accent).
- Discounted price: original with `line-through text-gray-400`, sale price in `text-orange-500`.
- Cart drawer: Shadcn `Sheet`. Mega-menu: Shadcn `NavigationMenu`.
- Mobile-first — use Tailwind breakpoints `sm:` `md:` `lg:`.
- Images: external URLs or Cloudinary only — no binary blobs in PostgreSQL.

---

## Out of Scope

Customer login/registration · product reviews · blog content · multiple payment methods · native mobile app.
