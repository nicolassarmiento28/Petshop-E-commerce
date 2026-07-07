# CLAUDE.md — Tienda de Mascotas (Pet Shop)

Documento único de contexto y convenciones para agentes de código. Refleja el estado *actual* verificado línea por línea contra el código (2026-07-07). `PLAN.md` es la bitácora histórica de fases.
> Mantener este archivo actualizado con cada decisión arquitectural que cambie algo aquí descrito.

---

## 1. Descripción del Proyecto

Tienda de mascotas online tipo SPA con catálogo de productos, carrito de compras, cupones de descuento, pasarela de pago integrada con **Transbank Webpay Plus**, y un módulo de **reserva de citas veterinarias** con su propio flujo de pago.

**Referencias visuales:**
- https://www.superzoo.cl/ — referencia de megamenú y estructura de categorías
- https://amigales.cl/ — referencia de subcategorías y jerarquía de productos

**Dentro del alcance:**
- Catálogo organizado por 6 secciones principales
- Carrito de compras completo (múltiples productos)
- Checkout con cupón de descuento + pago vía Transbank Webpay Plus
- **Reserva de citas veterinarias** (`/veterinaria`): elegir servicio, ver disponibilidad, agendar, pagar vía Transbank
- Panel de administración (solo admin, sin registro público) con CRUD de productos, marcas, clientes, cupones, órdenes, analytics, y gestión completa de veterinaria (servicios, disponibilidad, excepciones, citas — incluyendo cancelar y reagendar)
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
| Tecnología | Rol |
|---|---|
| React 18 + TypeScript 5 | Framework UI, tipado estático |
| Vite 5 | Bundler y dev server |
| Tailwind CSS 3 | Estilos utilitarios — **único sistema de UI** |
| React Router 6 | Routing SPA |
| Zustand | Estado global: `cartStore` (carrito, persistido), `themeStore` (dark mode), `uiStore` |
| React Query (`@tanstack/react-query`) | Fetching y caché de datos |
| React Hook Form + Zod | Validación de formularios |
| Axios | Cliente HTTP (`services/api.ts`) |
| lucide-react | Iconografía |
| Recharts | Gráficos en AdminDashboard |
| Framer Motion | Transiciones de página y animaciones |
| sonner | Toasts (ej. "agregado al carrito") |

> ⚠️ **No se usa Shadcn/ui.** `@radix-ui/react-dialog`, `react-label`, `react-navigation-menu`, `react-slot` y `class-variance-authority` están instalados en `package.json` pero **no se importan en ningún archivo de `src/`** — residuo de la evaluación de Fase 1, nunca limpiado. No asumir que existen componentes Shadcn ni importar desde `@/components/ui/*` sin verificar primero. Todo el UI son elementos HTML nativos estilizados con Tailwind puro.

