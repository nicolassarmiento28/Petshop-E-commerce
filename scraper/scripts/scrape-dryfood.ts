import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs-extra'

const BASE_URL = 'https://www.superzoo.cl'
const OUTPUT_DIR = path.join(__dirname, '../output')
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'data', 'dryfood-progress.json')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'data', 'dryfood-products.json')

const CATEGORIES = [
  { name: 'perro-alimento-seco', url: '/perro/alimentos/alimentos-seco' },
  { name: 'gato-alimento-seco', url: '/gato/alimentos/alimento-seco' },
]

interface ListingProduct {
  name: string
  url: string
  listingPrice: number
  imageUrl: string
  category: string
  productId: string
}

interface WeightVariant {
  weight: string
  normalPrice: number | null
  salePrice: number | null
}

interface ProductDetail {
  productBaseName: string
  baseUrl: string
  listingPrice: number
  imageUrl: string
  category: string
  variants: WeightVariant[]
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractProductId(url: string): string {
  const match = url.match(/\/(\d+(?:_m)?)\.html/)
  return match ? match[1] : url
}

async function collectProductUrls(page: any, categoryUrl: string, categoryName: string, maxPages = 30): Promise<ListingProduct[]> {
  const products: ListingProduct[] = []
  const seenUrls = new Set<string>()

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const url = pageNum === 1
      ? `${BASE_URL}${categoryUrl}`
      : `${BASE_URL}${categoryUrl}?start=${(pageNum - 1) * 12}&sz=12`

    console.log(`  📄 Page ${pageNum}`)

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await sleep(2000)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await sleep(1500)

      const items = await page.evaluate(() => {
        const results: any[] = []
        const tiles = document.querySelectorAll('[class*="product-tile"], [class*="product_tile"]')
        tiles.forEach((tile) => {
          try {
            const nameEl = tile.querySelector('.pdp-link a, [class*="product-name"] a, h2 a, h3 a')
            const priceEl = tile.querySelector('.price .value, [class*="sales"] .value, [itemprop="price"]')
            const imageEl = tile.querySelector('img') as HTMLImageElement
            const linkEl = (nameEl || tile.querySelector('a[href*="/perro/alimentos/"], a[href*="/gato/alimentos/"]')) as HTMLAnchorElement
            if (nameEl && imageEl && linkEl?.href) {
              const price = priceEl?.getAttribute('content') || priceEl?.textContent || '0'
              results.push({
                name: (nameEl.textContent || '').trim(),
                price: price.replace(/[^0-9]/g, ''),
                imageUrl: imageEl.src || imageEl.dataset.src || '',
                url: linkEl.href,
              })
            }
          } catch { }
        })
        return results
      })

      if (items.length === 0) break

      let newCount = 0
      for (const item of items) {
        if (!item.name || !item.url || seenUrls.has(item.url)) continue
        seenUrls.add(item.url)
        products.push({
          name: item.name,
          url: item.url,
          listingPrice: parseInt(item.price) || 0,
          imageUrl: item.imageUrl,
          category: categoryName,
          productId: extractProductId(item.url),
        })
        newCount++
      }

      console.log(`  ✅ ${newCount} new (total: ${products.length})`)
      if (items.length < 12) break
      await sleep(1000)
    } catch (error) {
      console.log(`  ❌ Error page ${pageNum}: ${error}`)
      break
    }
  }

  return products
}

