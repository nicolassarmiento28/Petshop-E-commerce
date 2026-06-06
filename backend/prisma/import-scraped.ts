/**
 * import-scraped.ts
 * Lee scraper/output/data/products.json e inserta los productos en la base de datos.
 * Uso: ts-node --transpile-only prisma/import-scraped.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ScrapedProduct {
  name: string
  price: number
  description: string
  category: string
  imageUrl: string
  localImage: string
  brand: string
  slug: string
}

// Mapeo de categoría scrapeada → slug de categoría en la BD
const CATEGORY_MAP: Record<string, string> = {
  perro:      'perro',
  gato:       'gato',
  farmacia:   'farmacia',
  peluqueria: 'peluqueria',
}

async function main() {
  const jsonPath = path.join(__dirname, '../../scraper/output/data/products.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ No se encontró: ${jsonPath}`)
    console.error('   Ejecuta primero: cd scraper && npx ts-node scripts/scraper.ts')
    process.exit(1)
  }

  const scraped: ScrapedProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`📦 Productos en JSON: ${scraped.length}`)

  // Carga todas las categorías de la BD
  const categories = await prisma.category.findMany()
  const catMap: Record<string, number> = {}
  categories.forEach(c => { catMap[c.slug] = c.id })

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const p of scraped) {
    if (!p.name || !p.slug || p.price === 0) {
      skipped++
      continue
    }

    const catSlug = CATEGORY_MAP[p.category]
    if (!catSlug || !catMap[catSlug]) {
      console.warn(`  ⚠️  Categoría desconocida: ${p.category} — omitiendo "${p.name}"`)
      skipped++
      continue
    }

    try {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          description: p.description || '',
          categoryId: catMap[catSlug],
        },
        create: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          imageUrl: p.imageUrl,
          description: p.description || '',
          images: [],
          stock: 10,
          isActive: true,
          isFeatured: false,
          categoryId: catMap[catSlug],
        },
      })
      inserted++
      process.stdout.write(`\r  ✅ ${inserted} insertados...`)
    } catch (err) {
      console.error(`\n  ❌ Error en "${p.name}": ${err}`)
      errors++
    }
  }

  console.log(`\n\n🎉 Importación completa!`)
  console.log(`   Insertados/actualizados: ${inserted}`)
  console.log(`   Omitidos:               ${skipped}`)
  console.log(`   Errores:                ${errors}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
