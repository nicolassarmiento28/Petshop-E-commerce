# Dark Mode + Responsividad Total — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar dark mode con paleta Índigo Nocturno y toggle en la Navbar, persistido en localStorage, y asegurar responsividad completa en todos los breakpoints.

**Architecture:** Zustand `themeStore` con persist aplica/remueve la clase `dark` en `<html>`. Tailwind `darkMode: 'class'` (ya configurado) procesa las variantes `dark:`. Variables CSS en `index.css` para los tokens de color. Todos los componentes reciben clases `dark:` inline.

**Tech Stack:** React 18, TypeScript 5, Tailwind CSS 3, Zustand, lucide-react

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `frontend/tailwind.config.ts` | Modificar — agregar breakpoint `xs: '475px'` |
| `frontend/src/index.css` | Modificar — variables CSS dark mode, body dark bg |
| `frontend/src/store/themeStore.ts` | Crear — Zustand store con persist |
| `frontend/src/components/layout/Layout.tsx` | Modificar — aplicar clase `dark` en `<html>` |
| `frontend/src/components/layout/Navbar.tsx` | Modificar — toggle Sun/Moon + dark classes |
| `frontend/src/components/layout/Footer.tsx` | Modificar — dark classes |
| `frontend/src/pages/Home.tsx` | Modificar — dark + responsive |
| `frontend/src/components/product/ProductCard.tsx` | Modificar — dark classes |
| `frontend/src/components/product/ProductGrid.tsx` | Modificar — dark skeleton/empty |
| `frontend/src/components/product/BrandsCarousel.tsx` | Modificar — dark classes |
| `frontend/src/components/cart/CartDrawer.tsx` | Modificar — dark classes |
| `frontend/src/components/cart/CartItem.tsx` | Modificar — dark classes |
| `frontend/src/components/cart/CartSummary.tsx` | Modificar — dark classes |
| `frontend/src/pages/CartPage.tsx` | Modificar — dark classes |
| `frontend/src/pages/CheckoutPage.tsx` | Modificar — dark classes |
| `frontend/src/components/checkout/CheckoutForm.tsx` | Modificar — dark inputs/labels |
| `frontend/src/pages/PaymentSuccess.tsx` | Modificar — dark classes |
| `frontend/src/pages/PaymentFailed.tsx` | Modificar — dark classes |
| `frontend/src/pages/PaymentReturn.tsx` | Modificar — dark classes |
| `frontend/src/pages/CategoryPage.tsx` | Modificar — dark + responsive |
| `frontend/src/pages/AllProductsPage.tsx` | Modificar — dark + responsive |
| `frontend/src/pages/ProductPage.tsx` | Modificar — dark + responsive |
| `frontend/src/components/admin/AdminLayout.tsx` | Modificar — dark classes |
| `frontend/src/pages/admin/AdminLogin.tsx` | Modificar — dark classes |
| `frontend/src/pages/admin/AdminDashboard.tsx` | Modificar — dark classes |
| `frontend/src/pages/admin/AdminProducts.tsx` | Modificar — dark classes |
| `frontend/src/pages/admin/AdminOrders.tsx` | Modificar — dark classes |

---

## Task 1: Tailwind config + CSS variables

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Agregar breakpoint xs y colores dark en tailwind.config.ts**

```typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#059669',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#fbbf24',
          foreground: '#1f2937',
        },
        dark: {
          bg: '#1a1f2e',
          surface: '#242b3d',
          surface2: '#2d3548',
          text: '#e8eaf0',
          muted: '#8892a4',
          border: '#353d52',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Agregar variables CSS dark y body dark en index.css**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 0 0% 100%;
    --secondary: 160.1 84.1% 39.4%;
    --secondary-foreground: 0 0% 100%;
    --accent: 43.3 96.4% 56.3%;
    --accent-foreground: 220 13% 18%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 24.6 95% 53.1%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    background-color: #FAFAF8;
    color: #111827;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .dark body {
    background-color: #1a1f2e;
    color: #e8eaf0;
  }
}

/* Typography */
.font-display {
  font-family: 'Fraunces', Georgia, serif;
}
```

- [ ] **Step 3: Verificar que el build de Tailwind no tiene errores**

```bash
cd frontend && npm run type-check
```
Expected: 0 errores TypeScript.

---

## Task 2: ThemeStore

