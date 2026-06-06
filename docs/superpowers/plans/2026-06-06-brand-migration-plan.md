# Brand Assignment Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assign `brandId` to all products whose brand can be identified from product name, create missing brands.

**Architecture:** Single migration script (`backend/prisma/seed-brands.ts`) that scans all products, matches brand names, creates missing brands, updates products. Run once.

**Tech Stack:** TypeScript, Prisma, Node.js

---

### Task 1: Create the brand migration script

**Files:**
- Create: `backend/prisma/seed-brands.ts`

- [ ] **Write the full migration script**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Multi-word brands first (to avoid partial matches)
const BRAND_MAP: Record<string, string[]> = {
  'Royal Canin': ['royal canin'],
  'Purina Pro Plan': ['purina pro plan'],
  "Hill's": ["hill's", 'hills science diet', 'hills'],
  'Taste of the Wild': ['taste of the wild'],
  'True Origins': ['true origins'],
  'Outward Hound': ['outward hound'],
  'Brit Care': ['brit care'],
  'Cat Extreme': ['cat extreme'],
  'America Litter': ['america litter'],
  'Better Bones': ['better bones'],
  'Skouts Honor': ["skouts honor"],
  'Stay Happy': ['stay happy'],
  'Remy Rocker': ['remy rocker'],
  'Minus One': ['minus one'],
  'Puppy Cuddle': ['puppy cuddle'],
  'Fit Formula': ['fit formula'],
  'My Zoo': ['my zoo'],
  'Pet wippi': ['pet wippi'],
  'The cat band': ['the cat band'],
  'Pet block': ['pet block'],
  'Zeecat': ['zeecat'],
  'Coolpet': ['coolpet'],
  'Cunatex': ['cunatex'],
  'Flamingo': ['flamingo'],
  'Playology': ['playology'],
  'Gotoo': ['gotoo'],
  'Mpets': ['mpets'],
  'Leeby': ['leeby'],
  'Nath': ['nath'],
  'Salvaje': ['salvaje'],
  'Advance': ['advance'],
  'Acana': ['acana'],
  'Applaws': ['applaws'],
  'Bravery': ['bravery'],
  'Churu': ['churu'],
  'Eukanuba': ['eukanuba'],
  'Pedigree': ['pedigree'],
  'Vetlife': ['vetlife'],
  'Rahue': ['rahue'],
  'Vitakraft': ['vitakraft'],
  'Wanpy': ['wanpy'],
  'Naturalistic': ['naturalistic'],
  'Qchefs': ['qchefs'],
  'Simparica': ['simparica'],
  'Oxyfresh': ['oxyfresh'],
  'Virbac': ['virbac'],
  'PlaqueOff': ['plaqueoff'],
  'Superpet': ['superpet'],
  'Ruffwear': ['ruffwear'],
  'Pepolli': ['pepolli'],
  'Outech': ['outech'],
  'Tootoy': ['tootoy!', 'tootoy'],
  'Kong': ['kong'],
  'Frontline': ['frontline'],
  'Drontal': ['drontal'],
  'Bravecto': ['bravecto'],
  'Nexgard': ['nexgard'],
  'Revolution': ['revolution'],
  'Advantage': ['advantage'],
  'Seresto': ['seresto'],
  'Dogxtreme': ['dogxtreme'],
  'Leonardo': ['leonardo'],
  'Catit': ['catit'],
  'Feliway': ['feliway'],
  'Winga': ['winga'],
  'Charmy': ['charmy'],
  'Dingo': ['dingo'],
  'Furminator': ['furminator'],
  'Comfort': ['comfort'],
  'Cactus': ['cactus'],
  'Natur\'luxe': ["natur'luxe"],
  'Fitz': ['fitz'],
  'Olympus': ['olympus'],
  'Invermic': ['invermic'],
  'Mebermic': ['mebermic'],
  'Flovovermic': ['flovovermic'],
  'Nanormen': ['nanormen'],
  'Canigest': ['canigest'],
  'Probiocat': ['probiocat'],
  'Furinaid': ['furinaid'],
  'Mamistop': ['mamistop'],
  'Stride plus': ['stride plus'],
  'Apeticat': ['apeticat'],
  'Fellini': ['fellini'],
  'Biopets': ['biopets'],
  'Papainpet': ['papainpet'],
  'Sunicoat': ['sunicoat'],
  'Senilpet': ['senilpet'],
  'Silimadrag': ['silimadrag'],
  'Laxdrag': ['laxdrag'],
  'Hairball': ['hairball'],
  'Calmer': ['calmer'],
  'Laveta': ['laveta'],
  'No stress': ['no stress'],
  'Suava': ['suava'],
  'Allercalm': ['allercalm'],
  'Catxtreme': ['catxtreme'],
  'Zeecat': ['zeecat'],
  'Ama': ['ama alimento'],
  'Multi': [], // skip — false positive
  'Salmon': [], // skip — false positive
  'Neutral': [], // skip — false positive
  'Neutro': [], // skip — false positive
}