### Backend
| Tecnología | Rol |
|---|---|
| Node.js 20+ / Express 4 / TypeScript 5 | Runtime y framework HTTP |
| Prisma ORM 5 / PostgreSQL 15+ | Acceso a base de datos |
| JWT (`jsonwebtoken`) + bcrypt | Autenticación admin |
| Zod | Validación de entrada — ver §6.1 |
| `express-rate-limit` | Rate limiting — ver §6.2 |
| helmet, cors, dotenv | Middleware / config |
| transbank-sdk | Pasarela de pago |
| ExcelJS | Exportación CSV/XLSX desde admin |
| Resend | Envío de emails transaccionales de veterinaria (confirmación, cancelación, reagendamiento) |
| Jest, `ts-jest` | Configurado para testing backend — **sin tests escritos aún** (`test` script existe, no hay archivos `*.test.ts` en `src/`) |
| Playwright | Instalado como devDependency del backend, usado para scripts de verificación end-to-end ad-hoc (no hay suite formal en el repo) |

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
│       │   ├── ui/                 # (si existe) elementos base propios en Tailwind — verificar, no asumir Shadcn
│       │   ├── layout/              # Navbar, Footer, Layout, Breadcrumbs, PageLoader
│       │   ├── product/             # ProductCard, ProductGrid, SizeSelector, BrandsCarousel
│       │   ├── cart/                # CartItem, CartSummary, CartDrawer (custom, focus trap)
│       │   ├── checkout/            # CheckoutForm, checkoutSchema, OrderSummary, TestCardInfo
│       │   ├── payment/             # PaymentResultCard (compartido entre tienda y veterinaria)
│       │   ├── vet/                 # SlotPicker
│       │   └── admin/               # PrivateRoute, AdminLayout, ConfirmDialog, VetSubNav
│       ├── pages/
│       │   ├── Home.tsx, CategoryPage.tsx, AllProductsPage.tsx, ProductPage.tsx
│       │   ├── CartPage.tsx, CheckoutPage.tsx
│       │   ├── PaymentSuccess.tsx, PaymentFailed.tsx
│       │   ├── VetBookingPage.tsx, VetAppointmentSuccess.tsx, VetAppointmentFailed.tsx
│       │   ├── Privacidad → PrivacyPage.tsx, TermsPage.tsx, ReturnsPage.tsx, AboutPage.tsx, NotFound.tsx
│       │   └── admin/
│       │       ├── AdminLogin.tsx, AdminDashboard.tsx
│       │       ├── AdminProducts.tsx, AdminOrders.tsx, AdminBrands.tsx, AdminCustomers.tsx, AdminCoupons.tsx, AdminQr.tsx
│       │       ├── AdminVetServices.tsx, AdminVetAvailability.tsx, AdminVetAppointments.tsx
│       ├── store/                   # cartStore.ts (Zustand + persist), themeStore.ts, uiStore.ts
│       ├── hooks/                   # useProducts, usePayment, useVet, useAdminVet (useCart.ts NO existe — eliminado, wrapper trivial)
│       ├── services/                # api.ts + productService, orderService, paymentService, vetService, adminVetService
│       ├── types/index.ts           # Tipos TS globales (incluye tipos de Appointment/VetService)
│       ├── lib/utils.ts
│       └── utils/                   # formatters.ts, orderStatus.ts, appointmentStatus.ts, transbank.ts
│
├── backend/
│   ├── prisma/schema.prisma + seed (seed-scraper.js → seed-orders.js → seed-vet.js, encadenados en package.json)
│   └── src/
│       ├── controllers/             # product, category, order, payment, coupon, vet, vetPayment
│       │   └── admin/ (por nombre, no subcarpeta): adminProductController, adminOrderController,
│       │       adminBrandController, adminCustomerController, adminCouponController,
│       │       adminAnalyticsController, adminRevenueController, adminVetController, adminController (login)
│       ├── routes/                  # productRoutes, categoryRoutes, brandsRoutes, orderRoutes, paymentRoutes,
│       │                              couponRoutes, vetRoutes, vetPaymentRoutes, adminRoutes (agrupa todo /admin/*)
│       ├── schemas/index.ts         # Schemas Zod compartidos para validateRequest (ver §6.1)
│       ├── middleware/              # authMiddleware, errorHandler, validateRequest, rateLimiter
│       ├── services/                # transbankService, vetAvailabilityService, emailService (Resend)
│       ├── lib/prisma.ts            # singleton PrismaClient
│       ├── utils/logger.ts
│       ├── app.ts, server.ts
│
├── CLAUDE.md                        # Este archivo
├── PLAN.md                          # Bitácora de fases 1-8 (histórico, no reescribir — no cubre vet/seguridad)
└── README.md
```

> `PaymentReturn.tsx` **no existe** — el backend hace redirect server-side directo a `/pago/exito` o `/pago/fallido` (o `/veterinaria/exito` / `/veterinaria/fallido`), no hay ruta intermedia en el frontend.

---

## 4. Navegación

### 6 Secciones Principales (catálogo de productos)

**Perro**: Alimentos · Accesorios · Juguetes · Higiene y bienestar · Antiparasitarios
**Gato**: Alimentos · Arena sanitaria y accesorios · Juguetes y rascadores · Higiene y bienestar · Antiparasitarios
**Farmacia**: antiparasitarios y salud general (categoría propia, sin subcategorías en el árbol actual)
**Pequeñas Mascotas**: Roedores · Aves · Reptiles · Peces y acuarios
**Ofertas**: productos con descuento activo
**Marcas**: grilla de marcas — clic filtra productos por marca

> Slugs reales verificados vía `/api/categories`: `perro`, `gato`, `farmacia`, `pequenas-mascotas`, `ofertas`, `marcas`, `peluqueria`. `peluqueria` es una 7ª categoría de nivel superior no descrita como "sección principal" en el diseño original pero existe en la DB y tiene ruta propia.

### Veterinaria (`/veterinaria`, fuera del árbol de categorías)

Flujo público: elegir servicio → ver slots disponibles (`SlotPicker`) → completar datos del dueño/mascota → crear cita (`PENDING`) → pagar vía Transbank → confirmación (`CONFIRMED`) o fallo. Panel admin dedicado (`/admin/veterinaria`, `/admin/veterinaria/servicios`, `/admin/veterinaria/disponibilidad`) con CRUD de servicios, horario recurrente semanal, excepciones puntuales (bloqueos/aperturas), y gestión de citas incluyendo **cancelar** y **reagendar** (con reenvío de email de notificación al dueño vía Resend).

---

## 5. Schema de Base de Datos (Prisma)

Verificado contra `backend/prisma/schema.prisma`. Modelos de e-commerce (`Category`, `Brand`, `Product`, `Order`, `OrderItem`, `Payment`, `Admin`, `Coupon`) más el módulo de veterinaria (`VetService`, `VetAvailability`, `VetException`, `Appointment`, `AppointmentPayment`).

```prisma
model Category {
  id Int @id @default(autoincrement())
  name String
  slug String @unique
  description String?
  imageUrl String?
  parentId Int?
  parent Category? @relation("SubCategories", fields: [parentId], references: [id])
  children Category[] @relation("SubCategories")
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Brand {
  id Int @id @default(autoincrement())
  name String
  slug String @unique
  logoUrl String?
  sku String?
  products Product[]
}

model Product {
  id Int @id @default(autoincrement())
  name String
  slug String @unique
  description String?
  price Float
  salePrice Float?
  stock Int @default(0)
  sizeGroup String?          // agrupa variantes por talla/tamaño (ej. bolsas de distinto peso)
  imageUrl String?
  images String[]
  sku String?
  isActive Boolean @default(true)
  isFeatured Boolean @default(false)
  categoryId Int
  category Category @relation(fields: [categoryId], references: [id])
  brandId Int?
  brand Brand? @relation(fields: [brandId], references: [id])
  orderItems OrderItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id Int @id @default(autoincrement())
  orderNumber String @unique     // "ORD-<timestamp><6 hex random>" — ver §6.3
  status OrderStatus @default(PENDING)
  total Float
  customerName String
  customerEmail String
  customerPhone String?
  shippingAddress String?
  items OrderItem[]
  payment Payment?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model OrderItem {
  id Int @id @default(autoincrement())
  orderId Int
  order Order @relation(fields: [orderId], references: [id])
  productId Int
  product Product @relation(fields: [productId], references: [id])
  quantity Int
  unitPrice Float
  subtotal Float
}

model Payment {
  id Int @id @default(autoincrement())
  orderId Int @unique
  order Order @relation(fields: [orderId], references: [id])
  status PaymentStatus @default(PENDING)
  tbkToken String?
  tbkBuyOrder String?
  tbkSessionId String?
  tbkAmount Float?
  tbkAuthCode String?
  tbkResponseCode Int?
  tbkCardNumber String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Admin {
  id Int @id @default(autoincrement())
  email String @unique
  password String   // bcrypt hash — nunca se devuelve en responses (verificado)
  name String
  createdAt DateTime @default(now())
}

model Coupon {
  id Int @id @default(autoincrement())
  code String @unique
  discountType String   // "PERCENTAGE" | "FIXED"
  discountValue Float
  minPurchase Float?
  maxUses Int?
  usedCount Int @default(0)
  isActive Boolean @default(true)
  expiresAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum OrderStatus { PENDING PAID PROCESSING SHIPPED DELIVERED CANCELLED REFUNDED }
enum PaymentStatus { PENDING APPROVED REJECTED CANCELLED TIMEOUT }

// ── Veterinaria ──────────────────────────────────────────────────────────
model VetService {
  id Int @id @default(autoincrement())
  name String
  description String?
  durationMin Int
  price Float
  isActive Boolean @default(true)   // soft delete
  appointments Appointment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VetAvailability {
  id Int @id @default(autoincrement())
  dayOfWeek Int      // 0 = domingo ... 6 = sábado
  startTime String   // "09:00"
  endTime String     // "18:00"
  isActive Boolean @default(true)
}

model VetException {
  id Int @id @default(autoincrement())
  date DateTime
  type String        // "BLOCKED_FULL_DAY" | "BLOCKED_SLOT" | "EXTRA_SLOT"
  startTime String?   // requerido si type != BLOCKED_FULL_DAY
  endTime String?
  reason String?
  createdAt DateTime @default(now())
}

// changeReason/rescheduledFrom* guardan solo el ÚLTIMO cambio, no un historial completo.
// Migrar a un modelo AppointmentHistory si se necesita auditar cambios repetidos.
model Appointment {
  id Int @id @default(autoincrement())
  appointmentNumber String @unique   // "CITA-<timestamp><6 hex random>" — ver §6.3
  status AppointmentStatus @default(PENDING)
  serviceId Int
  service VetService @relation(fields: [serviceId], references: [id])
  date DateTime
  startTime String
  endTime String
  ownerName String
  ownerEmail String
  ownerPhone String
  petName String
  petType String?
  notes String?
  rescheduledFrom DateTime?
  rescheduledFromTime String?
  changeReason String?
  changedByAdmin Boolean @default(false)
  payment AppointmentPayment?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AppointmentPayment {
  id Int @id @default(autoincrement())
  appointmentId Int @unique
  appointment Appointment @relation(fields: [appointmentId], references: [id])
  status PaymentStatus
  tbkToken String?
  tbkBuyOrder String?
  tbkSessionId String?
  tbkAmount Float?
  tbkAuthCode String?
  tbkResponseCode Int?
  tbkCardNumber String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AppointmentStatus { PENDING CONFIRMED CANCELLED COMPLETED NO_SHOW }
```

---

## 6. Contrato de API (Endpoints)

### Productos / Categorías / Marcas (públicos)
```
GET  /api/products                    → Lista (filtros: category, brand, sale, search, featured, sort, cursor, limit)
GET  /api/products/price-range        → Rango de precios del catálogo actual
GET  /api/products/:slug              → Detalle de producto
GET  /api/products/:slug/related      → Productos relacionados
GET  /api/categories                  → Árbol de categorías
GET  /api/categories/:slug            → Detalle de categoría
GET  /api/brands                      → Lista de marcas
```

### Órdenes / Pago / Cupones (públicos)
```
POST /api/orders                      → Body: { customerName, customerEmail, customerPhone?, shippingAddress?,
                                                  items: [{productId, quantity}], couponCode? }
                                          Response: { orderId, orderNumber, total, discount?, originalTotal? }
GET  /api/orders/:orderNumber         → Consultar estado de una orden

POST /api/payment/create              → Body: { orderId } → Response: { token, url }
GET  /api/payment/return              → Callback Transbank (?token_ws=...) → commit + redirect
GET  /api/payment/status/:orderNumber → Resultado del pago

POST /api/coupons/validate            → Body: { code, orderTotal } → preview de descuento (no aplica el cupón,
                                          eso ocurre server-side dentro de POST /api/orders)
```

### Veterinaria (públicos)
```
GET  /api/vet/services                → Servicios activos
GET  /api/vet/availability             → ?date&serviceId → slots disponibles
POST /api/vet/appointments             → Crear cita (re-chequea disponibilidad dentro de una transacción
                                          para evitar doble booking por condición de carrera)
POST /api/vet/payment/create           → Body: { appointmentId } → { token, url }
GET  /api/vet/payment/return           → Callback Transbank → commit + envía email de confirmación + redirect
GET  /api/vet/payment/status/:appointmentNumber
```

### Admin (requieren `Authorization: Bearer <jwt>` salvo login)
```
POST   /api/admin/login                          → rate limit dedicado: 5 intentos / 15 min por IP

GET    /api/admin/products / POST / PUT /:id / DELETE /:id (soft delete)
GET    /api/admin/products/low-stock | /top-selling | /export/csv | /export/xlsx

GET    /api/admin/orders / PUT /:id/status
GET    /api/admin/orders/recent-feed | /stats | /export/csv | /export/xlsx

GET    /api/admin/brands / POST / PUT /:id / DELETE /:id
POST   /api/admin/brands/auto-assign             → asigna marca automáticamente por keyword-matching del nombre

GET    /api/admin/customers | /export/csv | /export/xlsx

GET    /api/admin/coupons / POST / PUT /:id / DELETE /:id

GET    /api/admin/analytics/sales-by-category | /month-comparison
GET    /api/admin/revenue

GET    /api/admin/vet/services / POST / PUT /:id / DELETE /:id (soft delete)
GET    /api/admin/vet/availability / POST
GET    /api/admin/vet/exceptions / POST / DELETE /:id
GET    /api/admin/vet/appointments
PUT    /api/admin/vet/appointments/:id/status
PUT    /api/admin/vet/appointments/:id/cancel     → Body: { reason } → envía email de cancelación
PUT    /api/admin/vet/appointments/:id/reschedule → Body: { newDate, newStartTime, reason } → re-chequea
                                                      disponibilidad en transacción, envía email de reagendamiento
```

---

## 6.1 Validación de entrada (Zod)

`backend/src/middleware/validateRequest.ts` envuelve un `ZodSchema` y devuelve 400 con el primer mensaje de error. Los schemas compartidos viven en `backend/src/schemas/index.ts` (login, updates de product/brand/coupon, vet-service/availability/exception, order-status, appointment-status, createOrder, createPayment, validateCoupon, createAppointment, createVetPayment). Algunos controllers (`createProduct`, `createBrand`, `createCoupon`, `cancelAppointment`, `rescheduleAppointment`) definen su schema Zod **inline** en el propio archivo del controller en vez de importarlo de `schemas/index.ts` — inconsistencia de estilo conocida, no de seguridad; ambos patrones validan correctamente. Antes de asumir que un endpoint POST/PUT no está validado, revisar ambos lugares.

Los inputs opcionales tipo URL (`logoUrl`) aceptan explícitamente `''` además de `undefined`/`null` porque el formulario del frontend envía string vacío cuando el campo queda en blanco — un `.url().optional()` sin `.or(z.literal(''))` rechaza esa request con 400.

## 6.2 Rate limiting

`backend/src/middleware/rateLimiter.ts` define dos limiters (`express-rate-limit`):
- `loginLimiter`: 5 intentos / 15 min por IP, aplicado solo a `POST /api/admin/login`.
- `generalLimiter`: 300 requests / 15 min por IP, aplicado a todo `/api/*` en `app.ts` (cubre `/orders`, `/vet/appointments`, etc.).

## 6.3 Generación de identificadores públicos

`orderNumber` y `appointmentNumber` se generan como `` `ORD-${Date.now()}${randomBytes(3).toString('hex')}` `` / `` `CITA-${Date.now()}${randomBytes(3).toString('hex')}` `` — timestamp + 3 bytes random (16.7M combinaciones), no secuenciales ni adivinables por fuerza bruta razonable. **Órdenes/citas creadas antes de este cambio pueden tener el formato viejo** (solo timestamp, sin sufijo random) — no se migraron datos históricos.

Los endpoints `GET /api/orders/:orderNumber` y `GET /api/vet/payment/status/:appointmentNumber` no exigen ningún dato adicional de verificación (ej. email) más allá del número — decisión consciente, evaluada y descartada por no ser necesaria dado el espacio de combinaciones y el rate limiting general.

## 6.4 Autenticación admin

JWT firmado con `{ adminId }` (payload mínimo, sin datos sensibles), `JWT_EXPIRES_IN` por defecto **8h** (no 7d — se acortó porque el token vive en `localStorage`, no en cookie httpOnly, y una sesión larga amplía la ventana de exposición ante un eventual XSS). `frontend/src/components/admin/PrivateRoute.tsx` decodifica el JWT client-side y desloguea proactivamente si `exp` ya pasó, en vez de esperar el primer 401 del backend.

---

## 7. Flujo Completo de Pago — Transbank Webpay Plus

```
PASO 1 — Frontend: usuario confirma carrito, ingresa datos, aplica cupón si tiene, clic "Confirmar pedido"
PASO 2 — POST /api/payment/create { orderId } → Backend crea Payment PENDING vía WebpayPlus.Transaction.create()
PASO 3 — Frontend hace form POST nativo (NO fetch/axios) hacia la URL de Transbank con el token
PASO 4 — Usuario paga en el formulario de Transbank
PASO 5 — Transbank redirige a return_url con ?token_ws=... → GET /api/payment/return → Transaction.commit(token)
PASO 6 — success = result.response_code === 0 → Payment.status=APPROVED + Order.status=PAID (en $transaction),
          si no → Payment.status=REJECTED + Order.status=CANCELLED. Redirige a /pago/exito o /pago/fallido.
PASO 7 — Frontend consulta GET /api/payment/status/:orderNumber y muestra resultado
```

El flujo de **veterinaria** es análogo: `POST /api/vet/payment/create` → form POST a Transbank → `GET /api/vet/payment/return` → `commit()` → `AppointmentPayment.status=APPROVED` + `Appointment.status=CONFIRMED` (en `$transaction`) + email de confirmación vía Resend → redirect a `/veterinaria/exito` o `/veterinaria/fallido`.

No existen rutas intermedias `/pago/retorno` ni `/veterinaria/retorno` en el frontend — el redirect es 100% server-side, y ambos controllers (`paymentReturn`, `vetPaymentReturn`) basan el resultado en `response_code` real del SDK, nunca en la sola presencia de `token_ws`.

---

## 8. Configuración Transbank

```typescript
// backend/src/services/transbankService.ts
const isProduction = process.env.NODE_ENV === 'production'
const SANDBOX_COMMERCE_CODE = '597055555532'   // pública, no secreta
const SANDBOX_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
// Producción: TBK_COMMERCE_CODE / TBK_API_KEY desde env
```

**Tarjetas de prueba (sandbox):**
- VISA aprobada: `4051 8856 0044 6623` · CVV `123` · fecha futura (ej. `12/26`)
- VISA rechazada: `5186 0595 5959 0568` · CVV `123`
- RUT: `11.111.111-1` · Clave: `123`

**Reglas:**
- Fuera de `NODE_ENV=production`, siempre usar credenciales sandbox hardcodeadas.
- Nunca loguear el token TBK completo. `tbkToken` nunca se incluye en responses al cliente (verificado).
- Después de `Transaction.commit()`, actualizar `Payment`/`AppointmentPayment` + `Order`/`Appointment` en un único `prisma.$transaction`.

---

## 9. Variables de Entorno

### `backend/.env`
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"
JWT_SECRET=<al_menos_32_chars_random>   # en producción NUNCA usar un valor de ejemplo — ej. openssl rand -hex 32
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
VET_RETURN_URL=http://localhost:3001/api/vet/payment/return
RESEND_API_KEY=            # si no está seteada, emailService loguea un warning y omite el envío (no rompe el flujo)
EMAIL_FROM="Petshop <reservas@petshop.cl>"
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
npm run lint          # eslint --max-warnings 0 — debe pasar antes de commitear
npm run type-check    # tsc --noEmit
npm run test          # vitest run
```

### Backend (`cd backend`)
```bash
npm install
npm run dev          # ts-node-dev → http://localhost:3001
npm run build        # tsc → dist/
npm run type-check   # tsc --noEmit
npm run test         # jest — configurado pero sin tests escritos aún

npx prisma generate
npx prisma migrate dev --name <descriptive_name>
npx prisma db seed   # encadena seed-scraper.js → seed-orders.js → seed-vet.js
npx prisma studio    # GUI http://localhost:5555
```

> Backend no tiene script `npm run lint` — no confundir con el frontend al pedir que "pase el lint".

### Testing (frontend — Vitest, único con tests reales hoy)
```bash
npx vitest run src/store/__tests__/cartStore.test.ts
npx vitest run src/utils/__tests__/formatters.test.ts
```

### DB local
```bash
docker run --name petshop-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=petshop_db \
  -p 5432:5432 -d postgres:15
```

### Credenciales de prueba
Admin seedeado: `admin@petshop.cl` / `admin123` (ver `backend/prisma/seed*.js`).

---

## 11. TypeScript

- Strict mode en todos los `tsconfig.json` — cero tolerancia a errores.
- No `any` — usar `unknown` + narrowing, o definir un tipo propio.
- `interface` para formas de objeto; `type` para uniones/intersecciones/alias.
- Todos los tipos compartidos del frontend viven en `frontend/src/types/index.ts` (incluye tipos de e-commerce y de veterinaria).
- Enums (`OrderStatus`, `PaymentStatus`, `AppointmentStatus`) deben coincidir exactamente con los nombres del schema Prisma.
- `@/` mapea a `frontend/src/`.

---

## 12. Naming Conventions

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ProductCard.tsx` |
| Custom hooks | `use` + camelCase | `useVet.ts`, `useAdminVet.ts` |
| Servicios | camelCase | `adminVetService.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Modelos Prisma | PascalCase | `Appointment`, `VetService` |
| Route files | camelCase + `Routes` | `vetPaymentRoutes.ts` |
| Controllers | camelCase + `Controller` | `adminVetController.ts` |
| DB slugs | kebab-case | `royal-canin-adult` |

---

## 13. Imports

- Orden: libs externas → internas (`@/`) → relativas → tipos.
- No barrel `index.ts` re-exports salvo que una carpeta tenga 3+ exports.
- Prisma singleton: `import { prisma } from '../lib/prisma'` (backend, imports relativos — no hay alias `@/` configurado en backend).
- Frontend sí usa alias: `import api from '@/services/api'`.

---

## 14. Key Code Patterns

### Backend controller (con validación via middleware)
```typescript
// routes/vetRoutes.ts
router.post('/appointments', validateRequest(createAppointmentSchema), createAppointment)

// controllers/vetController.ts
export const createAppointment = async (req, res, next) => {
  try {
    // req.body ya validado por Zod al llegar acá
    const service = await prisma.vetService.findUnique({ where: { id: serviceId } })
    if (!service?.isActive) { res.status(404).json({ error: 'Service not found' }); return }
    // ... re-chequeo de disponibilidad dentro de $transaction para evitar doble booking
  } catch (error) {
    next(error) // errorHandler centralizado — nunca res.status(500) directo
  }
}
```

### errorHandler — genérico en producción para 5xx
```typescript
const isProduction = process.env.NODE_ENV === 'production'
const message = !isProduction || statusCode < 500 ? (err.message ?? 'Internal server error') : 'Internal server error'
res.status(statusCode).json({ error: message })
```

### Prisma transaction (multi-table)
```typescript
await prisma.$transaction([
  prisma.payment.update({ where: { id }, data: { status: 'APPROVED' } }),
  prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
])
```

### React Query
```typescript
export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: ['products', filters], queryFn: () => fetchProducts(filters) })
```

### Zustand cart store (persistido)
```typescript
export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    items: [],
    addItem: (product, qty) => set((s) => { /* upsert logic */ }),
    removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
  }), { name: 'petshop-cart' }),
)
```

### Form validation (React Hook Form + Zod)
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(checkoutSchema) })
```

