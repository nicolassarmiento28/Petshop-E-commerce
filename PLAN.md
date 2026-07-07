# PLAN.md — Tienda de Mascotas (Pet Shop)
Plan de implementación completo por fases. Leer CLAUDE.md antes de ejecutar.
Última actualización: 2026-07-07 — Módulo de veterinaria completo, auditoría y hardening de seguridad, verificación end-to-end con Playwright.
---
## FASE 1 — Base del proyecto
**Goal:** Scaffold completo del monorepo con toda la configuración base lista.
**Resultado esperado:** `npm run dev` en ambos proyectos sin errores. `/api/health` responde `{ status: "ok" }`.
### Frontend
- [x] Crear estructura de carpetas completa (`src/components/ui|layout|product|cart|checkout`, `pages`, `store`, `hooks`, `services`, `types`, `utils`)
- [x] `frontend/package.json` — dependencias: react, react-dom, react-router-dom, @tanstack/react-query, axios, zustand, react-hook-form, @hookform/resolvers, zod, clsx, tailwind-merge, class-variance-authority, lucide-react
- [x] `frontend/vite.config.ts` — alias `@/` → `src/`
- [x] `frontend/tsconfig.json` + `tsconfig.node.json` — strict mode, paths `@/*`
- [x] `frontend/tailwind.config.ts` — colores: orange-500 (primary), emerald-600 (secondary), amber-400 (accent)
- [x] `frontend/postcss.config.js`
- [x] `frontend/index.html`
- [x] `frontend/.env` + `.env.example` — `VITE_API_URL=http://localhost:3001/api`
- [x] `frontend/src/index.css` — Tailwind directives + CSS variables
- [x] `frontend/src/main.tsx` — ReactDOM + QueryClientProvider + HelmetProvider
- [x] `frontend/src/App.tsx` — React Router con todas las rutas públicas, admin y legales
- [x] `frontend/src/types/index.ts` — tipos completos: ProductType, CategoryType, BrandType, OrderType, OrderItemType, CartItemType, PaymentType, OrderStatus, PaymentStatus
- [x] `frontend/src/services/api.ts` — instancia Axios con baseURL desde VITE_API_URL + interceptor JWT
- [x] `frontend/src/utils/formatters.ts` — formatCLP(price: number): string, formatDate(date: string): string
- [x] `frontend/components.json` — config Shadcn/ui
- [ ] ~~Instalar componentes Shadcn~~ — No usado. Todo el UI es Tailwind puro con elementos HTML nativos. (Las libs `@radix-ui/*` y `class-variance-authority` quedaron instaladas sin uso — ver Fase 11)
### Backend
- [x] Crear estructura de carpetas completa (`prisma`, `src/controllers|routes|middleware|services|utils|lib`)
- [x] `backend/package.json` — deps: express, cors, helmet, dotenv, jsonwebtoken, bcrypt, @prisma/client, transbank-sdk | dev: typescript, ts-node-dev, @types/*, prisma, zod, jest
- [x] `backend/tsconfig.json` — strict, outDir `dist/`, rootDir `src/`, paths `@/*`
- [x] `backend/.env` + `.env.example` — NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, RETURN_URL
- [x] `backend/prisma/schema.prisma` — Category, Brand, Product, Order, OrderItem, Payment, Admin + enums OrderStatus, PaymentStatus + Coupon
- [x] `backend/prisma/seed.ts` — 15 marcas, 7 categorías + subcategorías, 50+ productos, admin user
- [x] `backend/src/lib/prisma.ts` — singleton PrismaClient
- [x] `backend/src/utils/logger.ts` — logger.info/warn/error wrapper
- [x] `backend/src/middleware/errorHandler.ts` — middleware global, `{ error: message }`, nunca expone stack
- [x] `backend/src/middleware/authMiddleware.ts` — verifica JWT Bearer, rechaza con 401
- [x] `backend/src/middleware/validateRequest.ts` — valida body con Zod schema
- [x] Controllers: productController, categoryController, orderController, paymentController, adminController, adminProductController, adminOrderController, adminBrandController, adminCustomerController, adminCouponController
- [x] Routes: productRoutes, categoryRoutes, orderRoutes, paymentRoutes, adminRoutes, brandsRoutes
- [x] `backend/src/app.ts` — Express config: helmet, cors, json, rate-limit, /api/health, rutas montadas, errorHandler
- [x] `backend/src/server.ts` — app.listen(PORT)
- [x] Verificación: `npm run type-check` en ambos → 0 errores
---
## FASE 2 — Frontend base
**Goal:** Layout visual completo con navegación funcional y páginas base con datos reales.
**Resultado esperado:** App navegable con Navbar, Footer, Home con Hero, CategoryPage y ProductCard visibles.
- [x] `src/components/layout/Navbar.tsx` — logo, megamenú (6 secciones: Perro, Gato, Farmacia, Pequeñas Mascotas, Ofertas, Marcas), ícono carrito con badge, responsive mobile, dark mode toggle
- [x] `src/components/layout/Footer.tsx` — ubicación + Google Maps, teléfono/WhatsApp/email, redes (Instagram, Facebook, TikTok), links legales, logo, copyright
- [x] `src/components/layout/Layout.tsx` — wrapper con Navbar + children + Footer
- [x] `src/pages/Home.tsx` — Hero con CTA, categorías, productos destacados, ofertas, carrusel de marcas
- [x] `src/components/product/ProductCard.tsx` — imagen, nombre, marca, precio (con/sin descuento), badge "Oferta"/"Agotado", botón "Agregar al carrito"
- [x] `src/components/product/ProductGrid.tsx` — grid responsive con loading skeleton y empty state
- [x] `src/pages/CategoryPage.tsx` — reutilizable por slug, filtros (subcategoría, marca, precio), búsqueda, infinite scroll, total productos
- [x] `src/pages/ProductPage.tsx` — detalle: imagen, galería, descripción, precio, stock, selector cantidad, relacionados
- [x] Layout conectado en App.tsx para todas las rutas públicas
- [x] Páginas legales: /privacidad, /terminos, /devoluciones, /nosotros
---
## FASE 3 — Backend base
**Goal:** API REST completa con datos reales desde PostgreSQL.
**Resultado esperado:** Frontend consume datos reales. Seed con categorías, marcas y productos de prueba.
- [x] `backend/src/controllers/productController.ts` — getProducts (filtros: category, brand, sale, search, featured, sort, cursor pagination), getProductBySlug, getRelatedProducts
- [x] `backend/src/controllers/categoryController.ts` — getCategories (árbol con children), getCategoryBySlug, getPublicBrands
- [x] `backend/src/routes/productRoutes.ts` — GET /api/products, GET /api/products/:slug, GET /api/products/:slug/related
- [x] `backend/src/routes/categoryRoutes.ts` — GET /api/categories, GET /api/categories/:slug, GET /api/brands
- [x] `backend/prisma/seed.ts` — 15 marcas, 7 categorías + subcategorías, 50+ productos con imágenes reales, admin user
- [x] `npx prisma migrate dev --name init` + `npx prisma db seed` ejecutado
- [x] `frontend/src/hooks/useProducts.ts` — useProducts, useProductsInfinite, useProduct, useCategories, useBrands, useRelatedProducts
- [x] `frontend/src/services/productService.ts` — fetchProducts, fetchProductBySlug, fetchCategories, fetchBrands, fetchRelatedProducts
- [x] Home.tsx y CategoryPage.tsx conectados a API real
- [x] Verificación: `curl http://localhost:3001/api/products` retorna productos del seed
---
## FASE 4 — Carrito y checkout
**Goal:** Carrito funcional con persistencia y formulario de checkout validado.
**Resultado esperado:** Usuario puede agregar productos, ver el drawer del carrito, y completar el formulario de checkout.
- [x] `frontend/src/store/cartStore.ts` — Zustand con persist localStorage: items, addItem, removeItem, updateQuantity, clearCart, computed totalItems/totalPrice
- [x] ~~`frontend/src/hooks/useCart.ts`~~ — Eliminado por ser wrapper trivial sin valor (se usa useCartStore directo)
- [x] `frontend/src/components/cart/CartItem.tsx` — imagen, nombre, precio unitario, selector cantidad (+/-), botón eliminar
- [x] `frontend/src/components/cart/CartSummary.tsx` — subtotal, total CLP, botón "Ir al checkout"
- [x] `frontend/src/components/cart/CartDrawer.tsx` — Drawer custom (overlay + panel + focus trap + Escape key), lista CartItem, CartSummary, estado vacío
- [x] CartDrawer conectado al ícono del Navbar con badge de cantidad
- [x] `frontend/src/pages/CartPage.tsx` — versión página completa del carrito
- [x] `frontend/src/components/checkout/CheckoutForm.tsx` — React Hook Form + Zod: customerName, customerEmail, customerPhone, shippingAddress
- [x] `frontend/src/pages/CheckoutPage.tsx` — resumen del pedido + CheckoutForm + cupón descuento + botón "Confirmar pedido"
- [x] `backend/src/controllers/orderController.ts` — createOrder (valida stock, calcula total, transacción Prisma), getOrderByNumber
- [x] `backend/src/routes/orderRoutes.ts` — POST /api/orders, GET /api/orders/:orderNumber
- [x] `frontend/src/services/orderService.ts` — createOrder(data), getOrder(orderNumber)
- [x] Verificación: flujo completo agregar → carrito → checkout → orden creada en BD
---
## FASE 5 — Pasarela de pago Transbank
**Goal:** Flujo completo de pago en sandbox funcional de extremo a extremo.
**Resultado esperado:** Usuario paga con tarjeta de prueba y ve pantalla de éxito/fallo con datos reales.
- [x] `backend/src/services/transbankService.ts` — transbankOptions (sandbox/prod), createTransaction, commitTransaction
- [x] `backend/src/controllers/paymentController.ts` — createPayment (crea Payment PENDING, llama Transbank, retorna token+url), paymentReturn (commit, actualiza Payment+Order en $transaction, redirige), getPaymentStatus
- [x] `backend/src/routes/paymentRoutes.ts` — POST /api/payment/create, GET /api/payment/return, GET /api/payment/status/:orderNumber
- [x] `frontend/src/services/paymentService.ts` — createPayment(orderId), getPaymentStatus(orderNumber)
- [x] `frontend/src/hooks/usePayment.ts` — useMutation para createPayment, auto-submit form POST a Transbank
- [x] CheckoutPage.tsx — flujo: createOrder → createPayment → form POST a Transbank
- [x] ~~`frontend/src/pages/PaymentReturn.tsx`~~ — Eliminado (backend hace server-side redirect directo a éxito/fallo, la ruta /pago/retorno era muerta)
- [x] `frontend/src/pages/PaymentSuccess.tsx` — muestra orden, monto, últimos 4 dígitos, código autorización, llama cartStore.clearCart()
- [x] `frontend/src/pages/PaymentFailed.tsx` — muestra motivo, botones "Reintentar" y "Volver al inicio"
- [x] Verificación sandbox: tarjeta `4051 8856 0044 6623`, CVV `123`, RUT `11.111.111-1`, clave `123` → pantalla de éxito
---
## FASE 6 — Panel de administración
**Goal:** Panel admin protegido con JWT para gestionar productos, órdenes, marcas, clientes y cupones.
**Resultado esperado:** Admin puede hacer login, CRUD productos, cambiar estado de órdenes, ver analytics.
- [x] `backend/src/controllers/adminController.ts` — login (email+bcrypt, retorna JWT)
- [x] `backend/src/routes/adminRoutes.ts` — POST /api/admin/login + rutas protegidas con authMiddleware
- [x] Admin seed: usuario admin creado en seed.ts con bcrypt hash
- [x] CRUD productos: GET/POST /api/admin/products, PUT/DELETE /api/admin/products/:id (soft delete)
- [x] CRUD marcas, clientes, cupones: endpoints completos con controladores separados
- [x] Órdenes: GET /api/admin/orders, PUT /api/admin/orders/:id/status
- [x] Analytics: GET /api/admin/analytics (órdenes por estado), GET /api/admin/revenue (ingresos por período)
- [x] `frontend/src/pages/admin/AdminLogin.tsx` — formulario email+password, guarda JWT en localStorage
- [x] PrivateRoute en App.tsx — verifica JWT, protege todas las rutas admin
- [x] `frontend/src/pages/admin/AdminDashboard.tsx` — Recharts: total órdenes, ingresos, productos activos, gráficos de área y barras
- [x] `frontend/src/pages/admin/AdminProducts.tsx` — tabla paginada, crear/editar modal (React Hook Form + Zod), desactivar
- [x] `frontend/src/pages/admin/AdminOrders.tsx` — tabla con filtro por estado, selector de cambio de estado, detalle expandible
- [x] `frontend/src/pages/admin/AdminBrands.tsx` — CRUD marcas
- [x] `frontend/src/pages/admin/AdminCustomers.tsx` — lista clientes con total gastado
- [x] `frontend/src/pages/admin/AdminCoupons.tsx` — CRUD cupones descuento
- [x] Verificación: login admin → CRUD producto → cambio estado orden → CRUD marca/cupón → logout
---
## FASE 7 — Limpieza y mantenimiento (2026-06-06)
**Goal:** Eliminar código muerto, completar endpoints faltantes, mantener hygiene del proyecto.
**Resultado esperado:** Código más limpio, sin archivos huérfanos, sin rutas muertas.
- [x] Eliminar `frontend/src/hooks/useCart.ts` — wrapper trivial de 3 líneas, no importado por ningún archivo
- [x] Eliminar `frontend/src/pages/PaymentReturn.tsx` + ruta `/pago/retorno` en App.tsx — backend hace redirect server-side directo a éxito/fallo
- [x] Agregar `getCategoryBySlug` a `backend/src/controllers/categoryController.ts` y `GET /:slug` a `backend/src/routes/categoryRoutes.ts`
- [x] Verificar que no haya más archivos huérfanos en frontend/src y backend/src
---
## FASE 8 — SKU, exportación, responsive, rangos de precio, iconografía (2026-06-09)
**Goal:** SKU en productos y marcas, exportación CSV/XLSX, admin responsive, filtro de precio con rangos dinámicos, sustitución de emojis por SVG.
**Resultado esperado:** Admin panel exportable y responsivo, productos con SKU visible, selector de rangos de precio client-side.
### Productos y Marcas
- [x] Campo `sku String?` en modelos Product y Brand (schema + migración)
- [x] Admin: SKU visible en tabla Productos y Marcas, editable en formularios create/edit
- [x] Frontend: SKU visible en ProductPage.tsx
- [x] SKUs generados para productos (~1019) y marcas existentes vía SQL directo (seed-sku.sql)
### Órdenes de prueba
- [x] 15 órdenes creadas en DB con timestamps en últimas 24h, estados variados (PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
### Export CSV/XLSX
- [x] Backend: endpoints en adminProductController, adminOrderController, adminCustomerController (ExcelJS)
- [x] Frontend: botones con icono Download + "CSV"/"XLSX" en AdminProducts, AdminOrders, AdminCustomers
### Admin responsivo
- [x] AdminLayout: sidebar colapsable en mobile (hamburguesa + overlay + botón cerrar), padding responsivo `p-4 sm:p-6 lg:p-8`
- [x] Tablas con `overflow-x-auto` + `whitespace-nowrap`, scroll horizontal funcional
- [x] `overflow-hidden` removido de contenedores de tabla (bloqueaba scroll)
- [x] Body con `overflow-x: hidden` en index.css
- [x] Navbar: icono User para acceso al admin visible en todos los tamaños
### Filtro de precio por rangos
- [x] Select único "Todos los precios" con rangos combinados (ej: `$1.290 - $30.000`, `$120.000+`)
- [x] Rangos calculados client-side desde los productos cargados (sin dependencia de API)
- [x] Funciona para todas las categorías del catálogo (perro, gato, ofertas, etc.)
### Iconografía
- [x] Reemplazar emoji 🐾 por `PawPrint` de lucide-react con `text-orange-500` en:
  - Navbar (logo)
  - Footer (logo)
  - AdminLayout (sidebar)
  - AdminLogin
- [x] Consistente en web, celular y todos los tamaños de pantalla
---
## FASE 9 — Migración de dark mode a tokens (2026-07)
**Goal:** Reemplazar el neutro plano usado inicialmente en dark mode por un sistema de 5 tokens con profundidad progresiva, y corregir la guía de estilos para que refleje la paleta real del sitio (azul, no naranjo, como color primario).
**Resultado esperado:** Todo el sitio en dark mode usa los mismos 5 tokens, sin páginas con tono distinto.
- [x] `tailwind.config.ts` → `theme.extend.colors.dark`: `bg` (`#0e100c`), `surface` (`#181a13`), `surface-elevated` (`#20231a`), `border` (`#282b1e`), `border-hover` (`#3a3f2b`), más `text`/`muted` sin cambio de tinte
- [x] Migración inicial en componentes tocados directamente (Navbar, Home, ProductCard, AdminLogin)
- [x] Revisión posterior: 19 archivos aún usaban hex neutro pre-tokens (`#111111`/`#1a1a1a`/`#222222`/`#2a2a2a`) — migrados todos: Footer, AdminLayout, CategoryPage, ProductPage, AllProductsPage, CartPage, PaymentFailed, BrandsCarousel, SizeSelector, y todas las páginas admin (Products/Orders/Brands/Customers/Coupons/Qr/Dashboard)
- [x] `contentStyle` inline de Recharts en AdminDashboard.tsx (tooltip del gráfico) — no es clase Tailwind, actualizado a hex directo (`#181a13`/`#282b1e`)
- [x] Corrección de la guía de estilos: azul (`blue-600`) es el color primario real (botones CTA, badge carrito, precio de oferta, links activos), naranjo (`orange-500`) es solo accent puntual (logo PawPrint, detalles de AdminLogin) — los tokens `primary`/`secondary` de `tailwind.config.ts` no reflejan esta jerarquía y no se usan como tal en ningún componente
- [ ] Pendiente menor: `AdminLogin.tsx` sigue usando `dark:text-zinc-100`/`dark:text-zinc-400` en vez de `dark.text`/`dark.muted` — inconsistencia de nomenclatura sin impacto visual, no corregido por no ser un pedido explícito
---
## FASE 10 — Módulo de Veterinaria (2026-07)
**Goal:** Sistema completo de reserva de citas veterinarias: catálogo de servicios, disponibilidad configurable, reserva pública con pago Transbank, y gestión admin con cancelación/reagendamiento.
**Resultado esperado:** Cliente puede reservar y pagar una cita; admin puede configurar horarios, bloquear fechas, y cancelar/reagendar citas existentes con notificación por email al dueño.
### Schema
- [x] `VetService` — nombre, descripción, duración, precio, `isActive` (soft delete)
- [x] `VetAvailability` — horario recurrente semanal (`dayOfWeek` 0-6, `startTime`/`endTime`)
- [x] `VetException` — bloqueos/aperturas puntuales por fecha (`BLOCKED_FULL_DAY` | `BLOCKED_SLOT` | `EXTRA_SLOT`)
- [x] `Appointment` — `appointmentNumber` único, estado (`AppointmentStatus`), datos del dueño/mascota, campos de reagendamiento (`rescheduledFrom*`, `changeReason`, `changedByAdmin`)
- [x] `AppointmentPayment` — mismo shape que `Payment` de e-commerce, para el pago Transbank de la cita
- [x] Nota de diseño documentada en el propio schema: `changeReason`/`rescheduledFrom*` solo guardan el último cambio, no un historial completo — migrar a `AppointmentHistory` si se necesita auditar cambios repetidos
### Backend — público
- [x] `vetAvailabilityService.ts` — cálculo de slots disponibles cruzando `VetAvailability` + `VetException` + citas ya tomadas
- [x] `GET /api/vet/services`, `GET /api/vet/availability`, `POST /api/vet/appointments` (re-chequeo de disponibilidad dentro de `$transaction` para evitar doble booking por condición de carrera)
- [x] `POST /api/vet/payment/create`, `GET /api/vet/payment/return` (commit real de Transbank + email de confirmación), `GET /api/vet/payment/status/:appointmentNumber`
### Backend — admin
- [x] CRUD `VetService`, CRUD `VetAvailability`, CRUD `VetException` bajo `/api/admin/vet/*`
- [x] `GET /api/admin/vet/appointments`, `PUT /:id/status`
- [x] `PUT /:id/cancel` (body: `reason`) — envía email de cancelación
- [x] `PUT /:id/reschedule` (body: `newDate`, `newStartTime`, `reason`) — re-chequea disponibilidad en `$transaction`, envía email de reagendamiento, preserva el estado de pago (`CONFIRMED` si ya estaba pagada, `PENDING` si no)
- [x] `emailService.ts` (Resend) — templates HTML de confirmación/cancelación/reagendamiento
### Frontend — público
- [x] `VetBookingPage.tsx` + `components/vet/SlotPicker.tsx` — elegir servicio, ver slots, completar datos, crear cita, pagar
- [x] `VetAppointmentSuccess.tsx` / `VetAppointmentFailed.tsx`
- [x] Entrada "Veterinaria" con badge "Nuevo" en el Navbar
### Frontend — admin
- [x] `AdminVetServices.tsx`, `AdminVetAvailability.tsx` (horario recurrente + excepciones), `AdminVetAppointments.tsx` (lista, cambio de estado, cancelar y reagendar con modales de confirmación)
- [x] `components/admin/VetSubNav.tsx` — subnavegación entre Citas/Servicios/Disponibilidad
- [x] Verificación end-to-end: reservar cita → pagar en sandbox → aparece confirmada en admin → cancelar → email de cancelación enviado
---
## FASE 11 — Auditoría y hardening de seguridad (2026-07-07)
**Goal:** Auditoría completa de seguridad (backend + frontend), categoría por categoría, con corrección de todo lo encontrado.
**Resultado esperado:** Sin vulnerabilidades explotables conocidas; controles verificados con pruebas ofensivas reales, no solo revisión de código.
### Hallazgos corregidos
- [x] `errorHandler.ts` filtraba `err.message` crudo al cliente en cualquier entorno — ahora genérico para 5xx en `NODE_ENV=production`
- [x] Sin rate limiting general — agregado `generalLimiter` (300/15min) en todo `/api/*`; `loginLimiter` (5/15min) ya existía para `/admin/login`
- [x] `orderNumber`/`appointmentNumber` generados solo con `Date.now()` — predecibles/enumerables. Cambiados a `Date.now() + crypto.randomBytes(3).toString('hex')`
- [x] `emailService.ts` interpolaba `reason`/`petName`/`service.name` sin escapar en templates HTML — agregado `escapeHtml()`
- [x] Ningún endpoint POST/PUT tenía `validateRequest` cableado pese a existir el middleware — creado `backend/src/schemas/index.ts` con 14 schemas y cableados en todas las rutas que faltaban
- [x] `.env.example` sin advertencia sobre `JWT_SECRET`/`JWT_EXPIRES_IN` — agregados comentarios
- [x] JWT admin en localStorage con expiración de 7 días — acortado a 8h; `PrivateRoute.tsx` ahora decodifica el JWT y desloguea proactivamente si `exp` ya pasó
- [x] `npm audit fix` (sin `--force`) aplicado en frontend y backend — backend 7→4 vulns, frontend 8→2 vulns; las restantes requieren downgrade/upgrade mayor (`exceljs`, `vite`) y quedaron pendientes de decisión
### Verificado sin cambios (ya estaba bien)
- [x] Auth de rutas admin — todas bajo `authMiddleware`
- [x] Precios de productos/servicios/cupones — siempre calculados server-side desde DB, nunca confiados del body
- [x] Verificación de pago Transbank — `Transaction.commit()` real, resultado basado en `response_code`
- [x] CORS — origin restringido a lista fija, no refleja orígenes no permitidos
- [x] Sin secretos hardcodeados fuera de las credenciales sandbox de Transbank (públicas por diseño)
- [x] `$queryRawUnsafe` en `adminCustomerController.ts` — parametrizado, no interpolación de strings
### Pruebas ofensivas ejecutadas (no solo revisión de código)
- [x] Brute-force de login (8 intentos) → bloqueado con 429 desde el 6º intento
- [x] Tokens JWT manipulados (sin token, basura, secreto incorrecto, expirado, ataque `alg:none`) → los 5 rechazados con 401
- [x] CORS desde origen no permitido → sin header `Access-Control-Allow-Origin`, bloqueado por el navegador
- [x] Inyección XSS real (`<script>`/`onerror`) en nombre/mascota/notas de cita → aceptado como texto por la API, pero React lo escapa al renderizar (sin ejecución)
- [x] IDOR — 200 intentos de fuerza bruta sobre el sufijo random de un `orderNumber` nuevo (16.7M combinaciones) → 0 encontrados
- [ ] Hallazgo menor sin corregir: órdenes creadas **antes** de este fix conservan el formato viejo sin sufijo random (más adivinable, aunque igual requiere acertar el timestamp exacto) — no se migraron datos históricos, decisión pendiente del usuario
- [ ] Verificación adicional por email en `GET /orders/:orderNumber` y `GET /vet/payment/status/:appointmentNumber` — evaluada y descartada, no implementada (decisión consciente del usuario)
---
## FASE 12 — Verificación end-to-end con Playwright (2026-07-07)
**Goal:** Recorrer la aplicación completa (tienda pública + panel admin) con Playwright real, no solo type-check/lint, para encontrar bugs funcionales que la revisión de código no detecta.
**Resultado esperado:** Todos los flujos principales verificados con navegador headless real; bugs encontrados corregidos y confirmados con una segunda corrida.
### Bugs encontrados y corregidos
- [x] `AdminOrders.tsx` llamaba `api.patch()` para cambiar estado de orden, pero la ruta backend solo acepta `PUT` → cambiar estado de orden devolvía 404 en el admin. Corregido a `api.put()`
- [x] `AdminProducts.tsx` tenía el mismo bug al editar un producto (`patch` vs `put`). Corregido
- [x] Warning de React "Each child should have a unique key" en `AdminOrders.tsx` — el `<>` (Fragment corto) que envolvía cada fila + fila de detalle expandible no tenía `key`. Cambiado a `<Fragment key={order.id}>`
- [x] Crear/editar marca con "URL Logo" vacío devolvía 400 — el schema Zod (`createBrandSchema` y `updateBrandSchema`) usaba `.url()` sin aceptar string vacío, pero el formulario envía `logoUrl: ''` cuando el campo queda en blanco. Corregido con `.optional().or(z.literal(''))` y normalización a `undefined`/`null` en el controller
### Verificado sin bugs (tienda pública)
- [x] Home, buscador, las 6 secciones de categoría + subcategorías, página "Todos los productos"
- [x] Detalle de producto (precio, SKU, relacionados), agregar al carrito, cambiar cantidad en carrito
- [x] Checkout completo: formulario → creación de orden real → redirect confirmado a `webpay3gint.transbank.cl`
- [x] Página de veterinaria, páginas estáticas (privacidad/términos/nosotros/devoluciones), ruta 404, toggle dark mode
### Verificado sin bugs (panel admin)
- [x] Login, dashboard, CRUD completo de marcas (crear/editar/eliminar), cupones (crear/eliminar), servicios veterinarios (crear)
- [x] Disponibilidad veterinaria (horario recurrente + excepciones), cancelar cita real (creada vía API pública, cancelada desde admin, confirmado `CANCELLED` en DB)
- [x] Logout — confirmado que es un diálogo de confirmación de dos pasos por diseño (no bug): clic en "Cerrar sesión" abre el diálogo, hay que confirmar dentro para que se ejecute
### Notas de la herramienta de prueba (no bugs de la app, documentadas para no repetir el error)
- `CartDrawer` permanece montado en el DOM oculto (`translate-x-full`) — selectores de test deben escoparse fuera de él (ej. a `main`) para no matchear la instancia oculta
- Vite recompila rutas on-demand en frío — usar `waitForFunction` esperando que desaparezca el texto de loading, no `waitForTimeout` fijo, y agregar un pequeño delay tras la navegación antes de chequear (evita el falso positivo del instante en blanco entre rutas)
### Verificación final combinada
- [x] `npm run type-check` y `npm run lint` limpios en ambos paquetes
- [x] Recorrido completo repetido tras los fixes: tienda + admin + logout, sin errores de consola ni respuestas de API fallidas
---

## Convenciones globales (aplicar en todas las fases)
- Todo en TypeScript estricto — nunca `any`
- Backend: todo handler async con try/catch y `next(error)`; endpoints POST/PUT nuevos deben llevar `validateRequest(schema)` en la ruta
- Frontend: React Query para server state, Zustand solo para carrito/tema/UI
- Imports: orden external → internal → relative → types
- Precios siempre en CLP usando `formatCLP()` de utils/formatters.ts
- Errores API: siempre `{ error: string }` — nunca exponer stack traces, genérico en producción para 5xx
- Soft delete: productos y servicios veterinarios nunca se borran, usar `isActive = false`. Marcas y cupones sí se borran.
- Transacciones multi-tabla: siempre `prisma.$transaction([...])`
- Paginación: cursor-based en productos (`?cursor=<id>&limit=20`), page-based en la mayoría de listados admin (`?page=1&limit=20`)
- UI: Tailwind puro sin componentes Shadcn/ui (elementos HTML nativos estilizados con Tailwind)
- Al mapear filas expandibles en listas, usar `<Fragment key={...}>`, no `<>` sin key
- Rate limiting: `loginLimiter` dedicado en login, `generalLimiter` en todo `/api/*`
---
