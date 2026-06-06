const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed desde scraper...')

  const jsonPath = path.join(__dirname, '../../scraper/output/data/products.json')
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  const categories = [...new Set(products.map(p => p.category))]
  console.log(`📁 Categorías: ${categories.join(', ')}`)

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat },
      update: {},
      create: {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        slug: cat,
      },
    })
  }

  console.log(`✅ ${categories.length} categorías creadas`)

  const unique = new Map()
  for (const p of products) {
    if (!unique.has(p.slug)) unique.set(p.slug, p)
  }
  const uniqueProducts = Array.from(unique.values())
  console.log(`📦 Insertando ${uniqueProducts.length} productos...`)

  let count = 0
  for (const p of uniqueProducts) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } })
    if (!category) continue
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        imageUrl: p.imageUrl,
        stock: 10,
        isActive: true,
        categoryId: category.id,
      },
    })
    count++
  }

  console.log(`✅ ${count} productos insertados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())