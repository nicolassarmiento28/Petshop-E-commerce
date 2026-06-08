import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WeightVariant {
  weight: string
  normalPrice: number | null
  salePrice: number | null
}

interface ScrapedData {
  productBaseName: string
  baseUrl: string
  listingPrice: number
  imageUrl: string
  category: string
  variants: WeightVariant[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeWeight(weight: string): string {
  if (!weight) return ''
  let w = weight.toUpperCase().trim()
  w = w.replace(/(\d)\.(\d)/g, '$1,$2')
  w = w.replace(/\s*\(FECHA CORTA[^)]*\)/g, '').trim()
  return w
}

function deduplicateData(data: ScrapedData[]): ScrapedData[] {
  const groups = new Map<string, ScrapedData[]>()
  for (const entry of data) {
    const existing = groups.get(entry.productBaseName) || []
    existing.push(entry)
    groups.set(entry.productBaseName, existing)
  }

  const result: ScrapedData[] = []
  for (const [name, entries] of groups) {
    const mergedVariants = new Map<string, WeightVariant>()
    for (const entry of entries) {
      for (const v of entry.variants) {
        const key = normalizeWeight(v.weight)
        if (mergedVariants.has(key)) {
          const existing = mergedVariants.get(key)!
          if (v.salePrice && !existing.salePrice) {
            mergedVariants.set(key, v)
          }
        } else {
          mergedVariants.set(key, v)
        }
      }
    }

    const variantList = [...mergedVariants.values()]
    const bestEntry = entries.reduce((best, e) =>
      e.variants.length >= best.variants.length ? e : best
    )

    result.push({
      ...bestEntry,
      variants: variantList,
    })
  }

  console.log(`📦 Dedup: ${data.length} → ${result.length} unique products`)
  return result
}

function extractBrand(name: string): string | null {
  const knownBrands = [
    { name: 'Royal Canin', test: /^royal canin/i },
    { name: "Hill's", test: /^hill'?s/i },
    { name: 'Advance', test: /^advance/i },
    { name: 'Acana', test: /^acana/i },
    { name: 'Bravery', test: /^bravery/i },
    { name: 'Brit Care', test: /^brit care/i },
    { name: 'Taste of the Wild', test: /^taste of the wild/i },
    { name: 'Vetlife', test: /^vetlife/i },
    { name: 'Eukanuba', test: /^eukanuba/i },
    { name: 'Pedigree', test: /^pedigree/i },
    { name: 'Purina Pro Plan', test: /^pro ?plan/i },
    { name: 'Dogxtreme', test: /^dogxtreme/i },
    { name: 'Nath', test: /^nath/i },
    { name: 'Fit Formula', test: /^fit ?formula/i },
    { name: 'Salvaje', test: /^salvaje/i },
    { name: 'True Origins', test: /^true origins/i },
    { name: 'Wellness Core', test: /^wellness core/i },
    { name: 'Natural & Delicious', test: /^n&d/i },
    { name: 'Belcando', test: /^belcando/i },
    { name: 'Orijen', test: /^orijen/i },
    { name: 'Leonardo', test: /^leonardo/i },
    { name: 'Catxtreme', test: /^catxtreme/i },
    { name: 'Fellini', test: /^fellini/i },
    { name: 'Virbac', test: /^virbac/i },
    { name: 'Dogzilla', test: /^dogzilla/i },
    { name: 'Catzilla', test: /^catzilla/i },
    { name: 'Amity', test: /^amity/i },
    { name: 'Wankun', test: /^wankun/i },
    { name: 'Bil Jac', test: /^bil jac/i },
    { name: 'Monge', test: /^monge/i },
    { name: 'Balanced', test: /^balanced/i },
    { name: 'HPM', test: /^hpm/i },
    { name: 'Nomade', test: /nomade/i },
    { name: 'Purina', test: /^alimento seco (para perros|para gatos) purina/i },
    { name: 'Champion', test: /^champion/i },
  ]
  for (const brand of knownBrands) {
    if (brand.test.test(name)) return brand.name
  }
  return null
}

async function main() {
  console.log('🌱 Seeding dry food products into database...\n')

  // Read and deduplicate scraped data
  const rawData: ScrapedData[] = require('../../scraper/output/data/dryfood-products.json')
  const data = deduplicateData(rawData)

  // Map categories
  const categoryMap: Record<string, number> = {
    'perro-alimento-seco': 7,
    'gato-alimento-seco': 12,
  }

  // Get all brands for matching
  const brands = await prisma.brand.findMany()
  const brandMap = new Map<string, number>()
  for (const b of brands) {
    brandMap.set(b.name.toLowerCase(), b.id)
    brandMap.set(slugify(b.name.toLowerCase()), b.id)
    brandMap.set(b.slug.toLowerCase(), b.id)
  }

  // Delete existing products in these categories
  const catIds = Object.values(categoryMap)
  const prodIds = (await prisma.product.findMany({ where: { categoryId: { in: catIds } }, select: { id: true } })).map(p => p.id)
  if (prodIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { productId: { in: prodIds } } })
    await prisma.product.deleteMany({ where: { id: { in: prodIds } } })
  }
  console.log(`🗑️ Deleted ${prodIds.length} existing products\n`)

  const usedSlugs = new Set<string>()
  const productsToCreate: any[] = []

  for (const product of data) {
    const baseSlug = slugify(product.productBaseName)
    const brandName = extractBrand(product.productBaseName)
    const brandId = brandName ? (brandMap.get(brandName.toLowerCase()) || brandMap.get(slugify(brandName))) : null

    if (brandName && !brandId) {
      console.log(`  ⚠️  Brand '${brandName}' not found in DB for: ${product.productBaseName.substring(0, 50)}`)
    }

    const categoryId = categoryMap[product.category]
    if (!categoryId) {
      console.log(`  ⚠️  Unknown category: ${product.category} for ${product.productBaseName}`)
      continue
    }

    for (const variant of product.variants) {
      const weight = normalizeWeight(variant.weight)
      let suffix = weight ? `-${slugify(weight)}` : ''
      let slug = `${baseSlug}${suffix}`
      let counter = 0
      while (usedSlugs.has(slug)) {
        counter++
        slug = `${baseSlug}${suffix}-${counter}`
      }
      usedSlugs.add(slug)

      const normalPrice = variant.normalPrice ?? product.listingPrice
      const salePrice = variant.salePrice ?? null

      productsToCreate.push({
        name: product.productBaseName,
        slug,
        description: '',
        price: normalPrice,
        salePrice: salePrice,
        stock: 50,
        sizeGroup: baseSlug,
        imageUrl: product.imageUrl || '',
        images: [],
        isActive: true,
        isFeatured: false,
        categoryId,
        brandId: brandId ?? undefined,
      })
    }
  }

  const BATCH_SIZE = 100
  for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
    const batch = productsToCreate.slice(i, i + BATCH_SIZE)
    await prisma.product.createMany({ data: batch })
  }

  const noBrand = data.filter(p => !extractBrand(p.productBaseName)).length
  console.log(`\n✅ Done! Created: ${productsToCreate.length}`)
  console.log(`📊 Total dry food products now: ${await prisma.product.count({ where: { categoryId: { in: catIds }, isActive: true } })}`)
  console.log(`🏷️  Products without brand match: ${noBrand}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
