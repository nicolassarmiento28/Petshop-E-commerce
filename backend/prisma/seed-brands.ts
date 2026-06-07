import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BRAND_KEYWORDS: Record<string, string[]> = {
  'Royal Canin': ['royal canin'],
  "Purina Pro Plan": ['purina pro plan'],
  "Hill's": ["hill's", 'hills science diet'],
  'Taste of the Wild': ['taste of the wild'],
  'True Origins': ['true origins'],
  'Outward Hound': ['outward hound', 'nina ottosson'],
  'Brit Care': ['brit care'],
  'Catxtreme': ['catxtreme', 'cat extreme'],
  'America Litter': ['america litter'],
  'Better Bones': ['better bones'],
  'Skouts Honor': ['skouts honor'],
  'Stay Happy': ['stay happy'],
  'Remy Rocker': ['remy rocker'],
  'Minus One': ['minus one'],
  'Puppy Cuddle': ['puppy cuddle'],
  'Pet Wippi': ['pet wippi'],
  'SuperZoo': ['superzoo'],
  'Fit Formula': ['fit formula'],
  'My Zoo': ['my zoo'],
  'The Cat Band': ['the cat band'],
  'Pet Block': ['pet block'],
  'No Stress': ['no stress'],
  'Stride Plus': ['stride plus'],
  'Zeecat': ['zeecat'],
  'Coolpet': ['coolpet'],
  'Cunatex': ['cunatex'],
  'Flamingo Penken': ['flamingo penken', 'flamingo'],
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
  'Virbac': ['virbac', 'allercalm'],
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
  'Comfort': ['comfort rope', 'comfort skinny'],
  'Natur\'luxe': ["natur'luxe"],
  'Fitz': ['fitz flattie'],
  'Olympus': ['olympus cat'],
  'Invermic': ['invermic'],
  'Mebermic': ['mebermic'],
  'Flovovermic': ['flovovermic'],
  'Nanormen': ['nanormen'],
  'Canigest': ['canigest'],
  'Probiocat': ['probiocat'],
  'Furinaid': ['furinaid'],
  'Mamistop': ['mamistop'],
  'Apeticat': ['apeticat'],
  'Fellini': ['fellini'],
  'Biopets': ['biopets'],
  'Papainpet': ['papainpet'],
  'Sunicoat': ['sunicote'],
  'Senilpet': ['senilpet'],
  'Silimadrag': ['silimadrag'],
  'Laxdrag': ['laxdrag'],
  'Hairball': ['hairball laxdrag'],
  'Calmer': ['calmer'],
  'Laveta': ['laveta taurina'],
  'Suava': ['suava ball'],
  'Ama': ['ama alimento'],
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s!'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findBrand(name: string): string | null {
  const normalized = normalize(name)
  const entries = Object.entries(BRAND_KEYWORDS).sort(
    (a, b) => b[1][0].split(' ').length - a[1][0].split(' ').length,
  )
  for (const [brandName, keywords] of entries) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) return brandName
    }
  }
  return null
}

async function main() {
  console.log('🏷️  Starting brand migration...')

  const existingBrands = await prisma.brand.findMany()
  const existingBySlug = new Map(existingBrands.map((b) => [b.slug, b]))
  const existingByLowerName = new Map(
    existingBrands.map((b) => [b.name.toLowerCase(), b]),
  )

  const products = await prisma.product.findMany({
    where: { brandId: null, isActive: true },
    orderBy: { id: 'asc' },
  })
  console.log(`📦 ${products.length} products without brandId\n`)

  const productBrandMap = new Map<string, number[]>()
  const brandNameToSlug = new Map<string, string>()

  for (const product of products) {
    const brandName = findBrand(product.name)
    if (brandName) {
      if (!productBrandMap.has(brandName)) {
        const slug = brandName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        brandNameToSlug.set(brandName, slug)
        productBrandMap.set(brandName, [])
      }
      productBrandMap.get(brandName)!.push(product.id)
    }
  }

  let created = 0
  let updated = 0

  for (const [brandName, productIds] of productBrandMap) {
    const slug = brandNameToSlug.get(brandName)!

    let brandId: number

    if (existingBySlug.has(slug)) {
      brandId = existingBySlug.get(slug)!.id
    } else if (existingByLowerName.has(brandName.toLowerCase())) {
      brandId = existingByLowerName.get(brandName.toLowerCase())!.id
    } else {
      const brand = await prisma.brand.create({
        data: { name: brandName, slug },
      })
      brandId = brand.id
      created++
      console.log(`  ✅ Created brand: ${brandName} (${brand.slug})`)
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { brandId },
    })
    updated += productIds.length
    console.log(`  ✅ ${productIds.length} products → ${brandName}`)
  }

  const totalWithBrand = await prisma.product.count({
    where: { brandId: { not: null }, isActive: true },
  })
  const totalWithoutBrand = await prisma.product.count({
    where: { brandId: null, isActive: true },
  })

  console.log(`\n📊 Summary:`)
  console.log(`   New brands created: ${created}`)
  console.log(`   Products updated: ${updated}`)
  console.log(`   Total brands: ${await prisma.brand.count()}`)
  console.log(`   Products with brand: ${totalWithBrand}`)
  console.log(`   Products without brand: ${totalWithoutBrand}`)
  console.log(`\n🎉 Brand migration complete!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