### Listas con React Fragment (no `<>` sin key)
Al mapear una fila expandible (ej. orden + fila de detalle), usar `<Fragment key={id}>` explícito — el shorthand `<>` no acepta `key`, y usarlo dentro de un `.map()` dispara warnings de React y puede producir reconciliación incorrecta.

---

## 15. Formatting

- Prettier: comillas simples, trailing commas, 2 espacios, 100 caracteres de ancho.
- `npm run lint` (frontend) debe pasar — errores de ESLint bloquean el build.
- Sin código comentado en commits.
- Precios siempre vía `formatCLP(price)` de `utils/formatters.ts`.

---

## 16. API Design

- Todas las rutas con prefijo `/api/`.
- Status codes: `200` (GET), `201` (POST create), `204` (DELETE), `400` (validación), `401` (unauth), `404` (not found), `409` (conflicto, ej. slot ya tomado).
- Forma de error: `{ "error": "<message>" }` — en producción, errores 5xx nunca exponen `err.message` crudo ni stack traces (ver §6, `errorHandler`).
- Rutas admin requieren `Authorization: Bearer <jwt>` excepto `POST /api/admin/login`.
- Paginación: cursor-based en productos (`?cursor=<id>&limit=20`); **page-based** (`?page=1&limit=20`) en la mayoría de listados admin (orders, brands, coupons, appointments) — no asumir un solo esquema de paginación en todo el proyecto.

