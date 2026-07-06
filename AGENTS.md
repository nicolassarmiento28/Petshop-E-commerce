# AGENTS.md —Tienda de Mascotas (Pet Shop)



Documento único de contexto y convenciones para agentes de código. Consolida lo que antes eran `AGENTS.md` + `CONTEXT.md`, corregido para reflejar el estado real del código (ver `PLAN.md` para el historial de fases).

> Mantener este archivo actualizado con cada decisión arquitectural que cambie algo aquí descrito. `PLAN.md` es la bitácora histórica (append-only); este archivo es el estado *actual* del sistema.

---

## 1. Descripción del Proyecto

Tienda de mascotas online tipo SPA con catálogo de productos, carrito de compras, cupones de descuento y pasarela de pago integrada con **Transbank Webpay Plus**.

**Referencias visuales:**
- https://www.superzoo.cl/ — referencia de megamenú y estructura de categorías
- https://amigales.cl/ — referencia de subcategorías y jerarquía de productos

**Dentro del alcance:**
- Catálogo organizado por 6 secciones principales
- Carrito de compras completo (múltiples productos)
- Checkout con cupón de descuento + pago vía Transbank Webpay Plus
- Panel de administración (solo admin, sin registro público) con CRUD de productos, marcas, clientes, cupones, órdenes y analytics
- Exportación de datos (CSV/XLSX) desde el admin
- Footer con ubicación, contacto y redes sociales

**Fuera de alcance:**
- Registro e inicio de sesión de clientes
- Reseñas o valoraciones de productos
- Blog o contenido editorial
- App móvil nativa
- Múltiples métodos de pago (solo Transbank)

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18+ | Framework UI |
| TypeScript | 5+ | Tipado estático |
| Vite | 5+ | Bundler y dev server |
| Tailwind CSS | 3+ | Estilos utilitarios — **único sistema de UI** |
| React Router | 6+ | Routing SPA |
| Zustand | latest | Estado global (carrito) |
| React Query | 5+ | Fetching y caché de datos |
| React Hook Form + Zod | latest | Validación de formularios |
| Axios | latest | Cliente HTTP |
| lucide-react | latest | Iconografía (ej. `PawPrint` para el logo) |
| Recharts | latest | Gráficos en AdminDashboard |

> ⚠️ **No se usa Shadcn/ui.** Fue evaluado en Fase 1 (`components.json` existe) pero descartado — todo el UI son elementos HTML nativos estilizados con Tailwind puro (botones, cards, drawers, modales, etc. son componentes propios, no de Shadcn). No importar desde `@/components/ui/*` asumiendo que existen — verificar primero.

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 4+ | Framework HTTP |
| TypeScript | 5+ | Tipado estático |
| Prisma ORM | 5+ | Acceso a base de datos |
| PostgreSQL | 15+ | Base de datos relacional |
| JWT (jsonwebtoken) | latest | Autenticación admin |
| bcrypt | latest | Hash de contraseñas |
| cors, helmet, dotenv | latest | Middleware / config |
| transbank-sdk | latest | Pasarela de pago |
| ExcelJS | latest | Exportación CSV/XLSX desde admin |
| Jest | latest | Testing backend |

### Deploy
| Servicio | Qué aloja |
|---|---|
| Vercel | Frontend React |
| Railway | Backend Express + PostgreSQL |

---

## 3. Estructura de Carpetas

