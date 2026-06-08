import { PrismaClient } from '@prisma/client'
import { chromium } from 'playwright'

const prisma = new PrismaClient()

const SIZE_REGEX = /(\d+(?:\.\d+)?)\s*kg/i

function computeSizeGroupSlug(productName: string): string {
  const base = productName.replace(SIZE_REGEX, '').trim()
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function extractSizesFromSuperZoo(
  searchTerm: string,
  categorySlug: string,
): Promise<{ label: string; price: number; imageUrl?: string }[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const searchUrl = `https://www.superzoo.cl/${categorySlug}/?q=${encodeURIComponent(searchTerm)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 })

    await page.waitForSelector('[class*="product"]', { timeout: 15000 }).catch(() => {})

    const sizes = await page.evaluate(() => {
      const tiles = document.querySelectorAll('[class*="product-tile"], [class*="grid-tile"], [data-productid], [class*="product-grid"] > div')
      return Array.from(tiles).slice(0, 15).map(tile => {
        const nameEl = tile.querySelector('[class*="product-name"], .pdp-link a, [class*="name"]')
        const name = nameEl?.textContent?.trim() ?? ''
        const priceEl = tile.querySelector('[class*="price"] [class*="sales"], [class*="price"] .value, [class*="sales-price"]')
        const priceText = priceEl?.textContent?.trim() ?? ''
        const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'))
        const imgEl = tile.querySelector('img')
        const imageUrl = imgEl ? (imgEl as HTMLImageElement).src : undefined
        return { name, price: isNaN(price) ? 0 : price, imageUrl }
      }).filter(p => p.name && p.price > 0)
    })

    return sizes
      .filter(s => SIZE_REGEX.test(s.name))
      .map(s => ({
        label: s.name.match(SIZE_REGEX)![0].toLowerCase(),
        price: s.price,
        imageUrl: s.imageUrl,
      }))
      .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i)
  } finally {
    await browser.close()
  }
}

async function main() {
  console.log('🌱 Seeding size groups from SuperZoo...')

  const foodCategories = await prisma.category.findMany({
    where: { slug: { in: ['perro-alimentos', 'gato-alimentos'] } },
    select: { id: true, slug: true },
  })

  if (foodCategories.length === 0) {
    console.log('⚠️  No food categories found. Skipping.')
    return
  }

  const categoryIds = foodCategories.map(c => c.id)
  const categoryMap = Object.fromEntries(foodCategories.map(c => [c.id, c.slug]))

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: categoryIds } },
    select: { id: true, name: true, slug: true, price: true, imageUrl: true, categoryId: true, brandId: true },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${products.length} food products`)

  const groups = new Map<string, typeof products>()
  for (const product of products) {
    const baseName = product.name.replace(SIZE_REGEX, '').trim()
    const key = baseName.toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(product)
  }

  console.log(`Found ${groups.size} unique product groups`)
  let assignedCount = 0

  for (const [baseName, groupProducts] of groups) {
    const hasSize = groupProducts.some(p => SIZE_REGEX.test(p.name))
    if (!hasSize) {
      console.log(`  Skipping "${baseName}" — no size in name`)
      continue
    }

    const sizeGroupSlug = computeSizeGroupSlug(baseName)
    const representative = groupProducts[0]
    const categorySlug = categoryMap[representative.categoryId] || 'perro'

    const existingLabels = new Set(
      groupProducts.map(p => p.name.match(SIZE_REGEX)?.[0]?.toLowerCase()).filter(Boolean),
    )

    console.log(`\n📦 "${baseName}"`)
    console.log(`  DB sizes: ${Array.from(existingLabels).join(', ') || 'none'}`)

    for (const product of groupProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: { sizeGroup: sizeGroupSlug },
      })
      assignedCount++
    }

    try {
      const superZooSizes = await extractSizesFromSuperZoo(baseName, categorySlug)
      const missingSizes = superZooSizes.filter(s => !existingLabels.has(s.label))

      if (missingSizes.length > 0) {
        console.log(`  SuperZoo additions: ${missingSizes.map(s => `${s.label} ($${s.price})`).join(', ')}`)
      }

      for (const size of missingSizes) {
        const newName = `${baseName} ${size.label.toUpperCase()}`
        const newSlug = `${computeSizeGroupSlug(baseName)}-${size.label.replace(/\s+/g, '')}`

        const existing = await prisma.product.findUnique({ where: { slug: newSlug } })
        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: { sizeGroup: sizeGroupSlug },
          })
          console.log(`  Updated existing: ${newName}`)
          assignedCount++
          continue
        }

        await prisma.product.create({
          data: {
            name: newName,
            slug: newSlug,
            price: size.price,
            stock: 0,
            imageUrl: size.imageUrl ?? groupProducts[0]?.imageUrl ?? null,
            categoryId: groupProducts[0].categoryId,
            brandId: groupProducts[0].brandId ?? null,
            isActive: true,
            sizeGroup: sizeGroupSlug,
          },
        })
        console.log(`  Created: ${newName}`)
        assignedCount++
      }
    } catch (err) {
      console.log(`  ⚠️  SuperZoo scraping failed: ${err instanceof Error ? err.message : err}`)
      console.log(`  (Products still got sizeGroup from DB siblings)`)
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\n✅ Done! ${assignedCount} products assigned to size groups.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