---

## 17. Database / Prisma

- **Soft delete** para productos (`isActive: false`) y servicios veterinarios (`isActive: false`) — nunca `DELETE` en esas tablas. Marcas y cupones sí usan `DELETE` real (`deleteBrand` falla con 409 si hay productos asociados por constraint FK).
- Todos los valores monetarios como `Float` (CLP).
- Siempre `prisma.$transaction` para escrituras multi-tabla (pagos, creación de orden con decremento de stock, reagendamiento con re-chequeo de conflicto).
- El seed es una cadena de 3 scripts (`seed-scraper.js`, `seed-orders.js`, `seed-vet.js`) — no un único `seed.ts`.
- Nombres de migración descriptivos: `add_sku_to_product`.
- `$queryRawUnsafe` se usa en `adminCustomerController.ts` con placeholders parametrizados (`$1`, `$2`...) — no es interpolación de strings, es seguro pese al nombre. Verificar esto antes de "corregir" asumiendo SQL injection.

---

## 18. Guía de Estilos UI

### Paleta (Tailwind)
```
Primary (marca): azul           → blue-600 / #2563eb
  - Botones CTA, badge de carrito, precio de oferta, links activos, gradiente de AdminLogin/AdminLayout

Accent (puntual): naranjo cálido → orange-500 / #f97316
  - Ícono del logo PawPrint (único uso consistente en todo el sitio)
  - AdminLogin: link "Volver a la tienda", focus ring de inputs, glow decorativo en dark mode

Accent 2: amarillo suave          → amber-400 / #fbbf24 (token definido, sin usos verificados)

Semántico: verde → emerald-*  (solo badges de estado, ej. "Entregado" en AdminDashboard — no es color de marca)

Background: white / gray-50 (light) — ver dark mode abajo para equivalente
Text: gray-900 / gray-700
```

