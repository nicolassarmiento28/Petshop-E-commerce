# Spec: Dark Mode + Responsividad Total
**Fecha:** 2026-05-25

---

## Objetivo

Agregar dark mode con paleta Índigo Nocturno y asegurar responsividad completa en todos los breakpoints: phones pequeños/medianos/grandes (iOS y Android), tablets, desktops pequeños/grandes y monitores grandes.

---

## Paleta Dark Mode

| Token CSS | Light | Dark |
|---|---|---|
| `--bg` / body background | `#FAFAF8` | `#1a1f2e` |
| `--surface` (cards, navbar, sheet) | `#ffffff` | `#242b3d` |
| `--surface-2` (inputs, badges, hover) | `#f3f4f6` | `#2d3548` |
| `--text-primary` | `#111827` | `#e8eaf0` |
| `--text-muted` | `#6b7280` | `#8892a4` |
| `--border` | `#e5e7eb` | `#353d52` |
| Blue primary | `#2563eb` | `#3b82f6` |
| Green secondary | `#059669` | `#10b981` |
| Red (Ofertas) | `#ef4444` | `#f87171` |

Razón: el tono azulado del fondo (`#1a1f2e`) armoniza con el azul primario del sitio, creando coherencia visual en lugar de un contraste neutro genérico.

---

## Activación y Persistencia

- **Toggle:** ícono `Sun` / `Moon` (lucide-react) en la Navbar, junto al ícono de usuario. Visible en desktop y en el menú mobile desplegable.
- **Persistencia:** `localStorage` key `petshop-theme` con valor `'light' | 'dark'`.
- **Fallback inicial:** si no hay valor en localStorage, leer `prefers-color-scheme` del OS.
- **Mecanismo:** clase `dark` en el elemento `<html>`. Tailwind `darkMode: 'class'` (ya configurado).

---

## ThemeStore (nuevo)

```typescript
// frontend/src/store/themeStore.ts
type Theme = 'light' | 'dark'
interface ThemeStore {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}
// Zustand persist → localStorage key 'petshop-theme'
// Inicialización: leer localStorage → fallback prefers-color-scheme → 'light'
```

El store aplica/remueve la clase `dark` en `document.documentElement` en cada cambio.

---

## Breakpoints

Tailwind ya incluye `sm(640) md(768) lg(1024) xl(1280) 2xl(1536)`. Se agrega un breakpoint custom `xs` en `475px` para phones muy pequeños.

| Pantalla | Ancho | Grid productos | Navbar |
|---|---|---|---|
| Phone pequeño | <475px (`xs`) | 1 col | Logo + carrito + hamburger |
| Phone mediano | 475–640px | 1–2 col | Logo + carrito + hamburger |
| Tablet portrait | 640–768px (`sm`) | 2 col | Logo + search + carrito + hamburger |
| Tablet landscape | 768–1024px (`md`) | 2–3 col | Logo + search + carrito + hamburger |
| Desktop pequeño | 1024–1280px (`lg`) | 3 col | Full navbar con nav links |
| Desktop grande | 1280–1536px (`xl`) | 4 col | Full navbar |
| Monitor grande | >1536px (`2xl`) | 4 col, max-width contenido | Full navbar |

---

## Componentes a Modificar

### Infraestructura
1. **`tailwind.config.ts`** — agregar breakpoint `xs: '475px'`
2. **`index.css`** — variables CSS dark en `.dark { ... }`, actualizar body dark background
3. **`store/themeStore.ts`** — nuevo store Zustand con persist
4. **`components/layout/Layout.tsx`** — suscribirse al themeStore, aplicar clase `dark` en `<html>`

### Navegación
5. **`components/layout/Navbar.tsx`** — toggle Sun/Moon, dark classes en todos los elementos (bg, text, border, search input, mobile menu)

### Páginas principales
6. **`pages/Home.tsx`** — dark + responsive: hero, banners, BrandsCarousel, grids de productos
7. **`pages/CategoryPage.tsx`** — dark + responsive
8. **`pages/AllProductsPage.tsx`** — dark + responsive
9. **`pages/ProductPage.tsx`** — dark en galería, precio, descripción, botones, related products

### Componentes de producto
10. **`components/product/ProductCard.tsx`** — dark mode en card, imagen, precio, badge Oferta, botón
11. **`components/product/ProductGrid.tsx`** — dark en skeleton loading y empty state
12. **`components/product/BrandsCarousel.tsx`** — dark en fondo y botones de flecha

### Carrito
13. **`components/cart/CartDrawer.tsx`** — dark en Sheet overlay y panel
14. **`components/cart/CartItem.tsx`** — dark en fondo, texto, botones
15. **`components/cart/CartSummary.tsx`** — dark en totales y botón

### Checkout y pagos
16. **`pages/CartPage.tsx`** — dark
17. **`pages/CheckoutPage.tsx`** — dark
18. **`components/checkout/CheckoutForm.tsx`** — dark en inputs, labels, errores
19. **`pages/PaymentSuccess.tsx`** — dark
20. **`pages/PaymentFailed.tsx`** — dark
21. **`pages/PaymentReturn.tsx`** — dark

### Footer
22. **`components/layout/Footer.tsx`** — dark en fondo, texto, links

### Admin
23. **`components/admin/AdminLayout.tsx`** — dark en sidebar y contenido
24. **`pages/admin/AdminLogin.tsx`** — dark
25. **`pages/admin/AdminDashboard.tsx`** — dark en cards de métricas
26. **`pages/admin/AdminProducts.tsx`** — dark en tabla, modal, inputs
27. **`pages/admin/AdminOrders.tsx`** — dark en tabla y selectores

---

## Patrones de Implementación

### Patrón dark class en Tailwind
```tsx
// Antes
<div className="bg-white text-gray-900 border border-gray-200">

// Después
<div className="bg-white dark:bg-[#242b3d] text-gray-900 dark:text-[#e8eaf0] border border-gray-200 dark:border-[#353d52]">
```

### Variables CSS reutilizables en index.css
```css
.dark {
  --bg: #1a1f2e;
  --surface: #242b3d;
  --surface-2: #2d3548;
  --text: #e8eaf0;
  --text-muted: #8892a4;
  --border: #353d52;
}
```

### Layout aplicando clase dark
```tsx
// Layout.tsx
const { theme } = useThemeStore()
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

---

## Criterios de Aceptación

- [ ] Toggle en navbar cambia el modo y persiste en localStorage
- [ ] Al recargar la página respeta la preferencia guardada
- [ ] Sin preferencia guardada, respeta `prefers-color-scheme`
- [ ] Todos los textos tienen contraste WCAG AA mínimo en dark mode
- [ ] Home page sin scroll horizontal en 375px (iPhone SE)
- [ ] Navbar no se rompe en ningún breakpoint
- [ ] ProductCard legible en todos los tamaños
- [ ] CartDrawer funcional en mobile
- [ ] Admin panel usable en tablet landscape