```
petshop/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── ui/               # Elementos base propios en Tailwind (NO Shadcn)
│       │   ├── layout/            # Navbar, Footer, Layout
│       │   ├── product/           # ProductCard, ProductGrid, ProductDetail
│       │   ├── cart/              # CartItem, CartSummary, CartDrawer (custom, con focus trap)
│       │   └── checkout/          # CheckoutForm, PaymentResult
│       ├── pages/
│       │   ├── Home.tsx, CategoryPage.tsx, ProductPage.tsx
│       │   ├── CartPage.tsx, CheckoutPage.tsx
│       │   ├── PaymentSuccess.tsx, PaymentFailed.tsx
│       │   ├── Privacidad.tsx, Terminos.tsx, Devoluciones.tsx, Nosotros.tsx
│       │   └── admin/
│       │       ├── AdminLogin.tsx, AdminDashboard.tsx
│       │       ├── AdminProducts.tsx, AdminOrders.tsx
│       │       ├── AdminBrands.tsx, AdminCustomers.tsx, AdminCoupons.tsx
│       ├── store/cartStore.ts     # Zustand
│       ├── hooks/                 # useProducts, usePayment (useCart.ts NO existe — eliminado, wrapper trivial)
│       ├── services/               # api.ts + domain services
│       ├── types/index.ts          # Tipos TS globales
│       └── utils/formatters.ts
│
├── backend/
│   ├── prisma/schema.prisma + seed.ts
│   └── src/
│       ├── controllers/           # product, category, order, payment
│       │   └── admin/             # adminProduct, adminOrder, adminBrand, adminCustomer, adminCoupon
│       ├── routes/
│       ├── middleware/            # authMiddleware, errorHandler, validateRequest
│       ├── services/              # transbankService, orderService
│       ├── lib/prisma.ts          # singleton PrismaClient
│       ├── utils/logger.ts
│       ├── app.ts
│       └── server.ts
│
├── CLAUDE.md                       # Este archivo
├── PLAN.md                         # Bitácora de fases (histórico, no reescribir)
└── README.md
```

> `PaymentReturn.tsx` **no existe** — el backend hace redirect server-side directo a `/pago/exito` o `/pago/fallido`, no hay ruta intermedia en el frontend.

---

## 4. Navegación — 6 Secciones Principales

### Perro
Alimentos (seco, húmedo, snacks) · Accesorios (collares, correas, camas) · Juguetes · Higiene y bienestar · Farmacia veterinaria · Antiparasitarios · Ropa y outdoor · Viaje y transporte

### Gato
Alimentos · Arena sanitaria y accesorios · Juguetes y rascadores · Higiene y bienestar · Farmacia veterinaria · Antiparasitarios · Viaje y transporte

### Farmacia
Antiparasitarios (perro y gato) · Farmacia y salud general · Productos post-operatorios · Peluquería e higiene profesional

### Pequeñas Mascotas
Roedores · Aves · Reptiles · Peces y acuarios · Hábitats y jaulas · Alimentos especializados · Accesorios

### Ofertas
Productos con descuento activo · Banners de promociones · Filtro por categoría dentro de ofertas

### Marcas
Grilla visual con logo de cada marca · Clic filtra productos por marca · Ejemplo: Royal Canin, Hills, Purina, Advance, Eukanuba, ProPlan

---

## 5. Schema de Base de Datos (Prisma)

```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  parentId    Int?
  parent      Category? @relation("SubCategories", fields: [parentId], references: [id])
  children    Category[] @relation("SubCategories")
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Brand {
  id       Int       @id @default(autoincrement())
  name     String
  slug     String    @unique
  sku      String?
  logoUrl  String?
  products Product[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  slug        String      @unique
  sku         String?
  description String?
  price       Float
  salePrice   Float?
  stock       Int         @default(0)
  imageUrl    String?
  images      String[]
  isActive    Boolean     @default(true)
  isFeatured  Boolean     @default(false)
  categoryId  Int
  category    Category    @relation(fields: [categoryId], references: [id])
  brandId     Int?
  brand       Brand?      @relation(fields: [brandId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Order {
  id              Int         @id @default(autoincrement())
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)
  total           Float
  customerName    String
  customerEmail   String
  customerPhone   String?
  shippingAddress String?
  items           OrderItem[]
  payment         Payment?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Float
  subtotal  Float
}

model Payment {
  id              Int           @id @default(autoincrement())
  orderId         Int           @unique
  order           Order         @relation(fields: [orderId], references: [id])
  status          PaymentStatus @default(PENDING)
  tbkToken        String?
  tbkBuyOrder     String?
  tbkSessionId    String?
  tbkAmount       Float?
  tbkAuthCode     String?
  tbkResponseCode Int?
  tbkCardNumber   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Coupon {
  id            Int      @id @default(autoincrement())
  code          String   @unique
  discountType  String   // ej: "PERCENTAGE" | "FIXED"
  discountValue Float
  isActive      Boolean  @default(true)
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Admin {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt hash
  name      String
  createdAt DateTime @default(now())
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  TIMEOUT
}
```

