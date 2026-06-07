import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const SUBCATEGORY_RULES: {
  parentSlug: string
  subId: number
  patterns: string[]
}[] = [
  // ── Perro → Alimentos ─────────────────────────────────────────
  {
    parentSlug: 'perro',
    subId: 7,
    patterns: [
      'alimento para perro',
      'alimento humedo para perro',
      'premio para perro',
      'snack para perro',
      'nutrition',
      'adult',
      'puppy',
      'senior',
      'cachorro',
      'alimento',
      'comida',
      'croquetas',
      'balanceado',
    ],
  },
  // ── Perro → Accesorios ────────────────────────────────────────
  {
    parentSlug: 'perro',
    subId: 8,
    patterns: [
      'arnes',
      'collar',
      'correa',
      'cama',
      'comedero',
      'bebedero',
      'bowl',
      'plato',
      'transportador',
      'jaula',
      'bolso',
      'mochila',
      'identificacion',
      'placa',
    ],
  },
  // ── Perro → Juguetes ──────────────────────────────────────────
  {
    parentSlug: 'perro',
    subId: 9,
    patterns: [
      'juguete',
      'pelota',
      'bola',
      'kong',
      'mordedor',
      'soga',
      'frisbee',
      'cuerda',
      'sonido',
      'squeaky',
      'tug',
    ],
  },
  // ── Perro → Higiene ───────────────────────────────────────────
  {
    parentSlug: 'perro',
    subId: 10,
    patterns: [
      'shampoo',
      'cepillo',
      'cortaunas',
      'perfume',
      'desodorante',
      'toalla',
      'peine',
      'higiene',
      'lava',
      'banio',
      'limpieza',
    ],
  },
  // ── Perro → Antiparasitarios ──────────────────────────────────
  {
    parentSlug: 'perro',
    subId: 11,
    patterns: [
      'antiparasitario',
      'pipeta',
      'pulgas',
      'garrapatas',
      'frontline',
      'revolution',
      'advantage',
      'bravecto',
      'nexgard',
      'drontal',
      'simparica',
      'seresto',
      'parasiticida',
    ],
  },
  // ── Gato → Alimentos ──────────────────────────────────────────
  {
    parentSlug: 'gato',
    subId: 12,
    patterns: [
      'alimento para gato',
      'alimento humedo para gato',
      'snack para gato',
      'premio para gato',
      'comida para gato',
      'churu',
      'catxtreme',
      'applaws',
      'bravery cat',
      'alimento',
    ],
  },
  // ── Gato → Arena ──────────────────────────────────────────────
  {
    parentSlug: 'gato',
    subId: 13,
    patterns: [
      'arena',
      'litter',
      'sand',
      'america litter',
    ],
  },
  // ── Gato → Juguetes ───────────────────────────────────────────
  {
    parentSlug: 'gato',
    subId: 14,
    patterns: [
      'juguete',
      'catnip',
      'raton',
      'ratones',
      'pluma',
      'varita',
      'bola',
      'pelota',
      'charmy',
    ],
  },
  // ── Gato → Higiene ────────────────────────────────────────────
  {
    parentSlug: 'gato',
    subId: 15,
    patterns: [
      'shampoo',
      'cepillo',
      'cortaunas',
      'peine',
      'higiene',
      'banio',
      'limpieza',
    ],
  },
  // ── Gato → Antiparasitarios ───────────────────────────────────
  {
    parentSlug: 'gato',
    subId: 16,
    patterns: [
      'antiparasitario',
      'pipeta',
      'pulgas',
      'garrapatas',
      'frontline',
      'revolution',
      'advantage',
      'bravecto',
      'nexgard',
      'drontal',
      'simparica',
      'seresto',
      'parasiticida',
    ],
  },
  // ── Farmacia → (already id 3) ─────────────────────────────────
  // Already correctly assigned, but catch any stragglers
  {
    parentSlug: 'farmacia',
    subId: 3,
    patterns: [
      'farmacia',
      'veterinaria',
      'medicamento',
      'vitamina',
      'suplemento',
    ],
  },
  // ── Peluqueria → (already id 21) ──────────────────────────────
  {
    parentSlug: 'peluqueria',
    subId: 21,
    patterns: [
      'peluqueria',
      'corte',
      'tijera',
      'maquina',
    ],
  },
]

async function main() {
  console.log('📦 Starting category classification...\n')

  const categories = await prisma.category.findMany()
  const catMap = new Map(categories.map((c) => [c.slug, c]))

  let totalUpdated = 0

  for (const rule of SUBCATEGORY_RULES) {
    const parentCat = catMap.get(rule.parentSlug)
    if (!parentCat) {
      console.log(`  ⚠️  Parent category not found: ${rule.parentSlug}`)
      continue
    }

    const products = await prisma.product.findMany({
      where: { categoryId: parentCat.id, isActive: true },
      orderBy: { id: 'asc' },
    })

    if (products.length === 0) {
      console.log(`  ℹ️  No products in ${rule.parentSlug} parent`)
      continue
    }

    const matched: number[] = []

    for (const product of products) {
      const normalized = normalize(product.name)
      for (const pattern of rule.patterns) {
        if (normalized.includes(pattern)) {
          matched.push(product.id)
          break
        }
      }
    }

    if (matched.length > 0) {
      const result = await prisma.product.updateMany({
        where: { id: { in: matched } },
        data: { categoryId: rule.subId },
      })
      totalUpdated += result.count
      console.log(`  ✅ ${rule.parentSlug} → subcategory ${rule.subId}: ${result.count} products`)
    } else {
      console.log(`  ℹ️  ${rule.parentSlug} → subcategory ${rule.subId}: no matches`)
    }
  }

  console.log(`\n📊 Total products updated: ${totalUpdated}`)

  // Show summary per category
  console.log('\n📊 Distribution after migration:')
  const allCats = await prisma.category.findMany({
    include: { children: true },
  })
  for (const cat of allCats) {
    const total = await prisma.product.count({
      where: { categoryId: cat.id, isActive: true },
    })
    console.log(`  ${cat.name} (${cat.slug}): ${total}`)
    for (const child of cat.children) {
      const count = await prisma.product.count({
        where: { categoryId: child.id, isActive: true },
      })
      console.log(`    ${child.name} (${child.slug}): ${count}`)
    }
  }

  console.log('\n🎉 Category classification complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
