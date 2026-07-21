# 🐾 Petshop — E-commerce de Mascotas

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Backend-0B0D0E?logo=railway&logoColor=white)

E-commerce tipo SPA con catálogo de productos, carrito de compras, cupones de descuento, pago integrado con **Transbank Webpay Plus** y un módulo completo de **reserva de citas veterinarias** con su propio flujo de pago. Incluye panel de administración con CRUD completo, analytics y exportación de datos.

**🔗 Demo en vivo:** [petshop-e-commerce.vercel.app](https://petshop-e-commerce.vercel.app)

![Hero](./screenshots/hero.png)

---

## 📑 Tabla de contenidos

- [📸 Capturas de pantalla](#-capturas-de-pantalla)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠 Stack tecnológico](#-stack-tecnológico)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [🚀 Instalación](#-instalación)
- [🔐 Variables de entorno](#-variables-de-entorno)
- [📡 API — Endpoints principales](#-api--endpoints-principales)
- [💳 Flujo de pago — Transbank Webpay Plus](#-flujo-de-pago--transbank-webpay-plus)
- [🔑 Credenciales de prueba](#-credenciales-de-prueba)
- [⚙️ Comandos útiles](#️-comandos-útiles)
- [📄 Licencia](#-licencia)

---

## 📸 Capturas de pantalla

| Home | Detalle de producto |
|---|---|
| ![Home](./screenshots/home.png) <!-- TODO: reemplazar --> | ![Detalle de producto](./screenshots/product.png) <!-- TODO: reemplazar --> |

| Carrito | Checkout |
|---|---|
| ![Carrito](./screenshots/cart.png) <!-- TODO: reemplazar --> | ![Checkout](./screenshots/checkout.png) <!-- TODO: reemplazar --> |

| Pago exitoso | Login admin |
|---|---|
| ![Pago exitoso](./screenshots/payment-success.png) <!-- TODO: reemplazar --> | ![Login admin](./screenshots/admin-login.png) <!-- TODO: reemplazar --> |

| Dashboard admin | Dark mode |
|---|---|
| ![Dashboard admin](./screenshots/admin-dashboard.png) <!-- TODO: reemplazar --> | ![Dark mode](./screenshots/dark-mode.png) <!-- TODO: reemplazar --> |

---

## ✨ Funcionalidades

- Catálogo organizado en 6 secciones principales (Perro, Gato, Farmacia, Pequeñas Mascotas, Ofertas, Marcas) + Peluquería
- Carrito de compras persistente (drawer lateral con focus trap)
- Cupones de descuento aplicados server-side
- Checkout con validación (React Hook Form + Zod) y pago vía **Transbank Webpay Plus**
- **Reserva de citas veterinarias** (`/veterinaria`): elegir servicio, ver disponibilidad, agendar y pagar
- Panel de administración (JWT): CRUD de productos, marcas, clientes, cupones, órdenes, analytics y gestión completa de veterinaria (servicios, disponibilidad, excepciones, citas — cancelar/reagendar con email)
- Exportación de datos a CSV/XLSX desde el admin
- Dark mode completo con paleta propia
- Diseño responsive (mobile-first)

---

## 🛠 Stack tecnológico

### Frontend

| Tecnología | Rol |
|---|---|
| React 18 + TypeScript 5 | Framework UI, tipado estático |
| Vite 5 | Bundler y dev server |
| Tailwind CSS 3 | Único sistema de UI (sin Shadcn/ui) |
| React Router 6 | Routing SPA |
| Zustand | Estado global: carrito, tema, UI |
| React Query | Fetching y caché de datos |
| React Hook Form + Zod | Validación de formularios |
| Axios | Cliente HTTP |
| lucide-react | Iconografía |
| Recharts | Gráficos en el dashboard admin |
| Framer Motion | Transiciones y animaciones |
| sonner | Toasts |

### Backend

| Tecnología | Rol |
|---|---|
| Node.js 20+ / Express 4 / TypeScript 5 | Runtime y framework HTTP |
| Prisma ORM 5 / PostgreSQL 15+ | Acceso a base de datos |
| JWT + bcrypt | Autenticación admin |
| Zod | Validación de entrada |
| express-rate-limit | Rate limiting |
| helmet, cors, dotenv | Middleware / configuración |
| transbank-sdk | Pasarela de pago |
| ExcelJS | Exportación CSV/XLSX |
| Resend | Emails transaccionales (veterinaria) |

### Deploy

| Servicio | Qué aloja |
|---|---|
| Vercel | Frontend React |
| Railway | Backend Express + PostgreSQL |

---

## 📁 Estructura del proyecto

```
petshop/
├── frontend/
│   └── src/
│       ├── components/       # layout, product, cart, checkout, payment, vet, admin
│       ├── pages/             # Home, CategoryPage, ProductPage, Checkout, Vet*, admin/*
│       ├── store/              # cartStore, themeStore, uiStore (Zustand)
│       ├── hooks/               # useProducts, usePayment, useVet, useAdminVet
│       ├── services/            # api.ts + servicios por dominio
│       ├── types/index.ts       # Tipos TS compartidos
│       └── utils/                # formatters, orderStatus, appointmentStatus, transbank
│
├── backend/
│   ├── prisma/                   # schema.prisma + seeds encadenados
│   └── src/
│       ├── controllers/           # product, order, payment, coupon, vet, vetPayment, admin/*
│       ├── routes/
│       ├── schemas/                # Schemas Zod compartidos
│       ├── middleware/             # auth, errorHandler, validateRequest, rateLimiter
│       ├── services/                # transbankService, vetAvailabilityService, emailService
│       └── lib/prisma.ts            # Singleton PrismaClient
│
├── screenshots/                     # Capturas usadas en este README
├── CLAUDE.md                          # Contexto técnico detallado para agentes de código
└── PLAN.md                            # Bitácora histórica de fases
```

---

## 🚀 Instalación

### Requisitos previos

- Node.js 20+
- Docker (para base de datos local) o PostgreSQL 15 instalado
- npm 9+

### 1. Base de datos local

```bash
docker run --name petshop-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=petshop_db \
  -p 5432:5432 -d postgres:15
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed        # encadena seed-scraper.js → seed-orders.js → seed-vet.js
npm run dev                # → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # → http://localhost:5173
```

---

## 🔐 Variables de entorno

### `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/petshop_db"
JWT_SECRET=<al_menos_32_chars_random>
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
RETURN_URL=http://localhost:3001/api/payment/return
VET_RETURN_URL=http://localhost:3001/api/vet/payment/return
RESEND_API_KEY=
EMAIL_FROM="Petshop <reservas@petshop.cl>"
# TBK_COMMERCE_CODE y TBK_API_KEY — solo producción
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📡 API — Endpoints principales

```
# Productos / Categorías / Marcas
GET    /api/products                    Lista (filtros: category, brand, sale, search, featured, sort, cursor, limit)
GET    /api/products/:slug              Detalle de producto
GET    /api/categories                  Árbol de categorías
GET    /api/brands                      Lista de marcas

# Órdenes / Pago / Cupones
POST   /api/orders                      Crear orden
GET    /api/orders/:orderNumber         Estado de una orden
POST   /api/payment/create              Iniciar transacción Transbank → { token, url }
GET    /api/payment/return              Callback Transbank (commit + redirect)
GET    /api/payment/status/:orderNumber Resultado del pago
POST   /api/coupons/validate            Preview de descuento de un cupón

# Veterinaria
GET    /api/vet/services                Servicios activos
GET    /api/vet/availability            Slots disponibles (?date&serviceId)
POST   /api/vet/appointments            Crear cita
POST   /api/vet/payment/create          Iniciar pago de cita
GET    /api/vet/payment/return          Callback Transbank (commit + email + redirect)

# Admin (Authorization: Bearer <jwt>, excepto login)
POST   /api/admin/login                 Login admin (rate limit: 5/15min)
GET    /api/admin/products              CRUD completo + export CSV/XLSX
GET    /api/admin/orders                Listado + cambio de estado + export
GET    /api/admin/brands                CRUD + auto-assign por keyword
GET    /api/admin/customers             Listado + export
GET    /api/admin/coupons               CRUD
GET    /api/admin/analytics/*           Ventas por categoría, comparación mensual
GET    /api/admin/vet/*                 Servicios, disponibilidad, excepciones, citas (cancelar/reagendar)
```

---

## 💳 Flujo de pago — Transbank Webpay Plus

1. Usuario confirma el carrito, ingresa datos y aplica cupón (opcional).
2. `POST /api/payment/create` → backend crea la transacción en Transbank y devuelve `{ token, url }`.
3. Frontend envía un `<form method="POST">` nativo a la URL de Transbank (no `fetch`/`axios`).
4. Usuario paga en el formulario de Transbank.
5. Transbank redirige a `GET /api/payment/return?token_ws=...`.
6. Backend llama `Transaction.commit()` y actualiza `Payment` + `Order` en un único `prisma.$transaction`.
7. Redirect server-side a `/pago/exito` o `/pago/fallido`.

El flujo de **veterinaria** es análogo (`/api/vet/payment/*`), con envío de email de confirmación vía Resend al aprobarse el pago.

---

## 🔑 Credenciales de prueba

### Panel de administración

| Campo | Valor |
|---|---|
| URL | `http://localhost:5173/admin` |
| Email | `admin@petshop.cl` |
| Contraseña | `admin123` |

### Tarjetas sandbox Transbank

| Tipo | Número | CVV |
|---|---|---|
| VISA aprobada | `4051 8856 0044 6623` | `123` |
| VISA rechazada | `5186 0595 5959 0568` | `123` |

RUT: `11.111.111-1` · Clave: `123` · Fecha de vencimiento: cualquier fecha futura (ej. `12/26`)

> Aplica solo fuera de `NODE_ENV=production`. El backend usa credenciales sandbox públicas automáticamente.

---

## ⚙️ Comandos útiles

```bash
# Frontend
cd frontend
npm run dev            # http://localhost:5173
npm run build
npm run lint            # eslint --max-warnings 0
npm run type-check      # tsc --noEmit
npm run test            # vitest run

# Backend
cd backend
npm run dev             # ts-node-dev → http://localhost:3001
npm run build
npm run type-check
npm run test            # jest

# Prisma
npx prisma studio        # GUI en http://localhost:5555
npx prisma migrate dev --name <nombre_descriptivo>
npx prisma db seed
```

---

## 📄 Licencia

Este proyecto no incluye actualmente un archivo `LICENSE`. Se sugiere licenciarlo bajo **MIT** si se planea distribuir o abrir el código:

```
MIT License

Copyright (c) 2026 Nicolas Sarmiento

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

Para aplicarla, crea un archivo `LICENSE` en la raíz con el texto completo de la [licencia MIT](https://opensource.org/license/mit/).