> Nota: revisar el `schema.prisma` real del repo para confirmar los campos exactos de `Coupon` — su estructura no está detallada en `PLAN.md`, solo su existencia. Actualizar esta sección cuando se confirme.

---

## 6. Contrato de API (Endpoints)

### Productos
```
GET    /api/products                    → Lista (filtros: category, brand, sale, search, featured, sort, cursor, limit)
GET    /api/products/:slug              → Detalle de producto
GET    /api/products/:slug/related      → Productos relacionados
GET    /api/categories                  → Árbol de categorías
GET    /api/categories/:slug            → Detalle de categoría
GET    /api/brands                      → Lista de marcas
```

### Órdenes
```
POST   /api/orders                      → Crear orden previa al pago
                                          Body: { customerName, customerEmail, customerPhone, shippingAddress?, items: [{productId, quantity}], couponCode? }
                                          Response: { orderId, orderNumber, total }
GET    /api/orders/:orderNumber         → Consultar estado de una orden
```

### Pago — Transbank Webpay Plus
```
POST   /api/payment/create              → Body: { orderId } → Response: { token, url }
GET    /api/payment/return              → Callback Transbank (?token_ws=...) → commit + redirect a /pago/exito o /pago/fallido
GET    /api/payment/status/:orderNumber → Resultado del pago
```

### Admin (requieren `Authorization: Bearer <jwt>`)
```
POST   /api/admin/login                 → Body: { email, password } → Response: { token }

GET    /api/admin/products              → Todos los productos (incluye inactivos)
POST   /api/admin/products              → Crear producto
PUT    /api/admin/products/:id          → Editar producto
DELETE /api/admin/products/:id          → Soft delete (isActive = false)
GET    /api/admin/products/export       → CSV/XLSX

GET    /api/admin/orders                → Lista todas las órdenes
PUT    /api/admin/orders/:id/status      → Actualizar estado
GET    /api/admin/orders/export          → CSV/XLSX

GET    /api/admin/brands                → CRUD marcas
POST   /api/admin/brands
PUT    /api/admin/brands/:id
DELETE /api/admin/brands/:id

GET    /api/admin/customers             → Lista clientes con total gastado
GET    /api/admin/customers/export      → CSV/XLSX

GET    /api/admin/coupons               → CRUD cupones
POST   /api/admin/coupons
PUT    /api/admin/coupons/:id
DELETE /api/admin/coupons/:id

GET    /api/admin/analytics             → Órdenes por estado
GET    /api/admin/revenue               → Ingresos por período
```

> Nota: verificar en el código real los nombres exactos de rutas de exportación y de brands/customers/coupons — `PLAN.md` confirma su existencia pero no los paths literales. Ajustar aquí una vez confirmados contra `adminRoutes.ts`.

---

## 7. Flujo Completo de Pago — Transbank Webpay Plus

```
PASO 1 — Frontend: usuario confirma carrito, ingresa datos, aplica cupón si tiene, clic "Pagar con Webpay"

PASO 2 — POST /api/payment/create { orderId }
  → Backend crea orden PENDING → WebpayPlus.Transaction.create(buyOrder, sessionId, amount, returnUrl)
  → Backend guarda token en Payment → responde { token, url }

PASO 3 — Frontend hace form POST hacia la URL de Transbank
  ⚠️ NO usar fetch/axios. Form HTML nativo con method="POST":
  <form action={url} method="POST">
    <input type="hidden" name="token_ws" value={token} />
  </form>

PASO 4 — Usuario paga en formulario de Transbank (la app no interviene)

PASO 5 — Transbank redirige a return_url con ?token_ws=...
  → GET /api/payment/return recibe el token → Transaction.commit(token)

PASO 6 — Backend procesa resultado
  SI responseCode === 0 (APROBADO):
    → Payment.status = APPROVED, Order.status = PAID (en $transaction)
    → Guarda authCode, cardNumber
    → Redirige a {FRONTEND_URL}/pago/exito?order={orderNumber}
  SI responseCode !== 0 (RECHAZADO/CANCELADO):
    → Payment.status = REJECTED o CANCELLED, Order.status se mantiene PENDING
    → Redirige a {FRONTEND_URL}/pago/fallido?order={orderNumber}

PASO 7 — Frontend: PaymentSuccess.tsx / PaymentFailed.tsx
  → GET /api/payment/status/:orderNumber
  → Éxito: muestra orden, monto, últimos 4 dígitos, código autorización, limpia carrito (cartStore.clearCart())
  → Fallo: muestra motivo, botones "Reintentar" y "Volver al inicio"
```