async function extractVariants(page: any, product: ListingProduct): Promise<ProductDetail | null> {
  try {
    await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await sleep(2500)

    const variants = await page.evaluate(() => {
      const results: any[] = []
      const groups = document.querySelectorAll('.radio-product-variant .custom-radio-group')
      groups.forEach((g) => {
        try {
          const radio = g.querySelector('input[type="radio"]') as HTMLInputElement
          if (!radio) return
          const weight = radio.getAttribute('data-attr-value') || ''

          let normalPrice: string | null = null
          let salePrice: string | null = null

          const strikeEl = g.querySelector('.list.strike-through, .strike-through')
          const salesEl = g.querySelector('.sales')

          if (strikeEl) normalPrice = (strikeEl.textContent || '').trim().replace(/[^0-9]/g, '')
          if (salesEl) salePrice = (salesEl.textContent || '').trim().replace(/[^0-9]/g, '')

          if (!strikeEl && salesEl) {
            normalPrice = salePrice
            salePrice = null
          }

          results.push({
            weight: weight.trim(),
            normalPrice: normalPrice ? parseInt(normalPrice, 10) : null,
            salePrice: salePrice ? parseInt(salePrice, 10) : null,
          })
        } catch { }
      })
      return results
    })

    if (variants.length === 0) {
      variants.push({ weight: '', normalPrice: product.listingPrice || null, salePrice: null })
    }

    return {
      productBaseName: product.name,
      baseUrl: product.url,
      listingPrice: product.listingPrice,
      imageUrl: product.imageUrl,
      category: product.category,
      variants,
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error}`)
    return null
  }
}

async function main() {
  console.log('🚀 Scraping dry food products from SuperZoo\n')

  let allDetails: ProductDetail[] = []
  let processedUrls = new Set<string>()
  if (await fs.pathExists(PROGRESS_FILE)) {
    try {
      const saved = await fs.readJSON(PROGRESS_FILE)
      allDetails = saved.details || []
      processedUrls = new Set(saved.processedUrls || [])
      console.log(`📦 Resuming: ${allDetails.length} products done\n`)
    } catch { }
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' })
  const page = await context.newPage()

  for (const category of CATEGORIES) {
    console.log(`\n📦 ${category.name}`)
    console.log(`   Collecting URLs...`)

    const listingProducts = await collectProductUrls(page, category.url, category.name)
    console.log(`   ${listingProducts.length} unique products`)

    const toScrape = listingProducts.filter(p => !processedUrls.has(p.url))
    if (toScrape.length === 0) { console.log('   ✅ All done\n'); continue }
    console.log(`   Scraping ${toScrape.length} products\n`)

    for (let i = 0; i < toScrape.length; i++) {
      const prod = toScrape[i]
      const detail = await extractVariants(page, prod)

      if (detail) {
        allDetails.push(detail)
        processedUrls.add(prod.url)
        const vNames = detail.variants.map(v => v.weight || 'default').join(', ')
        console.log(`   [${i + 1}/${toScrape.length}] ✅ ${detail.variants.length}v: ${vNames}`)
      } else {
        console.log(`   [${i + 1}/${toScrape.length}] ❌ ${prod.name.substring(0, 40)}`)
      }

      if ((i + 1) % 20 === 0 || i === toScrape.length - 1) {
        await fs.ensureDir(path.dirname(PROGRESS_FILE))
        await fs.writeJSON(PROGRESS_FILE, { details: allDetails, processedUrls: [...processedUrls] }, { spaces: 2 })
      }

      await sleep(1500)
    }
  }

  await browser.close()

  await fs.ensureDir(path.dirname(OUTPUT_FILE))
  await fs.writeJSON(OUTPUT_FILE, allDetails, { spaces: 2 })
  await fs.remove(PROGRESS_FILE)

  let totalVariants = 0
  const variantCounts: Record<string, number> = {}
  for (const d of allDetails) {
    totalVariants += d.variants.length
    for (const v of d.variants) {
      const key = v.weight || 'N/A'
      variantCounts[key] = (variantCounts[key] || 0) + 1
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Products: ${allDetails.length}, Variants: ${totalVariants}`)
  console.log('📁 Weights:')
  Object.entries(variantCounts).sort((a, b) => b[1] - a[1]).forEach(([w, c]) => console.log(`   ${w}: ${c}`))
  console.log(`\n💾 ${OUTPUT_FILE}`)
}

main().catch(console.error)
