const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const CHUNK_SIZE = 50

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  console.log('🌱 Iniciando seed desde scraper...')

  const jsonPath = path.join(__dirname, '../../scraper/output/data/products.json')
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  // 1. Upsert categories (only 4 — fast)
  const categorySlugs = [...new Set(products.map(p => p.category))]
  console.log(`📁 Categorías: ${categorySlugs.join(', ')}`)
  for (const cat of categorySlugs) {
    await prisma.category.upsert({
      where: { slug: cat },
      update: { name: cat.charAt(0).toUpperCase() + cat.slice(1) },
      create: { name: cat.charAt(0).toUpperCase() + cat.slice(1), slug: cat },
    })
  }
  console.log(`✅ ${categorySlugs.length} categorías listas`)

  // 2. Load category id map
  const cats = await prisma.category.findMany({ where: { slug: { in: categorySlugs } } })
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // 3. Deduplicate products by slug
  const unique = new Map()
  for (const p of products) {
    if (!unique.has(p.slug)) unique.set(p.slug, p)
  }
  const uniqueProducts = Array.from(unique.values())
  console.log(`📦 ${uniqueProducts.length} productos únicos`)

  // 4. Fetch existing slugs in one query
  const existing = await prisma.product.findMany({ select: { slug: true } })
  const existingSlugs = new Set(existing.map(p => p.slug))

  const toCreate = uniqueProducts.filter(p => !existingSlugs.has(p.slug) && catMap[p.category])
  const toUpdate = uniqueProducts.filter(p => existingSlugs.has(p.slug) && catMap[p.category])

  console.log(`➕ Crear: ${toCreate.length}  ✏️  Actualizar: ${toUpdate.length}`)

  // 5. Bulk create new products
  if (toCreate.length > 0) {
    await prisma.product.createMany({
      data: toCreate.map(p => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        imageUrl: p.imageUrl,
        stock: 10,
        isActive: true,
        categoryId: catMap[p.category],
      })),
      skipDuplicates: true,
    })
    console.log(`✅ ${toCreate.length} productos creados`)
  }

  // 6. Update existing products in parallel chunks
  if (toUpdate.length > 0) {
    const chunks = chunk(toUpdate, CHUNK_SIZE)
    let done = 0
    for (const ch of chunks) {
      await Promise.all(
        ch.map(p =>
          prisma.product.update({
            where: { slug: p.slug },
            data: {
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              isActive: true,
              categoryId: catMap[p.category],
            },
          })
        )
      )
      done += ch.length
      process.stdout.write(`\r  Actualizado ${done}/${toUpdate.length}...`)
    }
    console.log(`\n✅ ${toUpdate.length} productos actualizados`)
  }

  const total = await prisma.product.count({ where: { isActive: true } })
  console.log(`\n🎉 Total productos activos en DB: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())