No existe una ruta intermedia `/pago/retorno` en el frontend — el redirect es 100% server-side.

---

## 8. Configuración Transbank

```typescript
// backend/src/services/transbankService.ts
import { WebpayPlus, Options, Environment } from 'transbank-sdk';

const isProduction = process.env.NODE_ENV === 'production';

// Sandbox — credenciales públicas de prueba, NO secretas
const SANDBOX_COMMERCE_CODE = '597055555532';
const SANDBOX_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

// Producción — requiere contrato con Transbank
const PROD_COMMERCE_CODE = process.env.TBK_COMMERCE_CODE!;
const PROD_API_KEY = process.env.TBK_API_KEY!;

export const transbankOptions = isProduction
  ? new Options(PROD_COMMERCE_CODE, PROD_API_KEY, Environment.Production)
  : new Options(SANDBOX_COMMERCE_CODE, SANDBOX_API_KEY, Environment.Integration);
```

**Tarjetas de prueba (sandbox):**
- VISA aprobada: `4051 8856 0044 6623` · CVV `123` · fecha cualquiera futura (ej. `12/26`)
- VISA rechazada: `5186 0595 5959 0568` · CVV `123`
- RUT: `11.111.111-1` · Clave: `123`

**Reglas:**
- Fuera de `NODE_ENV=production`, siempre usar credenciales sandbox hardcodeadas.
- Nunca loguear el token TBK completo.
- Después de `Transaction.commit()`, actualizar `Payment` + `Order` en un único `prisma.$transaction`.

---

## 9. Variables de Entorno

### `backend/.env`
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"
JWT_SECRET=<al_menos_32_chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
# TBK_COMMERCE_CODE y TBK_API_KEY — solo producción
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 10. Comandos

### Frontend (`cd frontend`)
```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint         # debe pasar antes de commitear
npm run type-check   # tsc --noEmit
```

### Backend (`cd backend`)
```bash
npm install
npm run dev          # ts-node-dev → http://localhost:3001
npm run build        # tsc → dist/
npm run lint
npm run type-check

npx prisma generate
npx prisma migrate dev --name <descriptive_name>
npx prisma db seed
npx prisma studio    # GUI http://localhost:5555
```

### Testing
```bash
# Frontend (Vitest)
npx vitest run src/components/product/ProductCard.test.tsx
npx vitest run --reporter=verbose -t "should add item to cart"

# Backend (Jest)
npx jest --testPathPattern="productController"
npx jest -t "should return 404 when product not found"
```

### DB local
```bash
docker run --name petshop-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=petshop_db \
  -p 5432:5432 -d postgres:15
```

---

## 11. TypeScript

- Strict mode en todos los `tsconfig.json` — cero tolerancia a errores.
- No `any` — usar `unknown` + narrowing, o definir un tipo propio.
- `interface` para formas de objeto; `type` para uniones/intersecciones/alias.
- Todos los tipos compartidos del frontend viven en `frontend/src/types/index.ts`.
- Enums (`OrderStatus`, `PaymentStatus`) deben coincidir exactamente con los nombres del schema Prisma.
- `@/` mapea a `frontend/src/` — configurado en `vite.config.ts` y `tsconfig.json`.

---

## 12. Naming Conventions

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ProductCard.tsx` |
| Custom hooks | `use` + camelCase | `useProducts.ts` |
| Servicios | camelCase | `productService.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Modelos Prisma | PascalCase | `Product`, `Order` |
| Route files | camelCase + `Routes` | `productRoutes.ts` |
| Controllers | camelCase + `Controller` | `productController.ts` |
| DB slugs | kebab-case | `royal-canin-adult` |

---

## 13. Imports