⚠️ Los tokens `primary` (naranjo) y `secondary` (esmeralda `#059669`) de `tailwind.config.ts` **no reflejan la jerarquía visual real** del sitio — no asumir que esos nombres corresponden a "color principal/secundario".

### Tipografía
- Títulos: `font-bold` + `tracking-tight`. Cuerpo: `font-normal` + `leading-relaxed`.
- Precio normal: `font-bold text-gray-800 dark:text-[#e8eaf0]`.
- Precio con descuento: original `line-through text-gray-400 dark:text-[#8892a4]`, oferta en `font-bold text-blue-600 dark:text-blue-400`.

### Componentes (todos custom en Tailwind, NO Shadcn)
- Carrito lateral (`CartDrawer.tsx`): overlay + focus trap + Escape, **permanece montado en el DOM aunque esté cerrado** (`translate-x-full` cuando `open=false`) — al escribir selectores de test (Playwright, etc.) o buscar elementos por texto/aria-label, escopar siempre al contenedor de la página (`main`, o un `data-testid`) para no matchear la instancia oculta del drawer, que duplica gran parte de la UI del carrito.
- `ConfirmDialog.tsx`: modal de confirmación genérico reutilizado (ej. logout en `AdminLayout` es un flujo de **dos pasos** — clic en "Cerrar sesión" abre el diálogo, hay que confirmar dentro de él para que se ejecute `logout()`).
- Megamenú de categorías, modales, badges: elementos HTML nativos estilizados con Tailwind.
- **Patrón estándar de tarjetas (`ProductCard.tsx`) — hover en dark mode:** borde pasa a `dark-border-hover` + `dark:hover:shadow-lg dark:hover:shadow-black/30`. Replicar en cualquier tarjeta nueva.

