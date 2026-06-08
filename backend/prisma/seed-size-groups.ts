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

async function fetchCategoryProducts(categoryUrl: string): Promise<{ name: string; price: number; imageUrl: string }[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(categoryUrl, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForSelector('div.product', { timeout: 15000 }).catch(() => {})

  const products = await page.evaluate(() => {
    const tiles = document.querySelectorAll('div.product')
    return Array.from(tiles).map(tile => {
      const nameEl = tile.querySelector('.product-name, .pdp-link a')
      const name = nameEl?.textContent?.trim() ?? ''

      const priceEl = tile.querySelector('.sales .value, .price .sales')
      const priceText = priceEl?.textContent?.trim() ?? ''
      const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'))

      const imgEl = tile.querySelector('.tile-image')
      const imgSrc = imgEl?.getAttribute('src') ?? ''

      return { name, price: isNaN(price) ? 0 : price, imageUrl: imgSrc.startsWith('/') ? `https://www.superzoo.cl${imgSrc}` : imgSrc }
    }).filter(p => p.name && p.price > 0)
  })

  await browser.close()
  return products
}

async function extractSizesFromSuperZoo(
  searchTerm: string,
  _categorySlug: string,
): Promise<{ label: string; price: number; imageUrl?: string }[]> {
  try {
    const baseName = searchTerm.toLowerCase().trim()
    const categoryUrls = [
      'https://www.superzoo.cl/perro/alimentos/alimentos-seco/',
      'https://www.superzoo.cl/gato/alimentos/',
    ]

    const allMatches: { name: string; price: number; imageUrl: string }[] = []
    for (const url of categoryUrls) {
      const products = await fetchCategoryProducts(url)
      allMatches.push(...products)
    }

    // Find products whose name starts with or contains the base search term
    const matchedProducts = allMatches.filter(p => {
      const lower = p.name.toLowerCase()
      return lower.includes(baseName) || baseName.includes(lower) ||
        lower.split(' ').some((w: string) => w.length > 3 && baseName.includes(w))
    })

    // Only return those with a size label
    return matchedProducts
      .filter(p => SIZE_REGEX.test(p.name))
      .map(p => ({
        label: p.name.match(SIZE_REGEX)![0].toLowerCase(),
        price: p.price,
        imageUrl: p.imageUrl,
      }))
      .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i)
  } catch (err) {
    console.log(`  ⚠️  SuperZoo scraping failed: ${err instanceof Error ? err.message : err}`)
    return []
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
