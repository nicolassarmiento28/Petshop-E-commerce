# CONTEXT.md — Tienda de Mascotas (Pet Shop)

> Documento de contexto del proyecto. Mantenerlo actualizado en cada iteración.
> Usar junto con `/init` al iniciar cada sesión en OpenCode.

---

## 1. Descripción del Proyecto

Tienda de mascotas online tipo SPA (Single Page Application) con catálogo de productos, carrito de compras y pasarela de pago integrada con **Transbank Webpay Plus**.

**Referencias visuales:**
- https://www.superzoo.cl/ — referencia de megamenú y estructura de categorías
- https://amigales.cl/ — referencia de subcategorías y jerarquía de productos

**Lo que está DENTRO del alcance:**
- Catálogo de productos organizado por 6 secciones principales
- Carrito de compras completo (múltiples productos)
- Checkout con pago via Transbank Webpay Plus
- Panel de administración (solo para admin, sin registro público)
- Footer con ubicación, contacto y redes sociales

**Lo que está FUERA del alcance (por ahora):**
- Registro e inicio de sesión de clientes
- Sistema de reseñas o valoraciones
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
| Tailwind CSS | 3+ | Estilos utilitarios |
| Shadcn/ui | latest | Componentes base accesibles |
| React Router | 6+ | Routing SPA |
| Zustand | latest | Estado global (carrito) |
| React Query | 5+ | Fetching y caché de datos |
| Axios | latest | Cliente HTTP |

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
| cors | latest | Middleware CORS |
| helmet | latest | Seguridad HTTP headers |
| dotenv | latest | Variables de entorno |
| transbank-sdk | latest | Pasarela de pago |

### Deploy
| Servicio | Qué aloja |
|---|---|
| Vercel | Frontend React |
| Railway | Backend Express + PostgreSQL |

---

## 3. Estructura de Carpetas

```
petshop/
├── frontend/                     # React + Vite
│   ├── public/
│   ├── src/
│   │   ├── assets/               # Imágenes, íconos, fuentes
│   │   ├── components/
│   │   │   ├── ui/               # Componentes Shadcn/ui (copiados aquí)
│   │   │   ├── layout/           # Navbar, Footer, Layout
│   │   │   ├── product/          # ProductCard, ProductGrid, ProductDetail
│   │   │   ├── cart/             # CartDrawer, CartItem, CartSummary
│   │   │   └── checkout/         # CheckoutForm, PaymentResult
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── CategoryPage.tsx  # Reutilizable para todas las categorías
│   │   │   ├── ProductPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── PaymentReturn.tsx  # Callback de Transbank
│   │   │   ├── PaymentSuccess.tsx
│   │   │   ├── PaymentFailed.tsx
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminProducts.tsx
│   │   │       └── AdminOrders.tsx
│   │   ├── store/
│   │   │   └── cartStore.ts      # Zustand: estado del carrito
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useCart.ts
│   │   │   └── usePayment.ts
│   │   ├── services/
│   │   │   ├── api.ts            # Instancia Axios configurada
│   │   │   ├── productService.ts
│   │   │   ├── orderService.ts
│   │   │   └── paymentService.ts
│   │   ├── types/
│   │   │   └── index.ts          # Tipos TypeScript globales
│   │   ├── utils/
│   │   │   └── formatters.ts     # Formateo de precios, fechas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                      # Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── productController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── paymentController.ts
│   │   │   └── adminController.ts
│   │   ├── routes/
│   │   │   ├── productRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── paymentRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # Verificación JWT admin
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── services/
│   │   │   ├── transbankService.ts
│   │   │   └── orderService.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   ├── app.ts                # Express app config
│   │   └── server.ts             # Entry point
│   ├── .env
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── CONTEXT.md                    # Este archivo
└── README.md
```

---

## 4. Navegación — 6 Secciones Principales

### Perro
- Alimentos (seco, húmedo, snacks)
- Accesorios (collares, correas, camas)
- Juguetes
- Higiene y bienestar
- Farmacia veterinaria
- Antiparasitarios
- Ropa y outdoor
- Viaje y transporte

### Gato
- Alimentos (seco, húmedo, snacks)
- Arena sanitaria y accesorios
- Juguetes y rascadores
- Higiene y bienestar
- Farmacia veterinaria
- Antiparasitarios
- Viaje y transporte

### Farmacia
- Antiparasitarios (perro y gato)
- Farmacia y salud general
- Productos post-operatorios
- Peluquería e higiene profesional

### Pequeñas Mascotas
- Roedores (hámsters, conejos, cobayos)
- Aves
- Reptiles
- Peces y acuarios
- Hábitats y jaulas
- Alimentos especializados
- Accesorios