**Files:**
- Create: `frontend/src/store/themeStore.ts`

- [ ] **Step 1: Crear el store**

```typescript
// frontend/src/store/themeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const getInitialTheme = (): Theme => {
  // Called only on client — safe to access window
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('petshop-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
      setTheme: (t: Theme) => {
        applyTheme(t)
        set({ theme: t })
      },
    }),
    {
      name: 'petshop-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
```

---

## Task 3: Layout — aplicar clase dark en html

**Files:**
- Modify: `frontend/src/components/layout/Layout.tsx`

- [ ] **Step 1: Suscribir Layout al themeStore y aplicar clase dark en html**

```typescript
// frontend/src/components/layout/Layout.tsx
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useThemeStore } from '@/store/themeStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-[#1a1f2e] transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

---

## Task 4: Navbar — toggle dark mode + dark classes

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Reemplazar Navbar.tsx completo**

```typescript
// frontend/src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search, User, Sun, Moon } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import CartDrawer from '@/components/cart/CartDrawer'

const NAV_LINKS = [
  { label: 'Todos los productos', to: '/productos' },
  { label: 'Perro', to: '/categoria/perro' },
  { label: 'Gato', to: '/categoria/gato' },
  { label: 'Farmacia', to: '/categoria/farmacia' },
  { label: 'Pequeñas Mascotas', to: '/categoria/pequenas-mascotas' },
  { label: 'Ofertas', to: '/categoria/ofertas' },
  { label: 'Marcas', to: '/categoria/marcas' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const totalItems = useCartStore((s) => s.totalItems)
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchQuery('')
    setMobileOpen(false)
    navigate(`/productos?search=${encodeURIComponent(q)}`)
  }

  return (
    <>
      {/* Top info bar */}
      <div className="bg-blue-700 dark:bg-[#242b3d] text-white dark:text-[#e8eaf0] text-xs py-1.5 hidden sm:block transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>Envío a todo Chile · Lunes a Sábado</span>
          <span>contacto@petshop.cl · +56 9 1234 5678</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white dark:bg-[#242b3d] border-b border-gray-200 dark:border-[#353d52] shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">🐾</span>
              <span
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-[#e8eaf0] tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Petshop
              </span>
            </Link>

            {/* Search bar — center, grows */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex items-center">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas..."
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-[#353d52] rounded-xl text-sm text-gray-700 dark:text-[#e8eaf0] bg-gray-50 dark:bg-[#2d3548] focus:bg-white dark:focus:bg-[#1a1f2e] focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto sm:ml-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="/admin"
                className="hidden sm:flex p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                aria-label="Mi cuenta"
              >
                <User size={20} />
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-gray-700 dark:text-[#e8eaf0] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile search button */}
              <button
                className="sm:hidden p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              <button
                className="lg:hidden p-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] rounded-lg transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Desktop nav links strip */}
          <nav className="hidden lg:flex items-center gap-1 border-t border-gray-100 dark:border-[#353d52] py-1.5 overflow-x-auto">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  item.label === 'Ofertas'
                    ? 'text-gray-600 dark:text-[#8892a4] hover:text-white hover:bg-red-500'
                    : 'text-gray-600 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-[#353d52] bg-white dark:bg-[#242b3d]">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-[#353d52] rounded-xl outline-none focus:border-blue-400 bg-gray-50 dark:bg-[#2d3548] text-gray-700 dark:text-[#e8eaf0] placeholder:text-gray-400 dark:placeholder:text-[#8892a4]"
                />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Search size={16} />
                </button>
              </form>
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-[#e8eaf0] rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2d3548] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
```

---

## Task 5: Footer — dark classes

**Files:**
- Modify: `frontend/src/components/layout/Footer.tsx`

- [ ] **Step 1: Agregar dark classes al footer**

Reemplazar la línea del elemento `<footer>` y sus clases internas:

```typescript
// frontend/src/components/layout/Footer.tsx
// Cambiar:
<footer className="bg-gray-900 text-gray-300">
// Por:
<footer className="bg-gray-900 dark:bg-[#0f1420] text-gray-300 dark:text-[#8892a4] transition-colors duration-300">
```

Cambiar el borde bottom del footer:
```typescript
// Cambiar:
<div className="border-t border-gray-800 mt-12 pt-6 ...">
// Por:
<div className="border-t border-gray-800 dark:border-[#353d52] mt-12 pt-6 ...">
```

Cambiar los h4 de secciones:
```typescript
// Cambiar:
<h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
// Por:
<h4 className="text-white dark:text-[#e8eaf0] font-semibold text-sm uppercase tracking-wider mb-4">
```

Cambiar el logo text:
```typescript
// Cambiar:
<span className="text-xl font-bold text-white" ...>
// Por:
<span className="text-xl font-bold text-white dark:text-[#e8eaf0]" ...>
```

Cambiar los íconos sociales:
```typescript
// Cambiar:
className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-400 transition-colors"
// Por:
className="p-2 rounded-lg bg-gray-800 dark:bg-[#2d3548] hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
```

---

## Task 6: Home.tsx — dark + responsive

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: Agregar dark classes y ajustes responsive al hero**

```typescript
// Cambiar sección hero:
<section className="w-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-[#1a1f2e] dark:to-[#242b3d] overflow-hidden transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] gap-4 sm:gap-8">
      <div className="py-8 sm:py-12 max-w-lg flex-1">
        <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 sm:mb-4">
          Tu tienda de mascotas
        </span>
        <h1
          className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-[#e8eaf0] leading-tight mb-3 sm:mb-4"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Todo lo que tu mascota{' '}
          <span className="text-blue-600 dark:text-blue-400">necesita</span>
        </h1>
        <p className="text-gray-600 dark:text-[#8892a4] mb-5 sm:mb-7 leading-relaxed text-sm sm:text-base">
          Alimentos premium, accesorios, farmacia veterinaria y mucho más. Envío a todo Chile.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors shadow-md shadow-blue-200 dark:shadow-none text-sm sm:text-base"
          >
            Ver productos <ArrowRight size={16} />
          </Link>
          <Link
            to="/categoria/ofertas"
            className="inline-flex items-center gap-2 bg-white dark:bg-[#2d3548] hover:bg-blue-50 dark:hover:bg-[#353d52] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-[#353d52] font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
          >
            Ver ofertas
          </Link>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <img
          src="/hero_foto/Banner-Bravery.jpg"
          alt="Perro y gato"
          className="h-[340px] w-auto object-contain drop-shadow-xl"
        />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Dark + responsive en sección carrusel de marcas**

```typescript
// Cambiar:
<section className="bg-white border-y border-gray-100 py-4">
// Por:
<section className="bg-white dark:bg-[#242b3d] border-y border-gray-100 dark:border-[#353d52] py-4 transition-colors duration-300">
```

- [ ] **Step 3: Dark + responsive en íconos de categorías**

```typescript
// Cambiar clase del Link de categoría:
className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#242b3d] border border-gray-100 dark:border-[#353d52] hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-none transition-all duration-200"

// Cambiar el texto:
className="text-xs font-semibold text-gray-600 dark:text-[#8892a4] group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center whitespace-pre-line leading-tight transition-colors"
```

- [ ] **Step 4: Dark en banner de marcas destacadas**

```typescript
// El banner ya tiene bg-gradient-to-r from-blue-600 to-blue-800, funciona en ambos modos.
// Sólo agregar dark en el texto secundario:
<p className="text-blue-200 dark:text-blue-300 text-sm font-medium mb-1">

// Y en los logo containers ya transparentes — no requiere cambio.
```

- [ ] **Step 5: Dark en encabezados de secciones Novedades y Más vendidos**

```typescript
// Cambiar en ambas secciones:
<h2 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaf0]" ...>

// Cambiar los textos "Destacados" / "Más populares":
<p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
<p className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">

// Cambiar los links "Ver todos":
className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
```

- [ ] **Step 6: Dark en fondo general de Home**

```typescript
// Cambiar:
<div className="bg-[#FAFAF8]">
// Por:
<div className="bg-[#FAFAF8] dark:bg-[#1a1f2e] transition-colors duration-300">
```

---

## Task 7: ProductCard — dark classes

**Files:**
- Modify: `frontend/src/components/product/ProductCard.tsx`

- [ ] **Step 1: Reemplazar ProductCard.tsx completo**

```typescript
// frontend/src/components/product/ProductCard.tsx
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatCLP } from '@/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import type { ProductType } from '@/types'

interface ProductCardProps {
  product: ProductType
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const hasDiscount = product.salePrice != null && product.salePrice < product.price
  const outOfStock = product.stock === 0

  return (
    <div className="group bg-white dark:bg-[#242b3d] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#353d52] shadow-sm hover:shadow-md hover:shadow-blue-100/60 dark:hover:shadow-none transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link to={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50 dark:bg-[#2d3548]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-blue-50 dark:bg-[#2d3548]">
            🐾
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Oferta
            </span>
          )}
          {outOfStock && (
            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Agotado
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        {product.brand && (
          <div className="h-6 flex items-center">
            {product.brand.logoUrl ? (
              <img
                src={product.brand.logoUrl}
                alt={product.brand.name}
                className="max-h-5 max-w-[80px] w-auto object-contain opacity-60 dark:opacity-80 dark:brightness-150"
              />
            ) : (
              <p className="text-xs text-gray-400 dark:text-[#8892a4] font-medium uppercase tracking-wide">
                {product.brand.name}
              </p>
            )}
          </div>
        )}
        <Link to={`/producto/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-[#e8eaf0] line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                {formatCLP(product.salePrice!)}
              </span>
              <span className="text-xs text-gray-400 dark:text-[#8892a4] line-through">
                {formatCLP(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-[#e8eaf0]">
              {formatCLP(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => !outOfStock && addItem(product, 1)}
          disabled={outOfStock}
          className={cn(
            'mt-2 w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
            outOfStock
              ? 'bg-gray-100 dark:bg-[#2d3548] text-gray-400 dark:text-[#8892a4] cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95',
          )}
        >
          <ShoppingCart size={15} />
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
```

---

## Task 8: ProductGrid — dark skeleton + empty state

**Files:**
- Modify: `frontend/src/components/product/ProductGrid.tsx`

- [ ] **Step 1: Leer el archivo actual y agregar dark classes**

Agregar en el skeleton (elementos `animate-pulse`):
```typescript
// Cambiar:
<div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
  <div className="aspect-square bg-gray-200 animate-pulse" />
  <div className="p-4 space-y-2">
    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
    <div className="h-4 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    <div className="h-8 bg-gray-200 rounded-xl animate-pulse mt-2" />
  </div>
</div>
// Por:
<div className="bg-white dark:bg-[#242b3d] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#353d52]">
  <div className="aspect-square bg-gray-200 dark:bg-[#2d3548] animate-pulse" />
  <div className="p-4 space-y-2">
    <div className="h-3 bg-gray-200 dark:bg-[#2d3548] rounded animate-pulse w-1/2" />
    <div className="h-4 bg-gray-200 dark:bg-[#2d3548] rounded animate-pulse" />
    <div className="h-4 bg-gray-200 dark:bg-[#2d3548] rounded animate-pulse w-3/4" />
    <div className="h-8 bg-gray-200 dark:bg-[#2d3548] rounded-xl animate-pulse mt-2" />
  </div>
</div>
```

En el empty state:
```typescript
// Cambiar texto del empty state:
<p className="text-gray-400 dark:text-[#8892a4] text-sm">No se encontraron productos</p>
```

---

## Task 9: BrandsCarousel — dark classes

**Files:**
- Modify: `frontend/src/components/product/BrandsCarousel.tsx`

- [ ] **Step 1: Agregar dark a los botones de navegación y fondo**

```typescript
// Botones flecha: cambiar
className="... bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 ..."
// Por:
className="... bg-white dark:bg-[#2d3548] hover:bg-gray-100 dark:hover:bg-[#353d52] border border-gray-200 dark:border-[#353d52] text-gray-600 dark:text-[#8892a4] ..."
```

---

## Task 10: CartDrawer + CartItem + CartSummary — dark classes

**Files:**
- Modify: `frontend/src/components/cart/CartDrawer.tsx`
- Modify: `frontend/src/components/cart/CartItem.tsx`
- Modify: `frontend/src/components/cart/CartSummary.tsx`

- [ ] **Step 1: CartDrawer — panel y overlay dark**

```typescript
// Panel principal — cambiar:
className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 ...`}
// Por:
className={`fixed top-0 right-0 h-full w-full xs:w-80 sm:w-96 bg-white dark:bg-[#242b3d] z-50 ...`}

// Header del drawer — cambiar:
<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
  <h2 className="text-lg font-bold text-gray-900">Tu carrito</h2>
  <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
// Por:
<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#353d52]">
  <h2 className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">Tu carrito</h2>
  <button className="p-1.5 text-gray-400 dark:text-[#8892a4] hover:text-gray-700 dark:hover:text-[#e8eaf0] hover:bg-gray-100 dark:hover:bg-[#2d3548] rounded-lg transition-colors">

// Empty state texto:
<p className="text-gray-500 dark:text-[#8892a4] font-medium">Tu carrito está vacío</p>

// Sticky bottom summary:
<div className="px-5 pb-6 pt-3 bg-white dark:bg-[#242b3d] border-t border-gray-100 dark:border-[#353d52]">
```

- [ ] **Step 2: CartItem — dark classes**

Leer `CartItem.tsx` y agregar dark en: fondo del item, nombre del producto, precio, botones +/- y eliminar.

```typescript
// Contenedor principal del item — cambiar:
<div className="flex gap-3 py-3 border-b border-gray-100 ...">
// Por:
<div className="flex gap-3 py-3 border-b border-gray-100 dark:border-[#353d52] ...">

// Imagen placeholder:
<div className="bg-gray-100 dark:bg-[#2d3548] ...">

// Nombre:
<p className="text-sm font-medium text-gray-800 dark:text-[#e8eaf0] ...">

// Precio:
<p className="text-sm font-bold text-blue-600 dark:text-blue-400">

// Botones cantidad:
<button className="... bg-gray-100 dark:bg-[#2d3548] hover:bg-gray-200 dark:hover:bg-[#353d52] text-gray-600 dark:text-[#8892a4] ...">

// Botón eliminar:
<button className="... text-gray-400 dark:text-[#8892a4] hover:text-red-500 ...">
```

- [ ] **Step 3: CartSummary — dark classes**

```typescript
// Total label:
<span className="text-sm text-gray-600 dark:text-[#8892a4]">Total</span>
// Total amount:
<span className="text-lg font-bold text-gray-900 dark:text-[#e8eaf0]">

// Botón checkout ya es bg-blue-600 — no requiere cambio.
// Subtotales:
<span className="text-gray-500 dark:text-[#8892a4]">
```

---

## Task 11: Checkout y páginas de pago — dark classes

**Files:**
- Modify: `frontend/src/pages/CartPage.tsx`
- Modify: `frontend/src/pages/CheckoutPage.tsx`
- Modify: `frontend/src/components/checkout/CheckoutForm.tsx`
- Modify: `frontend/src/pages/PaymentSuccess.tsx`
- Modify: `frontend/src/pages/PaymentFailed.tsx`
- Modify: `frontend/src/pages/PaymentReturn.tsx`

- [ ] **Step 1: CartPage dark**

Cambiar fondos `bg-white` → `bg-white dark:bg-[#242b3d]`, textos `text-gray-900` → `text-gray-900 dark:text-[#e8eaf0]`, bordes `border-gray-100` → `border-gray-100 dark:border-[#353d52]`, fondo general `bg-[#FAFAF8]` → `bg-[#FAFAF8] dark:bg-[#1a1f2e]`.

- [ ] **Step 2: CheckoutPage dark**

Mismo patrón. Fondo de la página `dark:bg-[#1a1f2e]`. Cards de resumen `dark:bg-[#242b3d]`.

- [ ] **Step 3: CheckoutForm — inputs dark**

```typescript
// Cada input/select — agregar:
className="... bg-white dark:bg-[#2d3548] border-gray-300 dark:border-[#353d52] text-gray-900 dark:text-[#e8eaf0] placeholder:text-gray-400 dark:placeholder:text-[#8892a4] focus:border-blue-400 dark:focus:border-blue-500 ..."

// Labels:
className="text-sm font-medium text-gray-700 dark:text-[#e8eaf0]"

// Mensajes de error:
className="text-xs text-red-500 dark:text-red-400 mt-1"
```

- [ ] **Step 4: PaymentSuccess, PaymentFailed, PaymentReturn dark**

En cada página: fondo `dark:bg-[#1a1f2e]`, card central `dark:bg-[#242b3d]`, títulos `dark:text-[#e8eaf0]`, textos secundarios `dark:text-[#8892a4]`.

---

## Task 12: CategoryPage + AllProductsPage + ProductPage — dark + responsive

**Files:**
- Modify: `frontend/src/pages/CategoryPage.tsx`
- Modify: `frontend/src/pages/AllProductsPage.tsx`
- Modify: `frontend/src/pages/ProductPage.tsx`

- [ ] **Step 1: CategoryPage dark + responsive**

Fondo `dark:bg-[#1a1f2e]`. Header de categoría `dark:text-[#e8eaf0]`. Filtros sidebar/top `dark:bg-[#242b3d] dark:border-[#353d52]`. Labels de filtro `dark:text-[#8892a4]`. Checkboxes y selects `dark:bg-[#2d3548]`.

Responsive: en mobile (<lg) los filtros colapsan en un desplegable o fila horizontal, no sidebar fija.

- [ ] **Step 2: AllProductsPage dark + responsive**

Mismo patrón que CategoryPage.

- [ ] **Step 3: ProductPage dark + responsive**

```typescript
// Fondo general:
<div className="bg-[#FAFAF8] dark:bg-[#1a1f2e] ...">

// Contenedor del producto — layout responsive:
// En mobile: stack vertical (imagen arriba, info abajo)
// En md+: grid de 2 columnas
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

// Thumbnails — fondo:
<button className="... bg-gray-100 dark:bg-[#2d3548] border-gray-200 dark:border-[#353d52] ...">

// Nombre del producto:
<h1 className="... text-gray-900 dark:text-[#e8eaf0]">

// Precio:
<span className="... text-blue-600 dark:text-blue-400">

// Descripción:
<p className="text-gray-600 dark:text-[#8892a4]">

// Stock indicator — solo cambiar texto muted:
<span className="text-gray-400 dark:text-[#8892a4]">

// Sección "También te puede interesar":
<h2 className="... text-gray-900 dark:text-[#e8eaf0]">
```

---

## Task 13: Admin panel — dark classes

**Files:**
- Modify: `frontend/src/components/admin/AdminLayout.tsx`
- Modify: `frontend/src/pages/admin/AdminLogin.tsx`
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`
- Modify: `frontend/src/pages/admin/AdminProducts.tsx`
- Modify: `frontend/src/pages/admin/AdminOrders.tsx`

- [ ] **Step 1: AdminLayout — sidebar dark**

```typescript
// Sidebar:
<aside className="... bg-gray-900 dark:bg-[#0f1420] text-gray-300 ...">

// Contenido principal:
<main className="... bg-gray-100 dark:bg-[#1a1f2e]">
```

- [ ] **Step 2: AdminLogin dark**

Fondo `dark:bg-[#1a1f2e]`. Card login `dark:bg-[#242b3d]`. Inputs `dark:bg-[#2d3548] dark:border-[#353d52] dark:text-[#e8eaf0]`. Labels `dark:text-[#e8eaf0]`.

- [ ] **Step 3: AdminDashboard dark**

Cards de métricas: `dark:bg-[#242b3d] dark:border-[#353d52]`. Números y títulos `dark:text-[#e8eaf0]`. Subtítulos `dark:text-[#8892a4]`.

- [ ] **Step 4: AdminProducts + AdminOrders dark**

Tablas: `dark:bg-[#242b3d]`. Headers `dark:bg-[#2d3548] dark:text-[#8892a4]`. Filas hover `dark:hover:bg-[#2d3548]`. Bordes `dark:border-[#353d52]`. Texto `dark:text-[#e8eaf0]`. Modales/drawers `dark:bg-[#242b3d]`.

---

## Task 14: Verificación final

- [ ] **Step 1: Type check frontend**

```bash
cd frontend && npm run type-check
```
Expected: 0 errores.

- [ ] **Step 2: Lint frontend**

```bash
cd frontend && npm run lint
```
Expected: 0 errores.

- [ ] **Step 3: Build**

```bash
cd frontend && npm run build
```
Expected: build exitoso sin warnings críticos.

- [ ] **Step 4: Verificación visual manual**

Abrir `http://localhost:5173` y verificar:
- Toggle Sol/Luna en navbar cambia el modo
- Recargar la página mantiene el modo seleccionado
- En 375px (DevTools → iPhone SE): sin scroll horizontal
- En 768px (DevTools → iPad): layout tablet correcto
- En 1440px: layout desktop completo
- CartDrawer funciona en mobile en dark mode
- ProductPage con thumbnail strip y precio en dark mode
