/**
 * Classifies perro/gato root-category products into their correct subcategories.
 * Run: node prisma/classify-products.js
 * Dry run (no writes): DRY_RUN=1 node prisma/classify-products.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const DRY_RUN = process.env.DRY_RUN === '1'

// ── Perro ──────────────────────────────────────────────────────────────────────
function classifyPerro(name) {
  const n = name.toLowerCase()

  // 1. Antiparasitarios (most specific — check first)
  if (/antipulgas|antiparasit|pulgas|garrapata|nexgard|frontline|bravecto|seresto|repelente.*insect/i.test(n))
    return 'perro-antiparasitarios'

  // 2. Higiene
  if (/shampoo|champú|champu|cepillo.*dient|pasta.*dient|cortaúñas|cortaunas|limpiador.*oído|desodorante\b/i.test(n))
    return 'perro-higiene'

  // 3. Juguetes (before food — avoids "Kong" or "pelota" being misclassified)
  if (/juguete|mordedor|peluche|\bkong\b|\bbola\b|\bcuerda\b|\brope\b|tirador|rompecabezas|puzzle|tootoy|nina ottosson|comfort rope|minus one folding|pull multi|chew baked|chew farm|ball air|squeezz|\bpelota\b|dispensador.*cuerda|juego.*dental/i.test(n))
    return 'perro-juguetes'

  // 4. Alimentos — explicit food words
  if (/\balimento\b|comida|croqueta|pienso|\bseco\b|\bhúmedo\b|\bhumedo\b|paté|pate\b|\bsnack\b|premio|golosina|\bgalleta\b|huesito|\bhueso\b.*(?:aroma|sabor|doble|capa)|\bjerky\b|\bchuru\b|\bbarf\b|raw.*food|tira.*(?:sabor|carne)|sticks\b|slices\b|bites\b|treats|rolls.*perro|creamy\b|cremi\b/i.test(n))
    return 'perro-alimentos'

  // 5. Alimentos — food brands (all products by these brands in perro cat are food)
  if (/dogxtreme|fit formula|true origins|naturalistic.*(?:carne|carnemix)|\brahue\b|\bwanpy\b|\bvitakraft\b|better bones|ama alimento|dingo mini|\bbravery\b|\bnath\b|royal canin|salvaje|acana|eukanuba|\bhills\b/i.test(n))
    return 'perro-alimentos'

  // Default → accessories
  return 'perro-accesorios'
}

// ── Gato ───────────────────────────────────────────────────────────────────────
function classifyGato(name) {
  const n = name.toLowerCase()

  // 1. Antiparasitarios
  if (/antipulgas|antiparasit|pulgas|garrapata|frontline|advocate|bravecto|seresto/i.test(n))
    return 'gato-antiparasitarios'

  // 2. Higiene
  if (/shampoo|champú|champu|limpiador|cepillo|cortaúñas|cortaunas|desodorante/i.test(n))
    return 'gato-higiene'

  // 3. Arena
  if (/\barena\b|bandeja.*sanitaria|arenero|lecho.*gato|lettere|kocat/i.test(n))
    return 'gato-arena'

  // 4. Juguetes
  if (/juguete|rascador|\bcaña\b|\bratón\b|pluma|\btootoy\b|playology|kong cat|varilla\b|varita\b|the cat band|remy rocker|walter rascar|suava ball|\bpelota\b.*gato|interactivo.*gato|túnel.*gato|zanahoria interactiva|serpiente.*gato|pez.*gato|luz led.*gato|feather teaser/i.test(n))
    return 'gato-juguetes'

  // 5. Alimentos — explicit food words
  if (/\balimento\b|comida|croqueta|pienso|\bseco\b|\bhúmedo\b|\bhumedo\b|paté|pate\b|\bsnack\b|premio|golosina|\bgalleta\b|\bchuru\b|\bjerky\b|creamy treat|cremi\b|mousse|gelatina|sticks\b|bites\b|treats|pouch\b/i.test(n))
    return 'gato-alimentos'

  // 6. Alimentos — cat food brands
  if (/fit formula.*gato|catxtreme|\bbravery\b.*(?:cat|gato|sterilized)|\bnath cat\b|\bnath kitten\b|royal canin.*(?:indoor|urin|gato|cat)|true origins.*gato|naturalistic.*gato|taste of the wild|winga|wanpy.*(?:tuna|scallop|creamy)|catfit/i.test(n))
    return 'gato-alimentos'

  // Default → stays in root gato (no "accesorios" subcategory for gato)
  return 'gato'
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no writes\n' : '✏️  LIVE RUN — will update DB\n')

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } })
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]))
  console.log('Categories in DB:', Object.keys(catMap).join(', '), '\n')

  const perroCatId = catMap['perro']
  const gatoCatId = catMap['gato']

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: [perroCatId, gatoCatId] } },
    select: { id: true, name: true, categoryId: true },
  })
  console.log(`Found ${products.length} root perro/gato products to classify\n`)

  const distribution = {}
  const updates = []

  for (const p of products) {
    const isPerro = p.categoryId === perroCatId
    const newSlug = isPerro ? classifyPerro(p.name) : classifyGato(p.name)
    const newCatId = catMap[newSlug]

    if (newCatId === undefined) {
      console.log(`⚠️  No category ID for slug "${newSlug}" — product: ${p.name}`)
      continue
    }

    distribution[newSlug] = (distribution[newSlug] || 0) + 1

    if (newCatId !== p.categoryId) {
      updates.push({ id: p.id, categoryId: newCatId, name: p.name.slice(0, 55), newSlug })
    }
  }

  console.log('📊 Distribution:')
  Object.entries(distribution)
    .sort()
    .forEach(([k, v]) => console.log(`  ${k.padEnd(30)} ${v}`))

  console.log(`\n📝 ${updates.length} products need reclassification`)
  if (updates.length > 0) {
    console.log('\nSamples:')
    updates.slice(0, 15).forEach((u) => console.log(`  [→ ${u.newSlug}] ${u.name}`))
    if (updates.length > 15) console.log(`  ... and ${updates.length - 15} more`)
  }

  if (DRY_RUN) {
    console.log('\n⏭️  Dry run complete — no changes made')
    return
  }

  // Apply updates in parallel batches of 50
  const CHUNK = 50
  let done = 0
  for (let i = 0; i < updates.length; i += CHUNK) {
    const batch = updates.slice(i, i + CHUNK)
    await Promise.all(
      batch.map((u) =>
        prisma.product.update({ where: { id: u.id }, data: { categoryId: u.categoryId } }),
      ),
    )
    done += batch.length
    process.stdout.write(`\r  Updated ${done}/${updates.length}...`)
  }
  console.log(`\n✅ Done — ${done} products reclassified`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
