/**
 * Sets random sale prices (~15-30% off) on N random scraper products.
 * Run: node prisma/seed-ofertas.js
 * Dry run: DRY_RUN=1 node prisma/seed-ofertas.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const DRY_RUN = process.env.DRY_RUN === '1'
const TARGET = 30

function randomDiscount() {
  const pct = 0.10 + Math.random() * 0.20 // 10-30%
  return Math.round(pct * 100) / 100
}

function randomPick(arr, n) {
  const copy = [...arr]
  const out = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN' : '✏️  LIVE RUN')
  console.log(`Target: ${TARGET} products\n`)

  const all = await prisma.product.findMany({
    where: { isActive: true, salePrice: null },
    select: { id: true, name: true, price: true, category: { select: { slug: true } } },
    orderBy: { name: 'asc' },
  })
  console.log(`Total products without salePrice: ${all.length}`)

  const chosen = randomPick(all, TARGET)
  console.log(`Selected ${chosen.length} products for offers:\n`)

  for (const p of chosen) {
    const discount = randomDiscount()
    const salePrice = Math.round(p.price * (1 - discount))
    console.log(`  ${p.name.slice(0, 55).padEnd(57)} $${p.price} → $${salePrice} (${Math.round(discount * 100)}% off)`)
  }

  if (DRY_RUN) {
    console.log('\n⏭️  Dry run — no changes')
    return
  }

  await Promise.all(
    chosen.map((p) => {
      const discount = randomDiscount()
      const salePrice = Math.round(p.price * (1 - discount))
      return prisma.product.update({
        where: { id: p.id },
        data: { salePrice },
      })
    }),
  )
  console.log(`\n✅ ${chosen.length} products updated`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