### Iconografía
- `PawPrint` de `lucide-react`, `text-orange-500`, en Navbar/Footer/AdminLayout/AdminLogin. No usar el emoji 🐾.

### Responsive
- Mobile-first — breakpoints `sm:` `md:` `lg:` (más `xs: 475px` custom en `tailwind.config.ts`).
- Admin panel: sidebar colapsable en mobile (hamburguesa + overlay), tablas con `overflow-x-auto` + `whitespace-nowrap`.

### Imágenes
- URLs externas o Cloudinary únicamente — no binarios en PostgreSQL.

### Dark mode — tokens de color

**Tokens en `tailwind.config.ts` → `theme.extend.colors.dark`** (tinte verde oliva/musgo oscuro, migrado en todo el sitio — no hay páginas con tono distinto):

| Token | Hex | Uso |
|---|---|---|
| `dark-bg` | `#0e100c` | Fondo de página, en toda la app |
| `dark-surface` | `#181a13` | Nivel 1 — cards, paneles |
| `dark-surface-elevated` | `#20231a` | Nivel 2 — inputs, hovers |
| `dark-border` | `#282b1e` | Borde por defecto |
| `dark-border-hover` | `#3a3f2b` | Borde en hover/focus |

`dark.text` (`#e8eaf0`) y `dark.muted` (`#8892a4`) se mantienen sin cambio de tinte.