- Orden: libs externas → internas (`@/`) → relativas → tipos.
- No barrel `index.ts` re-exports salvo que una carpeta tenga 3+ exports.
- Elementos de UI propios (no Shadcn): `import { Button } from '@/components/ui/Button'` (verificar nombre/case real en el repo).
- Prisma singleton: `import { prisma } from '@/lib/prisma'` (backend).

---

## 14. Key Code Patterns

### Backend controller
```typescript
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error); // errorHandler centralizado — nunca res.status(500) directo
  }
};
```

### Prisma transaction (multi-table)
```typescript
await prisma.$transaction([
  prisma.payment.update({ where: { id }, data: { status: 'APPROVED' } }),
  prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
]);
```

### React Query
```typescript
export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: ['products', filters], queryFn: () => fetchProducts(filters) });

const { mutate } = useMutation({ mutationFn: createOrder, onSuccess: (data) => { ... } });
```

### Zustand cart store
```typescript
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

## 15. Formatting

- Prettier: comillas simples, trailing commas, 2 espacios, 100 caracteres de ancho.
- `npm run lint` debe pasar — errores de ESLint bloquean el build.
- Sin código comentado en commits.
- Precios siempre vía `formatCLP(price)` de `utils/formatters.ts`.

---

## 16. API Design

- Todas las rutas con prefijo `/api/`.
- Status codes: `200` (GET), `201` (POST create), `204` (DELETE), `404` (not found), `401` (unauth).
- Forma de error: `{ "error": "<message>" }` — nunca exponer stack traces ni errores de Prisma.
- Rutas admin requieren `Authorization: Bearer <jwt>`.
- Paginación: cursor-based `?cursor=<id>&limit=20`.

---

## 17. Database / Prisma

- **Soft delete solo** para productos: `isActive = false`, nunca `DELETE`.
- Todos los valores monetarios como `Float` (CLP).
- Siempre `prisma.$transaction` para escrituras multi-tabla.
- El seed (`prisma/seed.ts`) debe ser idempotente.
- Nombres de migración descriptivos: `add_sku_to_product`.

---

## 18. Guía de Estilos UI

### Paleta (Tailwind)
> ⚠️ Corregido (verificado línea por línea contra el código, 2026-07): **azul (`blue-600` / `#2563eb`) es el color primario/de marca real**, no el naranjo. `tailwind.config.ts` define tokens `primary` (naranjo `#f97316`) y `secondary` (esmeralda `#059669`) que **no reflejan la jerarquía visual real** — no asumir que esos nombres de token corresponden a "color principal / color secundario" del sitio.

```
Primary (marca): azul           → blue-600 / #2563eb
  - Botones CTA: "Ver productos" (Home), "Agregar al carrito" (ProductCard), "Ingresar" (AdminLogin), submit de búsqueda (Navbar)
  - Badge de conteo del carrito (Navbar)
  - Precio de oferta (ProductCard: `text-blue-600 dark:text-blue-400`)
  - Links activos / hover de navegación (Navbar, Footer, AdminLayout sidebar)
  - Gradiente del panel de marca en AdminLogin (`from-blue-800 to-blue-600`, `dark:from-blue-900 dark:to-blue-700`)

Accent (puntual): naranjo cálido → orange-500 / #f97316
  - Ícono del logo `PawPrint` (Navbar, Footer, AdminLayout, AdminLogin) — el único uso consistente en todo el sitio
  - AdminLogin: link "Volver a la tienda" en el panel de marca (`text-orange-300`), focus ring de inputs (`focus:ring-orange-500/30`), glow decorativo detrás del logo en dark mode (`bg-orange-500/30 blur-2xl`)
  - No se usa como fondo de botones ni como color de precio (corregido — esta guía decía antes `text-orange-500` para precios; el código real usa `text-blue-600` para el precio con descuento, ver sección Tipografía)

Accent 2: amarillo suave          → amber-400 / #fbbf24 (definido en `tailwind.config.ts`, sin usos verificados fuera de ahí)

Semántico (no es color de marca): verde → emerald-* (ej. `emerald-50/200/700` y sus `dark:`)
  - Único uso real encontrado: color de estado en badges de admin, ej. `AdminDashboard.tsx` para la orden en estado "Entregado" (`DELIVERED`). No se usa como color secundario de marca en ningún botón, fondo ni CTA — no confundir con el token `secondary` de `tailwind.config.ts`.

Background: blanco / gris        → white / gray-50 (light) — ver sección "Dark mode — tokens de color" para el equivalente dark
Text:       gris oscuro          → gray-900 / gray-700
```

