# Size Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add size/weight variant selector on product pages for food products, showing each size as an image card with photo, weight label, and price.

**Architecture:** Products in the same size group share a `sizeGroup` string field. The product detail API enriches the response with a `variants[]` array of all siblings. The frontend renders a visual card-based selector when variants exist.

**Tech Stack:** Prisma (PostgreSQL), Express + TypeScript backend, React + Tailwind frontend, Playwright for scraping

---

## File Structure

### Modified files:
- `backend/prisma/schema.prisma` — add `sizeGroup String?` to Product
- `backend/src/controllers/productController.ts` — enrich `getProductBySlug` with variants
- `backend/src/controllers/adminProductController.ts` — handle `sizeGroup` in update + create
- `frontend/src/types/index.ts` — add `ProductVariant` type, update `ProductType`
- `frontend/src/pages/ProductPage.tsx` — render size selector below price
- `frontend/src/pages/admin/AdminProducts.tsx` — add `sizeGroup` field to product form
- `backend/package.json` — add Playwright dev dependency

### Created files:
- `frontend/src/components/product/SizeSelector.tsx` — image-card variant picker
- `backend/prisma/seed-size-groups.ts` — scraping script to bootstrap variant data

---

### Task 1: Add `sizeGroup` field to Prisma schema + migration

**Files:**
- Modify: `backend/prisma/schema.prisma:35-54`

- [ ] **Step 1: Add `sizeGroup` field to Product model**

```prisma
model Product {
  // ... all existing fields ...
  sizeGroup  String?
}
```

Insert between `stock` and `imageUrl`:

```prisma
  sizeGroup   String?
```

- [ ] **Step 2: Generate migration**

Run:
```bash
npx prisma migrate dev --name add_size_group_to_product
```

Expected: Migration created and applied. `npx prisma generate` runs automatically.

- [ ] **Step 3: Verify schema regenerated**

Run: `npx prisma generate`
Expected: Prisma client regenerated with `sizeGroup` available on Product.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/
git commit -m "feat: add sizeGroup field to Product model"
```

---

### Task 2: Enrich product detail API with variants

**Files:**
- Modify: `backend/src/controllers/productController.ts:104-125`

- [ ] **Step 1: Update `getProductBySlug` to fetch variants**

Replace the existing `getProductBySlug` function:

```typescript
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params['slug'] as string },
      include: {
        category: true,
        brand: true,
      },
    })
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    let variants: VariantItem[] | undefined
    if (product.sizeGroup) {
      const siblings = await prisma.product.findMany({
        where: { sizeGroup: product.sizeGroup, isActive: true },
        select: { id: true, name: true, slug: true, price: true, salePrice: true, stock: true, imageUrl: true },
        orderBy: { name: 'asc' },
      })

      const sizeLabelRegex = /(\d+(?:\.\d+)?)\s*kg/i
      variants = siblings
        .map((s) => ({
          ...s,
          sizeLabel: s.name.match(sizeLabelRegex)?.[0]?.toLowerCase() ?? s.name,
        }))
        .sort((a, b) => {
          const aNum = parseFloat(a.sizeLabel)
          const bNum = parseFloat(b.sizeLabel)
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
          return a.sizeLabel.localeCompare(b.sizeLabel)
        })
    }

    res.json({ ...product, variants })
  } catch (error) {
    next(error)
  }
}
```

Add the `VariantItem` type at the top of the file (after imports):

```typescript
interface VariantItem {
  id: number
  name: string
  slug: string
  price: number
  salePrice: number | null
  stock: number
  imageUrl: string | null
  sizeLabel: string
}
```

- [ ] **Step 2: Verify the endpoint still works with existing products**

Run: `npx ts-node-dev --respawn src/app.ts` and hit:
```bash
curl http://localhost:3001/api/products/perro-accesorios-algun-slug
```
Expected: Returns product without `variants` field (no sizeGroup set). Also test with a product that has `sizeGroup` set manually in the DB.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/productController.ts
git commit -m "feat: enrich product detail API with size variants"
```