> ⚠️ Pendiente menor: `AdminLogin.tsx` usa `dark:text-zinc-100`/`dark:text-zinc-400` (paleta `zinc` genérica) en vez de `dark.text`/`dark.muted` — inconsistencia de nomenclatura, no de tono visual (valores prácticamente iguales). No corregido por no ser un pedido explícito.

**Principio de diseño:** nunca un solo negro plano — página, superficie e inputs en tonos progresivamente más claros para dar profundidad. Azul y naranjo no cambian de familia en dark mode salvo los casos puntuales ya documentados (gradiente `blue-900→blue-700` y glow naranjo del panel de marca, degradado radial azul del Hero).

---

## 19. Footer

Debe incluir: ubicación con link a Google Maps, contacto (teléfono/WhatsApp/email), redes sociales (Instagram/Facebook/TikTok), links legales (privacidad/términos/devoluciones), logo `PawPrint` + copyright.

---

## 20. Seguridad — estado verificado (auditoría 2026-07-07)

Auditoría completa de backend + frontend realizada y corregida en esta fecha. Resumen de controles activos:

| Categoría | Estado |
|---|---|
| Auth de rutas admin | ✅ Todas bajo `authMiddleware`, verificado por-ruta en `adminRoutes.ts` |
| Manipulación de precios | ✅ Precio de productos/servicios/cupones siempre leído de DB server-side, nunca confiado del body |
| Verificación de pago Transbank | ✅ `Transaction.commit()` real, `response_code === 0` decide el estado, nunca se confía en la sola presencia de `token_ws` |
| IDOR | ✅ Mitigado con IDs impredecibles (timestamp+random) — ver §6.3 para el caveat de datos legacy |
| Validación de entrada | ✅ Zod en (casi) todos los POST/PUT — ver §6.1 |
| XSS | ✅ Sin `dangerouslySetInnerHTML`; React auto-escapa; `emailService.ts` escapa manualmente valores dinámicos en templates HTML de email (`escapeHtml()`) |
| Rate limiting | ✅ Login dedicado (5/15min) + general (300/15min en todo `/api`) |
| CORS | ✅ Origin restringido a lista fija + `FRONTEND_URL`, verificado que no refleja orígenes no permitidos |
| Secretos hardcodeados | ✅ Ninguno fuera de las credenciales sandbox de Transbank (públicas por diseño) |
| Exposición de errores | ✅ Genérico en producción para 5xx (ver §14) |
| JWT | ✅ Payload mínimo, expiración 8h, rechaza `alg:none`/secreto incorrecto/expirado/ausente — mitigación de localStorage vía sesión corta + chequeo de `exp` en cliente (no se migró a cookie httpOnly, evaluado y descartado por alcance) |