### Tipografía
- Títulos: `font-bold` + `tracking-tight`
- Cuerpo: `font-normal` + `leading-relaxed`
- Precio normal: `font-bold text-gray-800 dark:text-[#e8eaf0]` (corregido — no es naranjo)
- Precio con descuento: original con `line-through text-gray-400 dark:text-[#8892a4]`, precio de oferta en `font-bold text-blue-600 dark:text-blue-400` (corregido — el código real usa azul, no naranjo, ver `ProductCard.tsx`)

### Componentes (todos custom en Tailwind, NO Shadcn)
- Carrito lateral (drawer): implementación propia con overlay + focus trap + tecla Escape
- Megamenú de categorías: implementación propia
- Modales de confirmación, badges de descuento/"Nuevo", inputs de formularios: todos elementos HTML nativos estilizados con Tailwind

### Iconografía
- `PawPrint` de `lucide-react` con `text-orange-500` para el logo — usado en Navbar, Footer, AdminLayout sidebar y AdminLogin. No usar el emoji 🐾.

### Responsive
- Mobile-first — usar breakpoints `sm:` `md:` `lg:`.
- Admin panel: sidebar colapsable en mobile (hamburguesa + overlay), tablas con `overflow-x-auto` + `whitespace-nowrap`.

### Imágenes
- URLs externas o Cloudinary únicamente — no binarios en PostgreSQL.

### Dark mode — tokens de color

> ⚠️ **Discrepancia detectada al verificar contra el código (2026-07):** hoy conviven **dos paletas dark distintas** que no coinciden entre sí. Documentamos ambas tal como existen realmente — no se inventó ni promedió ningún valor.

**Sistema 1 — tokens en `tailwind.config.ts` (`dark.*`), usado en la mayoría del sitio:**

| Token (`tailwind.config.ts`) | Valor hex | Uso real verificado |
|---|---|---|
| `dark.bg` | `#111111` | Fondo de página — Navbar (barra de envío), Home, AdminLayout main |
| `dark.surface` | `#1a1a1a` | Header/Navbar, ProductCard, secciones de Home, AdminLayout sidebar |
| `dark.surface2` | `#222222` | Inputs, imagen placeholder de ProductCard, botones secundarios, hover backgrounds |
| `dark.border` | `#2a2a2a` | Bordes por defecto de Navbar, ProductCard, Home, AdminLayout |
| `dark.text` | `#e8eaf0` | Texto principal |
| `dark.muted` | `#8892a4` | Texto secundario / placeholders |

Componentes confirmados usando este sistema: `Navbar.tsx`, `Footer.tsx`, `ProductCard.tsx`, `Home.tsx`, `AdminLayout.tsx`.

**Sistema 2 — hex arbitrarios inline en `AdminLogin.tsx`, NO registrados en `tailwind.config.ts`:**

| Clase real en el código | Valor hex | Uso |
|---|---|---|
| `dark:bg-[#0b0f19]` | `#0b0f19` | Fondo de página del login |
| `dark:bg-[#12161f]` | `#12161f` | Tarjeta del formulario (nivel 1, elevada sobre el fondo) |
| `dark:bg-[#1a1f2b]` | `#1a1f2b` | Inputs y bloque de credenciales de prueba (nivel 2, un paso más claro que la tarjeta) |
| `dark:border-[#1f2430]` | `#1f2430` | Borde de la tarjeta |
| `dark:border-[#2a2f3d]` | `#2a2f3d` | Borde de inputs |
| `dark:text-zinc-*` | (paleta zinc de Tailwind, no hex custom) | Texto principal (`zinc-100`) y secundario (`zinc-400`) |