// Remove entries with empty keywords
for (const key of Object.keys(BRAND_MAP)) {
  if (BRAND_MAP[key].length === 0) delete BRAND_MAP[key]
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s!']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findBrand(name: string): string | null {
  const normalized = normalize(name)
  // Multi-word brands first
  const entries = Object.entries(BRAND_MAP).sort((a, b) => b[1][0].split(' ').length - a[1][0].split(' ').length)
  for (const [brandName, keywords] of entries) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) return brandName
    }
  }
  return null
}

async function main() {
  console.log('🏷️  Starting brand migration...')

  // 1. Get all existing brands
  const existingBrands = await prisma.brand.findMany()
  const existingSlugs = new Set(existingBrands.map(b => b.slug))

  // 2. Get all products without brandId
  const products = await prisma.product.findMany({
    where: { brandId: null, isActive: true },
  })
  console.log(`📦 ${products.length} products without brand`)

  // 3. Group products by matched brand name
  const productBrandMap: Map<string, { name: string; slug: string; productIds: number[] }> = new Map()

  for (const product of products) {
    const brandName = findBrand(product.name)
    if (brandName) {
      if (!productBrandMap.has(brandName)) {
        const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        productBrandMap.set(brandName, { name: brandName, slug, productIds: [] })
      }
      productBrandMap.get(brandName)!.productIds.push(product.id)
    }
  }

  console.log(`🔍 ${productBrandMap.size} unique brands identified`)

  // 4. Create missing brands
  let created = 0
  const brandNameToId: Map<string, number> = new Map()

  for (const [brandName, info] of productBrandMap) {
    if (existingSlugs.has(info.slug)) {
      const existing = existingBrands.find(b => b.slug === info.slug)!
      brandNameToId.set(brandName, existing.id)
    } else {
      const brand = await prisma.brand.create({
        data: { name: info.name, slug: info.slug },
      })
      brandNameToId.set(brandName, brand.id)
      created++
      console.log(`  ✅ Created brand: ${brandName}`)
    }
  }
  console.log(`✅ ${created} new brands created`)

  // 5. Update products with brandId
  let updated = 0
  for (const [brandName, info] of productBrandMap) {
    const brandId = brandNameToId.get(brandName)!
    await prisma.product.updateMany({
      where: { id: { in: info.productIds } },
      data: { brandId },
    })
    updated += info.productIds.length
    console.log(`  ✅ ${info.productIds.length} products → ${brandName}`)
  }
  console.log(`✅ ${updated} products updated with brandId`)

  // 6. Summary
  const totalWithBrand = await prisma.product.count({ where: { brandId: { not: null }, isActive: true } })
  const totalWithoutBrand = await prisma.product.count({ where: { brandId: null, isActive: true } })
  console.log(`\n📊 Summary:`)
  console.log(`   With brand: ${totalWithBrand}`)
  console.log(`   Without brand: ${totalWithoutBrand}`)
  console.log(`   Total brands: ${await prisma.brand.count()}`)
  console.log(`🎉 Brand migration complete!`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Run the migration script**

Run: `cd backend && npx ts-node prisma/seed-brands.ts`
Expected: Script runs, shows brands created and products updated.

- [ ] **Verify results in admin panel**

Check that admin Brands page shows accurate product counts.