---

### Task 3: Add `ProductVariant` type to frontend

**Files:**
- Modify: `frontend/src/types/index.ts:34-52`

- [ ] **Step 1: Add `ProductVariant` interface and update `ProductType`**

Add after the `BrandType` interface:

```typescript
export interface ProductVariant {
  id: number
  name: string
  slug: string
  price: number
  salePrice?: number
  stock: number
  imageUrl?: string
  sizeLabel: string
}
```

Add `sizeGroup` and `variants` to `ProductType`:

```typescript
export interface ProductType {
  // ... all existing fields ...
  sizeGroup?: string
  variants?: ProductVariant[]
}
```

Insert `sizeGroup` after `isFeatured`, and `variants` after `updatedAt`.

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add ProductVariant type to frontend"
```

---

### Task 4: Create SizeSelector component

**Files:**
- Create: `frontend/src/components/product/SizeSelector.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { ProductVariant } from '@/types'

interface SizeSelectorProps {
  variants: ProductVariant[]
  currentSlug: string
}

export default function SizeSelector({ variants, currentSlug }: SizeSelectorProps) {
  if (variants.length <= 1) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8892a4] mb-3">
        Tamaño
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.slug === currentSlug
          const outOfStock = v.stock === 0

          return (
            <Link
              key={v.id}
              to={`/producto/${v.slug}`}
              className={`relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all w-[88px] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-700'
              } ${outOfStock ? 'opacity-45' : ''}`}
            >
              {v.imageUrl ? (
                <img
                  src={v.imageUrl}
                  alt={v.sizeLabel}
                  className="w-12 h-12 object-contain rounded-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 dark:bg-[#222222] rounded-md" />
              )}
              <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-[#e8eaf0]'}`}>
                {v.sizeLabel}
              </span>
              <span className={`text-[11px] ${isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-[#8892a4]'}`}>
                {outOfStock ? 'Sin stock' : `$${v.price.toLocaleString('es-CL')}`}
              </span>
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/product/SizeSelector.tsx
git commit -m "feat: create SizeSelector component with image cards"
```

---

### Task 5: Integrate SizeSelector into ProductPage

**Files:**
- Modify: `frontend/src/pages/ProductPage.tsx`

- [ ] **Step 1: Add import**

Add after the existing imports (around line 11):

```typescript
import SizeSelector from '@/components/product/SizeSelector'
```

- [ ] **Step 2: Render SizeSelector between price and description**

After the price block (the `isOnSale` display, around line 167) and before the badges block (line 170), insert:

```typescript
          {product.variants && product.variants.length > 1 && (
            <SizeSelector variants={product.variants} currentSlug={product.slug} />
          )}
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```
Expected: No errors.

- [ ] **Step 4: Test manually**

Run `npm run dev` and navigate to a food product page. Expected: See size selector with cards. Clicking a different size navigates to that product's URL.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ProductPage.tsx
git commit -m "feat: integrate SizeSelector into ProductPage"
```

---

### Task 6: Handle `sizeGroup` in admin backend

**Files:**
- Modify: `backend/src/controllers/adminProductController.ts`

- [ ] **Step 1: Add `sizeGroup` to `updateProduct` destructuring + update**

In the `updateProduct` function (around line 119), add `sizeGroup` to the destructuring:

```typescript
const { name, slug, description, price, salePrice, stock, imageUrl, images, isActive, isFeatured, categoryId, brandId, sizeGroup } =
  req.body as Record<string, unknown>
```

Add to the data object (around line 136, after brandId):

```typescript
...(sizeGroup !== undefined && { sizeGroup: sizeGroup !== null ? String(sizeGroup) : null }),
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/adminProductController.ts
git commit -m "feat: handle sizeGroup in admin product update"
```

---

### Task 7: Add `sizeGroup` field to admin product form

**Files:**
- Modify: `frontend/src/pages/admin/AdminProducts.tsx`

- [ ] **Step 1: Add `sizeGroup` to the form schema**

In `productSchema` (line 33-51), add after `isFeatured`:

```typescript
  sizeGroup: z.string().optional(),
```

- [ ] **Step 2: Add `sizeGroup` to `ProductFormValues`**

TypeScript infers from Zod schema, so no explicit type change needed.

- [ ] **Step 3: Add `sizeGroup` default value in `defaultValues`**

In the `useForm` call (line 82), add after `isFeatured`:

```typescript
          sizeGroup: product.sizeGroup ?? '',
```

- [ ] **Step 4: Add `sizeGroup` field to the form UI**

Insert before the Category field (before line 163), after the image URL block:

```tsx
          {/* Size Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e8eaf0] mb-1">Grupo de tamaños</label>
            <input {...register('sizeGroup')} placeholder="ej: royal-canin-adult-maxi" className={inputClass} />
            <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-1">Productos con el mismo valor se agrupan como variantes de tamaño</p>
          </div>
```

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/AdminProducts.tsx
git commit -m "feat: add sizeGroup field to admin product form"
```

---

### Task 8: Install Playwright in backend

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install Playwright**

```bash
cd backend && npm install -D playwright
```

- [ ] **Step 2: Install Chromium browser for Playwright**

```bash
npx playwright install chromium
```

Expected: Chromium browser installed in `~/.cache/ms-playwright/`.

- [ ] **Step 3: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore: add playwright dev dependency"
```

---

### Task 9: Create scraping bootstrap script

**Files:**
- Create: `backend/prisma/seed-size-groups.ts`

- [ ] **Step 1: Write the scraping script**

```typescript
import { PrismaClient } from '@prisma/client'
import { chromium } from 'playwright'
import path from 'path'

const prisma = new PrismaClient()

// SuperZoo search base URL
const SUPERZOO_SEARCH = 'https://www.superzoo.cl/perro/'

// Size patterns to detect in SuperZoo product names
const SIZE_REGEX = /(\d+(?:\.\d+)?)\s*kg/i

async function extractSizesFromSuperZoo(productName: string): Promise<{ label: string; price: number; imageUrl?: string }[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Search SuperZoo for the product base name
    const searchName = productName.replace(SIZE_REGEX, '').trim()
    await page.goto(`${SUPERZOO_SEARCH}?q=${encodeURIComponent(searchName)}`, { waitUntil: 'networkidle' })

    // Wait for product grid to render
    await page.waitForSelector('.product-grid, [data-product-id], .product-tile', { timeout: 10000 }).catch(() => {})

    // Extract product tiles with size info
    const sizes = await page.evaluate(() => {
      const tiles = document.querySelectorAll('.product-tile, [data-product-id]')
      return Array.from(tiles).slice(0, 10).map(tile => {
        const name = tile.querySelector('.product-name, .pdp-link a, .product-brand')?.textContent?.trim() ?? ''
        const priceText = tile.querySelector('.price .sales .value, .price .sales')?.textContent?.trim() ?? ''
        const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'))
        const imageUrl = (tile.querySelector('img') as HTMLImageElement)?.src ?? undefined
        return { name, price: isNaN(price) ? 0 : price, imageUrl }
      }).filter(p => p.name && p.price > 0)
    })

    // Filter products that match a size pattern
    return sizes
      .filter(s => SIZE_REGEX.test(s.name))
      .map(s => ({
        label: s.name.match(SIZE_REGEX)![0].toLowerCase(),
        price: s.price,
        imageUrl: s.imageUrl,
      }))
  } finally {
    await browser.close()
  }
}

function computeSizeGroupSlug(productName: string): string {
  const base = productName.replace(SIZE_REGEX, '').trim()
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('🌱 Seeding size groups from SuperZoo...')

  // Get all food products
  const foodCategories = await prisma.category.findMany({
    where: { slug: { in: ['perro-alimentos', 'gato-alimentos'] } },
    select: { id: true, slug: true },
  })
  const categoryIds = foodCategories.map(c => c.id)

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: categoryIds } },
    select: { id: true, name: true, slug: true, price: true, imageUrl: true, categoryId: true, brandId: true },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${products.length} food products`)

  // Group products that share the same base name
  const groups = new Map<string, typeof products>()
  for (const product of products) {
    const baseName = product.name.replace(SIZE_REGEX, '').trim()
    const key = baseName.toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(product)
  }

  let assignedCount = 0

  for (const [baseName, groupProducts] of groups) {
    // Skip products without a size in name (probably treats, accessories, etc.)
    const hasSize = groupProducts.some(p => SIZE_REGEX.test(p.name))
    if (!hasSize) continue

    const sizeGroupSlug = computeSizeGroupSlug(baseName)

    // Try to find additional sizes from SuperZoo
    const representativeName = groupProducts[0].name
    const superZooSizes = await extractSizesFromSuperZoo(representativeName)

    // Collect all unique size labels (from DB + SuperZoo)
    const existingLabels = new Set(groupProducts.map(p => p.name.match(SIZE_REGEX)?.[0]?.toLowerCase()).filter(Boolean))
    const missingSizes = superZooSizes.filter(s => !existingLabels.has(s.label))

    console.log(`\n${baseName}:`)
    console.log(`  DB sizes: ${Array.from(existingLabels).join(', ') || 'none'}`)
    if (missingSizes.length > 0) {
      console.log(`  SuperZoo additions: ${missingSizes.map(s => `${s.label} ($${s.price})`).join(', ')}`)
    }

    // Assign sizeGroup to existing products
    for (const product of groupProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: { sizeGroup: sizeGroupSlug },
      })
      assignedCount++
    }

    // Create missing products for sizes found on SuperZoo
    for (const size of missingSizes) {
      const newName = `${baseName} ${size.label.toUpperCase()}`
      const newSlug = `${computeSizeGroupSlug(baseName)}-${size.label.replace(/\s+/g, '')}`
      const existing = await prisma.product.findUnique({ where: { slug: newSlug } })
      if (existing) {
        // Already exists — just update sizeGroup
        await prisma.product.update({
          where: { id: existing.id },
          data: { sizeGroup: sizeGroupSlug },
        })
        assignedCount++
        continue
      }

      await prisma.product.create({
        data: {
          name: newName,
          slug: newSlug,
          price: size.price,
          stock: 0, // stock unknown from scraping; admin can set manually
          imageUrl: size.imageUrl ?? groupProducts[0]?.imageUrl ?? null,
          categoryId: groupProducts[0].categoryId,
          brandId: groupProducts[0].brandId ?? null,
          isActive: true,
          sizeGroup: sizeGroupSlug,
        },
      })
      assignedCount++
      console.log(`  Created: ${newName} (${newSlug})`)
    }

    // Be respectful to SuperZoo — small delay between requests
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\n✅ Done! ${assignedCount} products assigned to size groups.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run the script**

```bash
npx ts-node prisma/seed-size-groups.ts
```

Expected: Script runs, scrapes SuperZoo, updates existing products with `sizeGroup`, creates new products for missing sizes. Output shows progress per product group.

- [ ] **Step 3: Verify results**

Check a few products in the DB have `sizeGroup` set:
```bash
npx prisma studio
```
Or query directly:
```bash
curl http://localhost:3001/api/products | jq '.products[] | select(.sizeGroup != null) | {name, sizeGroup}'
```

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed-size-groups.ts
git commit -m "feat: add SuperZoo scraping script for size variant groups"
```

---

## Verification

Once all tasks are complete:

1. **Frontend type-check:** `cd frontend && npm run type-check` — must pass
2. **Backend type-check:** `cd backend && npm run type-check` — must pass  
3. **Frontend lint:** `cd frontend && npm run lint` — must pass
4. **Backend lint:** `cd backend && npm run lint` — must pass
5. **Manual test:** Open a food product with size variants — should display 2+ image cards in the selector
6. **Admin test:** Open admin > products > edit a food product — should see "Grupo de tamaños" field