Pendiente de decisión (no aplicado, requiere `--force`/breaking changes): vulnerabilidades de `npm audit` en `uuid`→`exceljs` (backend) y `esbuild`→`vite` (frontend) que solo se resuelven con downgrade/upgrade mayor.

---

## 21. Out of Scope

Login/registro de clientes · reseñas de productos · blog · múltiples métodos de pago · app móvil nativa.

---

## Convenciones globales (aplicar siempre)

- Todo en TypeScript estricto — nunca `any`.
- Backend: todo handler async con try/catch y `next(error)`; endpoints POST/PUT nuevos deben llevar `validateRequest(schema)` en la ruta (o Zod inline si siguen el patrón ya usado en el controller).
- Frontend: React Query para server state, Zustand solo para carrito/tema/UI.
- Imports: external → internal → relative → types.
- Precios siempre en CLP con `formatCLP()`.
- Errores API: siempre `{ error: string }` — nunca stack traces, y genérico en producción para 5xx.
- Soft delete: productos y servicios veterinarios nunca se borran, `isActive = false`. Marcas/cupones sí se borran.
- Transacciones multi-tabla: siempre `prisma.$transaction([...])`.
- UI: Tailwind puro sin componentes Shadcn/ui (aunque las libs estén instaladas).
- Al mapear filas expandibles en listas, usar `<Fragment key={...}>`, no `<>` sin key.
- Al escribir selectores de test contra el carrito, escopar fuera de `CartDrawer` (permanece en el DOM oculto).

---

## Notas de mantenimiento

- **Antes de asumir que algo del código existe**, verificar contra el repo real — este documento puede quedar desactualizado igual que sus predecesores.
- `PLAN.md` cubre solo hasta Fase 8 (2026-06-09) — la feature de veterinaria completa y el hardening de seguridad descrito en §20 son posteriores y no están loggeados ahí todavía. Si se retoma el hábito de loggear fases, la próxima entrada debería cubrir ambas.
- Cada vez que se agregue una feature o se cierre una ronda de auditoría, revisar si cambió algo descrito aquí (stack, schema, endpoints, componentes UI, seguridad) y actualizar este archivo en el mismo commit.