> ⚠️ La tabla de tokens `dark-surface-elevated (#181d29)` y `dark-border-hover (#3b4358)` solicitada para esta actualización **no existe en ningún archivo del código real** (ni en `tailwind.config.ts` ni en componentes) — no se documenta como implementada porque no lo está. `AdminLogin.tsx` sí logra 3 niveles de profundidad (`#0b0f19` → `#12161f` → `#1a1f2b`), pero con valores distintos a los pedidos y sin nombre de token, solo como clases `dark:bg-[#hex]` sueltas.

**Principio de diseño (válido y aplicado, aunque con dos paletas distintas):** nunca un solo negro plano para todo — página, tarjeta/superficie e inputs deben ser 3 tonos progresivamente más claros para dar sensación de profundidad. Azul y naranjo **no cambian de familia** en dark mode salvo los casos puntuales ya implementados: el gradiente `blue-900 → blue-700` y el glow naranjo (`bg-orange-500/30 blur-2xl`) del panel de marca en `AdminLogin.tsx`.

**Recomendación (no aplicada automáticamente, pendiente de decisión):** unificar ambos sistemas — o se extiende `tailwind.config.ts` con los tokens azulados de `AdminLogin.tsx` (`dark.bg2`, `dark.surface3`, etc., con nombres a definir) para que el resto del admin los reutilice, o se migra `AdminLogin.tsx` a los tokens `dark.*` ya existentes. Mientras no se decida, no asumir que un tono "dark" nuevo en otra página coincide con ninguno de los dos sistemas de arriba sin verificarlo en el código.

---

## 19. Footer

Debe incluir:
- **Ubicación:** dirección física con enlace a Google Maps
- **Contacto:** teléfono, WhatsApp, email
- **Redes sociales:** Instagram, Facebook, TikTok
- **Links legales:** Política de privacidad, Términos y condiciones, Cambios y devoluciones
- **Logo** (ícono `PawPrint`) y copyright

---

## 20. Decisiones Técnicas Importantes

| Decisión | Elección | Razón |
|---|---|---|
| UI system | Tailwind puro, sin Shadcn/ui | Evaluado en Fase 1, descartado — se optó por componentes propios |
| Estado del carrito | Zustand | Simple, sin boilerplate, persiste en localStorage |
| Fetching de datos | React Query | Caché automático, loading/error states, refetch |
| Routing | React Router v6 | Estándar SPA, soporte layouts anidados |
| Validación forms | React Hook Form + Zod | Tipado fuerte con TypeScript |
| Imágenes de productos | URLs externas o Cloudinary | No almacenar binarios en PostgreSQL |
| Paginación productos | Cursor-based | Más eficiente que offset para catálogos grandes |
| Soft delete productos | `isActive: false` | No perder historial en órdenes existentes |
| Exportación de datos | ExcelJS (CSV/XLSX) | Necesidad del admin panel para reportes |

---

## 21. Out of Scope

Login/registro de clientes · reseñas de productos · blog · múltiples métodos de pago · app móvil nativa.

---

## Convenciones globales (aplicar siempre)

- Todo en TypeScript estricto — nunca `any`.
- Backend: todo handler async con try/catch y `next(error)`.
- Frontend: React Query para server state, Zustand solo para carrito.
- Imports: external → internal → relative → types.
- Precios siempre en CLP con `formatCLP()`.
- Errores API: siempre `{ error: string }` — nunca stack traces.
- Soft delete: nunca borrar productos, usar `isActive = false`.
- Transacciones multi-tabla: siempre `prisma.$transaction([...])`.
- Paginación: cursor-based `?cursor=<id>&limit=20`.
- UI: Tailwind puro sin componentes Shadcn/ui.

---

## Notas de mantenimiento

- **Antes de asumir que algo del código existe** (una ruta, un archivo, una dependencia), verificar contra el repo real — este documento puede quedar desactualizado igual que sus predecesores.
- Puntos marcados con ⚠️ en este archivo señalan detalles que se confirmaron por inferencia de `PLAN.md` pero no se verificaron línea por línea contra el código fuente (estructura exacta de `Coupon`, paths literales de export CSV/XLSX, endpoints de brands/customers/coupons). Confirmar y actualizar cuando se toque esa parte del código.
- Cada vez que se cierre una fase en `PLAN.md`, revisar si cambió algo descrito aquí (stack, schema, endpoints, componentes UI) y actualizar este archivo en el mismo commit.
