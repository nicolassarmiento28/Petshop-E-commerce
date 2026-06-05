import { chromium } from 'playwright'
import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'

// ── Configuración ─────────────────────────────────────────────
const BASE_URL = 'https://www.superzoo.cl'
const OUTPUT_DIR = path.join(__dirname, '../output')
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images')
const DATA_DIR = path.join(OUTPUT_DIR, 'data')

const CATEGORIES = [
  { name: 'perro', slug: 'perro', urls: [
    '/perro/alimentos',
    '/perro/accesorios',
    '/perro/juguetes',
  ]},
  { name: 'gato', slug: 'gato', urls: [
    '/gato/alimentos',
    '/gato/accesorios',
  ]},
  { name: 'farmacia', slug: 'farmacia', urls: [
    '/farmacia',
  ]},
  { name: 'pequenas-mascotas', slug: 'pequenas-mascotas', urls: [
    '/pequenas-mascotas',
  ]},
]

// ── Tipos ─────────────────────────────────────────────────────
interface Product {
  name: string
  price: number
  description: string
  category: string
  imageUrl: string
  localImage: string
  brand: string
  slug: string
}

// ── Helpers ───────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function downloadImage(url: string, dest: string): Promise<void> {
  try {
    const response = await axios({ url, responseType: 'stream', timeout: 10000 })
    await fs.ensureDir(path.dirname(dest))
    const writer = fs.createWriteStream(dest)
    response.data.pipe(writer)
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  } catch (error) {
    console.log(`  ⚠️  No se pudo descargar: ${url}`)
  }
}

// ── Scraper principal ─────────────────────────────────────────
async function scrapeCategory(
  page: any,
  categoryName: string,
  categoryUrl: string
): Promise<Product[]> {
  const products: Product[] = []

  console.log(`\n📦 Scrapeando: ${BASE_URL}${categoryUrl}`)

  try {
    await page.goto(`${BASE_URL}${categoryUrl}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Espera que carguen los productos
    await page.waitForTimeout(3000)

    // Scroll para cargar lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    await page.waitForTimeout(2000)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(2000)

    // Extrae los productos del HTML
    const items = await page.evaluate(() => {
      const results: any[] = []

      // Selectores comunes en Salesforce Commerce Cloud
      const productTiles = document.querySelectorAll(
        '.product-tile, .b-product_tile, [class*="product-tile"], [class*="product_tile"]'
      )

      productTiles.forEach((tile: Element) => {
        try {
          const nameEl = tile.querySelector(
            '.pdp-link a, .b-product_tile-name, [class*="product-name"], h2 a, h3 a'
          )
          const priceEl = tile.querySelector(
            '.price .value, .b-price, [class*="sales"] .value, [itemprop="price"]'
          )
          const imageEl = tile.querySelector('img') as HTMLImageElement
          const linkEl = tile.querySelector('a') as HTMLAnchorElement

          if (nameEl && imageEl) {
            const price = priceEl
              ? priceEl.getAttribute('content') || priceEl.textContent || '0'
              : '0'

            results.push({
              name: nameEl.textContent?.trim() || '',
              price: price.replace(/[^0-9]/g, ''),
              imageUrl: imageEl.src || imageEl.dataset.src || '',
              link: linkEl?.href || '',
            })
          }
        } catch (e) {}
      })

      return results
    })

    console.log(`  ✅ Encontrados: ${items.length} productos`)

    // Procesa cada producto
    for (const item of items) {
      if (!item.name || !item.imageUrl) continue

      const slug = slugify(item.name)
      const imageExt = item.imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
      const imageName = `${slug}.${imageExt}`
      const localImagePath = path.join(IMAGES_DIR, categoryName, imageName)
      const relativeImagePath = `output/images/${categoryName}/${imageName}`

      // Descarga la imagen
      if (item.imageUrl.startsWith('http')) {
        process.stdout.write(`  📥 Descargando: ${item.name.substring(0, 40)}...`)
        await downloadImage(item.imageUrl, localImagePath)
        console.log(' ✓')
      }

      products.push({
        name: item.name,
        price: parseInt(item.price) || 0,
        description: '',
        category: categoryName,
        imageUrl: item.imageUrl,
        localImage: relativeImagePath,
        brand: '',
        slug,
      })
    }

  } catch (error) {
    console.log(`  ❌ Error en ${categoryUrl}: ${error}`)
  }

  return products
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando scraper de SuperZoo...')
  console.log('⚠️  Solo para uso en demo/portafolio\n')

  // Crea carpetas de output
  await fs.ensureDir(DATA_DIR)
  for (const cat of CATEGORIES) {
    await fs.ensureDir(path.join(IMAGES_DIR, cat.slug))
  }

  const browser = await chromium.launch({
    headless: true, // cambiar a false para ver el navegador
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })

  const page = await context.newPage()
  const allProducts: Product[] = []

  // Scrapea cada categoría
  for (const category of CATEGORIES) {
    for (const url of category.urls) {
      const products = await scrapeCategory(page, category.slug, url)
      allProducts.push(...products)
      // Pausa entre requests para no sobrecargar el servidor
      await page.waitForTimeout(2000)
    }
  }

  await browser.close()

  // Guarda el JSON con todos los productos
  const outputFile = path.join(DATA_DIR, 'products.json')
  await fs.writeJSON(outputFile, allProducts, { spaces: 2 })

  // Genera resumen por categoría
  const summary: Record<string, number> = {}
  allProducts.forEach(p => {
    summary[p.category] = (summary[p.category] || 0) + 1
  })

  console.log('\n✅ Scraping completado!')
  console.log(`📊 Total productos: ${allProducts.length}`)
  console.log('📁 Resumen por categoría:')
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} productos`)
  })
  console.log(`\n💾 Datos guardados en: ${outputFile}`)
  console.log(`🖼️  Imágenes guardadas en: ${IMAGES_DIR}`)
}

main().catch(console.error)