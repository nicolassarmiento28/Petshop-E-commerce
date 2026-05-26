# PLAN.md — Tienda de Mascotas (Pet Shop)
Plan de implementación completo por fases. Leer CONTEXT.md y AGENTS.md antes de ejecutar.
---
## FASE 1 — Base del proyecto
**Goal:** Scaffold completo del monorepo con toda la configuración base lista.
**Resultado esperado:** `npm run dev` en ambos proyectos sin errores. `/api/health` responde `{ status: "ok" }`.
### Frontend
- [ ] Crear estructura de carpetas completa (`src/components/ui|layout|product|cart|checkout`, `pages`, `store`, `hooks`, `services`, `types`, `utils`, `assets`)
- [ ] `frontend/package.json` — dependencias: react, react-dom, react-router-dom, @tanstack/react-query, axios, zustand, react-hook-form, @hookform/resolvers, zod, clsx, tailwind-merge, class-variance-authority, lucide-react
- [ ] `frontend/vite.config.ts` — alias `@/` → `src/`
- [ ] `frontend/tsconfig.json` + `tsconfig.node.json` — strict mode, paths `@/*`
- [ ] `frontend/tailwind.config.ts` — colores: orange-500 (primary), emerald-600 (secondary), amber-400 (accent)
- [ ] `frontend/postcss.config.js`
- [ ] `frontend/index.html`
- [ ] `frontend/.env` + `.env.example` — `VITE_API_URL=http://localhost:3001/api`
- [ ] `frontend/src/index.css` — Tailwind directives + CSS variables Shadcn
- [ ] `frontend/src/main.tsx` — ReactDOM + QueryClientProvider + RouterProvider
- [ ] `frontend/src/App.tsx` — React Router con rutas placeholder para todas las páginas
- [ ] `frontend/src/types/index.ts` — tipos completos: ProductType, CategoryType, BrandType, OrderType, OrderItemType, CartItemType, PaymentType, OrderStatus, PaymentStatus
- [ ] `frontend/src/services/api.ts` — instancia Axios con baseURL desde VITE_API_URL
- [ ] `frontend/src/utils/formatters.ts` — formatCLP(price: number): string, formatDate(date: string): string
- [ ] `frontend/components.json` — config Shadcn/ui
- [ ] Instalar componentes Shadcn: Button, Card, Sheet, Badge, NavigationMenu, Dialog, Input, Label
### Backend
- [ ] Crear estructura de carpetas completa (`prisma`, `src/controllers|routes|middleware|services|utils|lib`)
- [ ] `backend/package.json` — deps: express, cors, helmet, dotenv, jsonwebtoken, bcrypt, @prisma/client, transbank-sdk | dev: typescript, ts-node-dev, @types/*, prisma
- [ ] `backend/tsconfig.json` — strict, outDir `dist/`, rootDir `src/`
- [ ] `backend/.env` + `.env.example` — NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, RETURN_URL
- [ ] `backend/prisma/schema.prisma` — schema exacto: Category, Brand, Product, Order, OrderItem, Payment, Admin + enums OrderStatus, PaymentStatus
- [ ] `backend/prisma/seed.ts` — placeholder (se completa en Fase 3)
- [ ] `backend/src/lib/prisma.ts` — singleton PrismaClient
- [ ] `backend/src/utils/logger.ts` — logger.info/warn/error wrapper
- [ ] `backend/src/middleware/errorHandler.ts` — middleware global, responde `{ error: message }` nunca expone stack
- [ ] `backend/src/middleware/authMiddleware.ts` — verifica JWT Bearer, rechaza con 401
- [ ] `backend/src/middleware/validateRequest.ts` — valida body con Zod schema
- [ ] Controllers placeholder: productController, categoryController, orderController, paymentController, adminController
- [ ] Routes placeholder: productRoutes, categoryRoutes, orderRoutes, paymentRoutes, adminRoutes
- [ ] `backend/src/app.ts` — Express config completa: helmet, cors, json, rutas montadas, /api/health
- [ ] `backend/src/server.ts` — app.listen(PORT)
- [ ] Verificación: `npm run type-check` en ambos → 0 errores
---
## FASE 2 — Frontend base
**Goal:** Layout visual completo con navegación funcional y páginas base renderizando datos mockeados.
**Resultado esperado:** App navegable con Navbar, Footer, Home con Hero, CategoryPage y ProductCard visibles.
- [ ] `src/components/layout/Navbar.tsx` — logo, megamenú con NavigationMenu (6 secciones: Perro, Gato, Farmacia, Pequeñas Mascotas, Ofertas, Marcas), ícono carrito con badge de cantidad, responsive mobile
- [ ] `src/components/layout/Footer.tsx` — ubicación física + Google Maps link, teléfono/WhatsApp/email, redes (Instagram, Facebook, TikTok), links legales, logo, copyright
- [ ] `src/components/layout/Layout.tsx` — wrapper con Navbar + children + Footer
- [ ] `src/pages/Home.tsx` — Hero con CTA, sección productos destacados (isFeatured), sección ofertas (salePrice != null), sección marcas (logos)
- [ ] `src/components/product/ProductCard.tsx` — imagen, nombre, marca, precio (con/sin descuento con line-through), badge "Oferta", botón "Agregar al carrito"
- [ ] `src/components/product/ProductGrid.tsx` — grid responsive de ProductCard con loading skeleton y empty state
- [ ] `src/pages/CategoryPage.tsx` — reutilizable, recibe slug vía useParams, título de categoría, filtros básicos (subcategoría, marca), ProductGrid
- [ ] `src/pages/ProductPage.tsx` — detalle de producto: imagen grande, galería, descripción, precio, stock, botón agregar al carrito
- [ ] Conectar Layout.tsx en App.tsx para todas las rutas
- [ ] Verificación visual: todas las páginas renderizan sin errores de consola
---
## FASE 3 — Backend base
**Goal:** API REST completa con datos reales desde PostgreSQL.
**Resultado esperado:** Frontend consume datos reales. Seed con categorías, marcas y productos de prueba.
- [ ] `backend/src/controllers/productController.ts` — getProducts (filtros: category, brand, sale, search, cursor pagination), getProductBySlug
- [ ] `backend/src/controllers/categoryController.ts` — getCategories (árbol con children), getCategoryBySlug
- [ ] `backend/src/routes/productRoutes.ts` — GET /api/products, GET /api/products/:slug
- [ ] `backend/src/routes/categoryRoutes.ts` — GET /api/categories, GET /api/brands
- [ ] `backend/prisma/seed.ts` — categorías (6 principales + subcategorías), marcas (Royal Canin, Hills, Purina, Advance, Eukanuba, ProPlan), 20+ productos con imágenes reales (Cloudinary/URL externa)
- [ ] Ejecutar: `npx prisma migrate dev --name init` + `npx prisma db seed`
- [ ] `frontend/src/hooks/useProducts.ts` — useQuery para lista y detalle
- [ ] `frontend/src/services/productService.ts` — fetchProducts(filters), fetchProductBySlug(slug), fetchCategories(), fetchBrands()
- [ ] Conectar Home.tsx y CategoryPage.tsx a la API real (reemplazar datos mockeados)
- [ ] Verificación: `curl http://localhost:3001/api/products` retorna productos del seed
---
## FASE 4 — Carrito y checkout
**Goal:** Carrito funcional con persistencia y formulario de checkout validado.
**Resultado esperado:** Usuario puede agregar productos, ver el drawer del carrito, y completar el formulario de checkout.
- [ ] `frontend/src/store/cartStore.ts` — Zustand con persist: items (CartItemType[]), addItem, removeItem, updateQuantity, clearCart, computed: totalItems, totalPrice
- [ ] `frontend/src/hooks/useCart.ts` — wrapper del cartStore con lógica de UI
- [ ] `frontend/src/components/cart/CartItem.tsx` — imagen, nombre, precio unitario, selector de cantidad (+/-), botón eliminar
- [ ] `frontend/src/components/cart/CartSummary.tsx` — subtotal, total formateado en CLP, botón "Ir al checkout"
- [ ] `frontend/src/components/cart/CartDrawer.tsx` — Sheet de Shadcn, lista de CartItem, CartSummary, estado vacío
- [ ] Conectar CartDrawer al ícono del Navbar (badge con cantidad)
- [ ] `frontend/src/pages/CartPage.tsx` — versión página completa del carrito
- [ ] `frontend/src/components/checkout/CheckoutForm.tsx` — React Hook Form + Zod: campos customerName, customerEmail, customerPhone, shippingAddress. Validación completa.
- [ ] `frontend/src/pages/CheckoutPage.tsx` — resumen del pedido + CheckoutForm + botón "Pagar con Webpay"
- [ ] `backend/src/controllers/orderController.ts` — createOrder: valida stock, calcula total, crea Order + OrderItems en transacción Prisma
- [ ] `backend/src/routes/orderRoutes.ts` — POST /api/orders, GET /api/orders/:orderNumber
- [ ] `frontend/src/services/orderService.ts` — createOrder(data), getOrder(orderNumber)
- [ ] Verificación: flujo completo agregar → carrito → checkout → orden creada en BD
---
## FASE 5 — Pasarela de pago Transbank
**Goal:** Flujo completo de pago en sandbox funcional de extremo a extremo.
**Resultado esperado:** Usuario paga con tarjeta de prueba y ve pantalla de éxito/fallo con datos reales.
- [ ] `backend/src/services/transbankService.ts` — transbankOptions (sandbox/prod), createTransaction(buyOrder, sessionId, amount, returnUrl), commitTransaction(token)
- [ ] `backend/src/controllers/paymentController.ts` — createPayment: crea Payment PENDING, llama Transbank, guarda token, retorna {token, url} | paymentReturn: commit, actualiza Payment+Order en transacción Prisma, redirige a frontend | getPaymentStatus: retorna estado para pantalla de resultado
- [ ] `backend/src/routes/paymentRoutes.ts` — POST /api/payment/create, GET /api/payment/return, GET /api/payment/status/:orderNumber
- [ ] `frontend/src/services/paymentService.ts` — createPayment(orderId), getPaymentStatus(orderNumber)
- [ ] `frontend/src/hooks/usePayment.ts` — useMutation para createPayment, manejo del form POST automático
- [ ] Actualizar `CheckoutPage.tsx` — al submit del form: createOrder → createPayment → auto-submit form POST hacia URL Transbank
- [ ] `frontend/src/pages/PaymentReturn.tsx` — página de loading/redirect mientras el backend procesa el callback
- [ ] `frontend/src/pages/PaymentSuccess.tsx` — llama getPaymentStatus, muestra número de orden, monto, últimos 4 dígitos de tarjeta, código de autorización. Llama cartStore.clearCart()
- [ ] `frontend/src/pages/PaymentFailed.tsx` — muestra motivo, botón "Reintentar" (vuelve al checkout) y "Volver al inicio"
- [ ] Verificación sandbox: tarjeta `4051 8856 0044 6623`, CVV `123`, RUT `11.111.111-1`, clave `123` → pantalla de éxito
---
## FASE 6 — Panel de administración
**Goal:** Panel admin protegido con JWT para gestionar productos y órdenes.
**Resultado esperado:** Admin puede hacer login, crear/editar/desactivar productos y cambiar estado de órdenes.
- [ ] `backend/src/controllers/adminController.ts` — login: verifica email+bcrypt, retorna JWT firmado con JWT_SECRET
- [ ] `backend/src/routes/adminRoutes.ts` — POST /api/admin/login (público) + rutas protegidas con authMiddleware
- [ ] Admin seed: crear usuario admin en seed.ts con bcrypt hash
- [ ] Rutas admin productos: GET/POST /api/admin/products, PUT/DELETE /api/admin/products/:id (soft delete → isActive=false)
- [ ] Rutas admin órdenes: GET /api/admin/orders, PUT /api/admin/orders/:id/status
- [ ] `frontend/src/pages/admin/AdminLogin.tsx` — formulario email+password, guarda JWT en localStorage, redirige a dashboard
- [ ] Protección de rutas admin en App.tsx — PrivateRoute que verifica JWT en localStorage
- [ ] `frontend/src/pages/admin/AdminDashboard.tsx` — resumen: total órdenes, ingresos, productos activos
- [ ] `frontend/src/pages/admin/AdminProducts.tsx` — tabla paginada de productos, botones editar/desactivar, modal/drawer para crear y editar (React Hook Form + Zod)
- [ ] `frontend/src/pages/admin/AdminOrders.tsx` — tabla de órdenes con filtro por estado, selector de cambio de estado, detalle expandible de items
- [ ] Verificación: login admin → CRUD producto → cambio estado orden → logout
---
## Convenciones globales (aplicar en todas las fases)
- Todo en TypeScript estricto — nunca `any`
- Backend: todo handler async con try/catch y `next(error)`
- Frontend: React Query para server state, Zustand solo para carrito
- Imports: orden external → internal → relative → types
- Precios siempre en CLP usando `formatCLP()` de utils/formatters.ts
- Errores API: siempre `{ error: string }` — nunca exponer stack traces
- Soft delete: nunca borrar productos, usar `isActive = false`
- Transacciones multi-tabla: siempre `prisma.$transaction([...])`
- Paginación: cursor-based con `?cursor=<id>&limit=20`
---