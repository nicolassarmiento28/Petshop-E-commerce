import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// SuperZoo brand logo URLs mapped to our DB slugs
// Extracted from https://www.superzoo.cl homepage brand carousel (2026-06-07)
const LOGO_UPDATES: Record<string, string> = {
  'royal-canin': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd0b12a43/SuperZoo/marcas/Logo/logo-royalcanin.png',
  hills: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwbb42c782/SuperZoo/marcas/Logo/logo-hills.webp',
  acana: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwdab66a95/SuperZoo/homepage/2025/logo-bolitas/acana.webp',
  applaws: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw41ab42bb/SuperZoo/homepage/2026/logo-bolitas/applaws.webp',
  bravery: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd79fa74a/SuperZoo/marcas/Logo/logo-bravery.png',
  catxtreme: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwc2ca71d6/SuperZoo/marcas/Logo/logo-catxtreme.jpg',
  'taste-of-the-wild': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwff7b3b70/SuperZoo/marcas/Logo/tasteofthewild-logo.png',
  vetlife: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw473af22a/SuperZoo/marcas/Logo/vetlife-logo.png',
  nath: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwfe3ff1a4/SuperZoo/marcas/Logo/logo_nath.jpg',
  'true-origins': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwa652c3f4/SuperZoo/marcas/Logo/true-origins.png',
  belcando: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw2dfaba54/SuperZoo/marcas/Logo/Belcando-new.jpg',
  leeby: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw99053a5e/SuperZoo/marcas/Logo/logo-leeby.webp',
  gotoo: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw205ac519/SuperZoo/marcas/Logo/logo-gotoo.webp',
  tootoy: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw6db9edda/SuperZoo/marcas/Logo/tootoy.webp',
  'nice-care': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwb67d7254/SuperZoo/marcas/Logo/nicecare.webp',
  'tk-pet': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw0dcc6085/SuperZoo/marcas/Logo/logo-tkpet.jpg',
  zeedog: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwcbe558b1/SuperZoo/marcas/Logo/logo-Zeedog.png',
  amity: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwbe94e7c0/SuperZoo/marcas/Logo/logo-amity.webp',
  dogxtreme: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw419226ba/SuperZoo/marcas/Logo/logo-dogxtreme.jpg',
  leonardo: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw4949bcdb/SuperZoo/marcas/Logo/Leonardo-new.jpg',
  dogzilla: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwb1c15427/SuperZoo/marcas/Logo/logo_dogzilla.png',
  catzilla: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwc7e9cc23/SuperZoo/marcas/Logo/logo_catzilla.png',
  'wellness-core': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw6ded215b/SuperZoo/marcas/Logo/LOGO-WELLNESS.png',
  nexgard: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw9b0c8e32/SuperZoo/marcas/Logo/nexgard.webp',
  mpets: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwe3be8632/SuperZoo/marcas/Logo/logo-mpets2.png',
  salvaje: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw0654e13b/SuperZoo/marcas/Logo/logo-salvaje.png',
  kong: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd11b155b/SuperZoo/marcas/Logo/Logo-KONG.png',
  dingo: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd6b3b606/SuperZoo/marcas/Logo/logo-dingo.webp',
  'fit-formula': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw3a9f90fd/SuperZoo/marcas/Logo/logo-fitformula.png',
  outech: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw2da0a444/SuperZoo/marcas/Logo/logo-outech.webp',
  simparica: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw42c01a88/SuperZoo/marcas/Logo/logo-simparicatrio.webp',
  'natural-and-delicious': 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw85bd18f4/SuperZoo/marcas/Logo/logo-nandd.webp',
}

// Brands with stale placeholder URLs — clear them
const CLEAR_LOGOS = ['advance', 'churu', 'eukanuba', 'pedigree', 'purina-pro-plan', 'america-litter', 'brit-care']

async function main() {
  console.log('🖼️  Updating brand logo URLs from SuperZoo...\n')

  let updated = 0
  let notFound: string[] = []

  for (const [slug, logoUrl] of Object.entries(LOGO_UPDATES)) {
    const existing = await prisma.brand.findUnique({ where: { slug } })
    if (existing) {
      await prisma.brand.update({
        where: { slug },
        data: { logoUrl },
      })
      console.log(`  ✅ ${existing.name} (${slug}) → logo updated`)
      updated++
    } else {
      notFound.push(slug)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Brands updated: ${updated}`)
  if (notFound.length > 0) {
    console.log(`   Brands NOT found in DB (create them first):`)
    notFound.forEach((s) => console.log(`      - ${s}`))
  }
  console.log(`\n🎉 Logo update complete!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
