# Petshop

E-commerce de mascotas tipo SPA con catálogo de productos, carrito de compras y pago integrado con **Transbank Webpay Plus**. Panel de administración incluido.

---

## Stack

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18 | Framework UI |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Bundler y dev server |
| Tailwind CSS | 3 | Estilos utilitarios |
| Shadcn/ui | latest | Componentes accesibles |
| React Router | 6 | Routing SPA |
| Zustand | latest | Estado global (carrito, tema, UI) |
| React Query | 5 | Fetching y caché de datos |
| Axios | latest | Cliente HTTP |
| Sonner | latest | Notificaciones toast |

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 4 | Framework HTTP |
| TypeScript | 5 | Tipado estático |
| Prisma ORM | 5 | Acceso a base de datos |
| PostgreSQL | 15 | Base de datos relacional |
| JWT | latest | Autenticación admin |
| bcrypt | latest | Hash de contraseñas |
| transbank-sdk | latest | Pasarela de pago |

### Deploy
| Servicio | Qué aloja |
|---|---|
| Vercel | Frontend React |
| Railway | Backend Express + PostgreSQL |

---

## Estructura del proyecto

```
petshop/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/           # Componentes Shadcn/ui
│       │   ├── layout/       # Navbar, Footer, Layout
│       │   ├── product/      # ProductCard, ProductGrid, BrandsCarousel
│       │   ├── cart/         # CartDrawer, CartItem, CartSummary
│       │   └── checkout/     # CheckoutForm
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── CategoryPage.tsx
│       │   ├── ProductPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── PaymentReturn.tsx
│       │   ├── PaymentSuccess.tsx
│       │   ├── PaymentFailed.tsx
│       │   └── admin/
│       ├── store/
│       │   ├── cartStore.ts    # Zustand — carrito (persiste en localStorage)
│       │   ├── themeStore.ts   # Zustand — dark/light mode
│       │   └── uiStore.ts      # Zustand — estado del drawer del carrito
│       ├── hooks/              # useProducts, useCart, usePayment
│       ├── services/           # api.ts + servicios por dominio
│       ├── types/              # index.ts — tipos compartidos
│       └── utils/              # formatters.ts (formatCLP)
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/         # authMiddleware, errorHandler
│       ├── services/           # transbankService, orderService
│       └── lib/                # prisma singleton
│
├── CONTEXT.md                  # Arquitectura detallada
└── AGENTS.md                   # Guía para agentes de código
```

---

## Requisitos previos

- Node.js 20+
- Docker (para base de datos local) o PostgreSQL 15 instalado
- npm 9+

---

## Instalación

### 1. Base de datos local

```bash
docker run --name petshop-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=petshop_db \
  -p 5432:5432 -d postgres:15
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # editar con tus valores
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev            # → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # editar con tus valores
npm install
npm run dev            # → http://localhost:5173
```

---

## Variables de entorno

### `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"
JWT_SECRET=<mínimo_32_caracteres>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
# TBK_COMMERCE_CODE y TBK_API_KEY — solo en producción
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
```

---

## API — Endpoints principales

```
GET    /api/products                  Lista productos (?category=, ?brand=, ?sale=true, ?search=)
GET    /api/products/:slug            Detalle de producto
GET    /api/categories                Árbol de categorías
GET    /api/brands                    Lista de marcas

POST   /api/orders                    Crear orden
GET    /api/orders/:orderNumber       Estado de una orden

POST   /api/payment/create            Iniciar transacción Transbank → { token, url }
GET    /api/payment/return            Callback Transbank (commit + redirect)
GET    /api/payment/status/:order     Resultado del pago

POST   /api/admin/login               Login admin → { token }
GET    /api/admin/products            Listar productos (incluye inactivos)  [JWT]
POST   /api/admin/products            Crear producto  [JWT]
PUT    /api/admin/products/:id        Editar producto  [JWT]
DELETE /api/admin/products/:id        Desactivar producto (soft delete)  [JWT]
GET    /api/admin/orders              Listar órdenes  [JWT]
PUT    /api/admin/orders/:id/status   Actualizar estado  [JWT]
```

---

## Flujo de pago — Transbank Webpay Plus

1. Usuario completa el checkout e ingresa sus datos.
2. Frontend llama `POST /api/payment/create` → backend crea la transacción en Transbank y devuelve `{ token, url }`.
3. Frontend envía un `<form method="POST">` nativo a la URL de Transbank con el token (no usar `fetch` ni `axios`).
4. Usuario paga en el formulario de Transbank.
5. Transbank redirige a `GET /api/payment/return?token_ws=...`.
6. Backend llama `Transaction.commit()`, actualiza `Payment` y `Order` en una `prisma.$transaction`.
7. Backend redirige al frontend: `/pago/exito` o `/pago/fallido`.

---

## Credenciales de prueba

### Panel de administración

| Campo | Valor |
|---|---|
| URL | `http://localhost:5173/admin` |
| Email | `admin@petshop.cl` |
| Contraseña | `admin123` |

> Creadas al correr `npx prisma db seed`. Para cambiarlas, edita `backend/prisma/seed.ts:629`.

### Tarjeta sandbox Transbank (solo pruebas)

| Campo | Valor |
|---|---|
| Número | `4051 8856 0044 6623` |
| Fecha vencimiento | `12/26` |
| CVV | `123` |
| RUT | `11.111.111-1` |
| Clave | `123` |

> Aplica solo con `NODE_ENV=development`. El backend usa credenciales sandbox públicas automáticamente; no se requiere configuración adicional.

---

## Comandos útiles

```bash
# Verificar tipos (debe pasar sin errores antes de commit)
cd frontend && npm run type-check
cd backend  && npm run type-check

# Lint
cd frontend && npm run lint
cd backend  && npm run lint

# Prisma
npx prisma studio          # GUI en http://localhost:5555
npx prisma migrate dev --name <nombre_descriptivo>
npx prisma db seed
```

---

## Funcionalidades

- Catálogo de productos con filtros por categoría, marca y ofertas
- Megamenú de navegación con 6 secciones (Perro, Gato, Farmacia, Pequeñas Mascotas, Ofertas, Marcas)
- Carrito de compras persistente (localStorage) con drawer lateral
- Toast de confirmación al agregar productos al carrito
- Checkout con validación de formulario (React Hook Form + Zod)
- Pago integrado con Transbank Webpay Plus
- Pantallas de resultado de pago (éxito / fallo)
- Panel de administración protegido por JWT (gestión de productos y órdenes)
- Dark mode completo con toggle persistido
- Diseño responsive (mobile-first)