### Ofertas
- Productos con descuento activo
- Banners de promociones destacadas
- Filtro por categoría dentro de ofertas

### Marcas
- Grilla visual con logo de cada marca
- Al hacer clic filtra productos por marca
- Marcas ejemplo: Royal Canin, Hills, Purina, Advance, Eukanuba, ProPlan

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
  logoUrl  String?
  products Product[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  slug        String      @unique
  description String?
  price       Float
  salePrice   Float?      // precio con descuento (null = sin oferta)
  stock       Int         @default(0)
  imageUrl    String?
  images      String[]    // imágenes adicionales
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
  orderNumber     String      @unique  // ej: "ORD-20240115-001"
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
  tbkToken        String?       // token de Transbank
  tbkBuyOrder     String?       // buy order enviada a Transbank
  tbkSessionId    String?
  tbkAmount       Float?
  tbkAuthCode     String?       // código de autorización
  tbkResponseCode Int?          // 0 = aprobado
  tbkCardNumber   String?       // últimos 4 dígitos
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
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

---

## 6. Contrato de API (Endpoints)

### Productos
```
GET    /api/products                    → Lista productos (con filtros: ?category=, ?brand=, ?sale=true, ?search=)
GET    /api/products/:slug              → Detalle de producto
GET    /api/categories                  → Árbol de categorías
GET    /api/brands                      → Lista de marcas
```

### Órdenes
```
POST   /api/orders                      → Crear orden previa al pago
                                          Body: { customerName, customerEmail, customerPhone, items: [{productId, quantity}] }
                                          Response: { orderId, orderNumber, total }

GET    /api/orders/:orderNumber         → Consultar estado de una orden
```

### Pago — Transbank Webpay Plus
```
POST   /api/payment/create              → Iniciar transacción con Transbank
                                          Body: { orderId }
                                          Response: { token, url }  ← frontend hace form POST a url con token

GET    /api/payment/return              → Callback de Transbank después del pago
                                          Query: ?token_ws=...
                                          Lógica: llama Transaction.commit(), actualiza orden y payment en BD
                                          Redirige a: /pago/exito o /pago/fallido

GET    /api/payment/status/:orderNumber → Consultar resultado del pago (para mostrar en pantalla de éxito/fallo)
```

### Admin (requieren JWT en header Authorization: Bearer <token>)
```
POST   /api/admin/login                 → Login admin
                                          Body: { email, password }
                                          Response: { token }

GET    /api/admin/products              → Lista todos los productos (incluye inactivos)
POST   /api/admin/products              → Crear producto
PUT    /api/admin/products/:id          → Editar producto
DELETE /api/admin/products/:id          → Desactivar producto (soft delete)

GET    /api/admin/orders                → Lista todas las órdenes
PUT    /api/admin/orders/:id/status     → Actualizar estado de orden
```

---

## 7. Flujo Completo de Pago — Transbank Webpay Plus

```
PASO 1 — Frontend: Usuario confirma carrito
  → Muestra resumen del carrito
  → Usuario ingresa nombre, email, teléfono
  → Hace clic en "Pagar con Webpay"

PASO 2 — Frontend llama: POST /api/payment/create { orderId }
  → Backend crea orden en BD con status PENDING
  → Backend llama: WebpayPlus.Transaction.create(buyOrder, sessionId, amount, returnUrl)
  → Transbank devuelve: { token, url }
  → Backend guarda token en tabla Payment
  → Backend responde al frontend con: { token, url }

PASO 3 — Frontend hace form POST hacia la URL de Transbank
  ⚠️ NO es un redirect normal. Debe ser un formulario HTML con method POST:
  <form action={url} method="POST">
    <input type="hidden" name="token_ws" value={token} />
  </form>
  → Se ejecuta automáticamente con JS al recibir la respuesta

PASO 4 — Usuario paga en formulario de Transbank
  → Ingresa número de tarjeta, RUT, clave dinámica
  → Tu app no interviene en este paso

PASO 5 — Transbank redirige a return_url con ?token_ws=...
  → Backend en GET /api/payment/return recibe el token
  → Llama: WebpayPlus.Transaction.commit(token)
  → Transbank responde con el resultado del pago

PASO 6 — Backend procesa resultado
  SI responseCode === 0 (APROBADO):
    → Actualiza Payment.status = APPROVED
    → Actualiza Order.status = PAID
    → Guarda authCode, cardNumber en Payment
    → Redirige a: {FRONTEND_URL}/pago/exito?order={orderNumber}

  SI responseCode !== 0 (RECHAZADO/CANCELADO):
    → Actualiza Payment.status = REJECTED o CANCELLED
    → Mantiene Order.status = PENDING (puede reintentar)
    → Redirige a: {FRONTEND_URL}/pago/fallido?order={orderNumber}

PASO 7 — Frontend muestra resultado
  → Llama GET /api/payment/status/:orderNumber
  → Muestra pantalla de éxito o fallo según el resultado
```

---

## 8. Configuración Transbank

```typescript
// backend/src/services/transbankService.ts

import { WebpayPlus, Options, IntegrationApiKeys, Environment } from 'transbank-sdk';

const isProduction = process.env.NODE_ENV === 'production';

// Sandbox (desarrollo y pruebas)
// Credenciales públicas de prueba — NO son secretas
const SANDBOX_COMMERCE_CODE = '597055555532';
const SANDBOX_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

// Producción (requiere contrato con Transbank)
const PROD_COMMERCE_CODE = process.env.TBK_COMMERCE_CODE!;
const PROD_API_KEY = process.env.TBK_API_KEY!;

export const transbankOptions = isProduction
  ? new Options(PROD_COMMERCE_CODE, PROD_API_KEY, Environment.Production)
  : new Options(SANDBOX_COMMERCE_CODE, SANDBOX_API_KEY, Environment.Integration);

// Tarjetas de prueba para sandbox:
// VISA aprobada:    4051 8856 0044 6623  CVV: 123  Fecha: cualquier futura
// VISA rechazada:   5186 0595 5959 0568  CVV: 123
// RUT de prueba:    11.111.111-1  Clave: 123
```

---

## 9. Variables de Entorno

### backend/.env.example
```env
# Server
NODE_ENV=development
PORT=3001

# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_seguro_de_al_menos_32_chars
JWT_EXPIRES_IN=7d

# Transbank (solo en producción — en sandbox se usan credenciales públicas)
TBK_COMMERCE_CODE=
TBK_API_KEY=

# URLs
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
```

### frontend/.env.example
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 10. Guía de Estilos

### Paleta de colores (Tailwind)
```
Primary:     Naranja cálido   → orange-500 / #f97316
Secondary:   Verde natural    → emerald-600 / #059669
Accent:      Amarillo suave   → amber-400 / #fbbf24
Background:  Blanco / gris    → white / gray-50
Text:        Gris oscuro      → gray-900 / gray-700
```

### Tipografía
- Títulos: `font-bold` con `tracking-tight`
- Cuerpo: `font-normal` con `leading-relaxed`
- Precio: `font-semibold text-orange-500`
- Precio con descuento: precio original con `line-through text-gray-400`

### Componentes clave (Shadcn/ui)
- `Button` — CTA principal y secundario
- `Card` — tarjeta de producto
- `Sheet` — carrito lateral (drawer)
- `Badge` — etiqueta de descuento / "Nuevo"
- `NavigationMenu` — megamenú de categorías
- `Dialog` — modales de confirmación
- `Input`, `Label` — formularios de checkout

### Convenciones de código
- Componentes en PascalCase: `ProductCard.tsx`
- Hooks en camelCase con prefijo use: `useCart.ts`
- Servicios en camelCase: `productService.ts`
- Tipos en PascalCase con sufijo Type o Interface: `ProductType`
- Constantes en SCREAMING_SNAKE_CASE

---

## 11. Footer

El footer debe incluir:
- **Ubicación:** dirección de la tienda física con enlace a Google Maps
- **Contacto:** teléfono, WhatsApp, email
- **Redes sociales:** Instagram, Facebook, TikTok (íconos con enlaces)
- **Links legales:** Política de privacidad, Términos y condiciones, Cambios y devoluciones
- **Logo** y copyright

---

## 12. Decisiones Técnicas Importantes

| Decisión | Elección | Razón |
|---|---|---|
| Estado del carrito | Zustand | Simple, sin boilerplate, persiste en localStorage |
| Fetching de datos | React Query | Caché automático, loading/error states, refetch |
| Routing | React Router v6 | Estándar para SPA, soporte para layouts anidados |
| Validación forms | React Hook Form + Zod | Tipado fuerte con TypeScript |
| Imágenes de productos | URLs externas o Cloudinary | No almacenar binarios en PostgreSQL |
| Paginación productos | Cursor-based | Más eficiente que offset para catálogos grandes |
| Soft delete productos | `isActive: false` | No perder historial en órdenes existentes |

---

## 13. Comandos de Desarrollo

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # datos de prueba
npm run dev          # http://localhost:3001

# Base de datos local con Docker
docker run --name petshop-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=petshop_db -p 5432:5432 -d postgres:15
```

---

*Última actualización: inicio del proyecto*
*Mantener este archivo actualizado con cada decisión arquitectural importante.*