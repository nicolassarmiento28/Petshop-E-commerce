import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: { sku: null },
    include: { category: true, brand: true },
  })
  console.log('Products without SKU:', products.length)

  let updated = 0
  for (const p of products) {
    const catPrefix = p.category?.name?.slice(0, 3).toUpperCase() ?? 'GEN'
    const brandPrefix = p.brand?.name?.slice(0, 3).toUpperCase() ?? 'XXX'
    const sku = catPrefix + brandPrefix + String(p.id).padStart(5, '0')
    await prisma.product.update({ where: { id: p.id }, data: { sku } })
    updated++
  }
  console.log('Updated:', updated)
}

main().catch(console.error).finally(() => prisma.$disconnect())
