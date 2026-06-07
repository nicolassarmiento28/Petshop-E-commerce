import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ── Brands ──────────────────────────────────────────────────────────────────
  const brandData = [
    { name: 'Royal Canin', slug: 'royal-canin', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd0b12a43/SuperZoo/marcas/Logo/logo-royalcanin.png' },
    { name: "Hill's", slug: 'hills', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwbb42c782/SuperZoo/marcas/Logo/logo-hills.webp' },
    { name: 'Advance', slug: 'advance', logoUrl: null },
    { name: 'Acana', slug: 'acana', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwdab66a95/SuperZoo/homepage/2025/logo-bolitas/acana.webp' },
    { name: 'America Litter', slug: 'america-litter', logoUrl: null },
    { name: 'Applaws', slug: 'applaws', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw41ab42bb/SuperZoo/homepage/2026/logo-bolitas/applaws.webp' },
    { name: 'Bravery', slug: 'bravery', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwd79fa74a/SuperZoo/marcas/Logo/logo-bravery.png' },
    { name: 'Brit Care', slug: 'brit-care', logoUrl: null },
    { name: 'Catxtreme', slug: 'catxtreme', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwc2ca71d6/SuperZoo/marcas/Logo/logo-catxtreme.jpg' },
    { name: 'Churu', slug: 'churu', logoUrl: null },
    { name: 'Taste of the Wild', slug: 'taste-of-the-wild', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dwff7b3b70/SuperZoo/marcas/Logo/tasteofthewild-logo.png' },
    { name: 'Vetlife', slug: 'vetlife', logoUrl: 'https://www.superzoo.cl/on/demandware.static/-/Library-Sites-SuperZooSharedLibrary/default/dw473af22a/SuperZoo/marcas/Logo/vetlife-logo.png' },
    { name: 'Eukanuba', slug: 'eukanuba', logoUrl: null },
    { name: 'Pedigree', slug: 'pedigree', logoUrl: null },
    { name: 'Purina Pro Plan', slug: 'purina-pro-plan', logoUrl: null },
  ]

  for (const b of brandData) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: { logoUrl: b.logoUrl }, create: b })
  }
  console.log('✅ Brands seeded')

  // ── Categories ───────────────────────────────────────────────────────────────
  const mainCategories = [
    { name: 'Perro', slug: 'perro', description: 'Todo para tu perro' },
    { name: 'Gato', slug: 'gato', description: 'Todo para tu gato' },
    { name: 'Farmacia', slug: 'farmacia', description: 'Salud veterinaria' },
    { name: 'Pequeñas Mascotas', slug: 'pequenas-mascotas', description: 'Roedores, aves, reptiles' },
    { name: 'Peluquería', slug: 'peluqueria', description: 'Baño, corte e higiene' },
    { name: 'Ofertas', slug: 'ofertas', description: 'Productos con descuento' },
    { name: 'Marcas', slug: 'marcas', description: 'Filtra por marca' },
  ]

  const createdMain: Record<string, number> = {}
  for (const cat of mainCategories) {
    const created = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
    createdMain[cat.slug] = created.id
  }

  // Sub-categories for Perro
  for (const sub of [
    { name: 'Alimentos', slug: 'perro-alimentos' },
    { name: 'Accesorios', slug: 'perro-accesorios' },
    { name: 'Juguetes', slug: 'perro-juguetes' },
    { name: 'Higiene', slug: 'perro-higiene' },
    { name: 'Antiparasitarios', slug: 'perro-antiparasitarios' },
  ]) {
    await prisma.category.upsert({ where: { slug: sub.slug }, update: {}, create: { ...sub, parentId: createdMain['perro'] } })
  }

  // Sub-categories for Gato
  for (const sub of [
    { name: 'Alimentos', slug: 'gato-alimentos' },
    { name: 'Arena', slug: 'gato-arena' },
    { name: 'Juguetes', slug: 'gato-juguetes' },
    { name: 'Higiene', slug: 'gato-higiene' },
    { name: 'Antiparasitarios', slug: 'gato-antiparasitarios' },
  ]) {
    await prisma.category.upsert({ where: { slug: sub.slug }, update: {}, create: { ...sub, parentId: createdMain['gato'] } })
  }

  // Sub-categories for Pequeñas Mascotas
  for (const sub of [
    { name: 'Roedores', slug: 'pequenas-mascotas-roedores' },
    { name: 'Aves', slug: 'pequenas-mascotas-aves' },
    { name: 'Reptiles', slug: 'pequenas-mascotas-reptiles' },
    { name: 'Acuarios', slug: 'pequenas-mascotas-acuarios' },
  ]) {
    await prisma.category.upsert({ where: { slug: sub.slug }, update: {}, create: { ...sub, parentId: createdMain['pequenas-mascotas'] } })
  }

  console.log('✅ Categories seeded')

  // ── Products ─────────────────────────────────────────────────────────────────
  const royalCanin = await prisma.brand.findUnique({ where: { slug: 'royal-canin' } })
  const hills = await prisma.brand.findUnique({ where: { slug: 'hills' } })
  const purina = await prisma.brand.findUnique({ where: { slug: 'purina-pro-plan' } })
  const advance = await prisma.brand.findUnique({ where: { slug: 'advance' } })
  const eukanuba = await prisma.brand.findUnique({ where: { slug: 'eukanuba' } })
  const pedigree = await prisma.brand.findUnique({ where: { slug: 'pedigree' } })

  const getCat = (slug: string) => prisma.category.findUnique({ where: { slug } })
  const perroCat = await getCat('perro')
  const gatoCat = await getCat('gato')
  const farmaciaCat = await getCat('farmacia')
  const pequenasCat = await getCat('pequenas-mascotas')
  const perroAlimentos = await getCat('perro-alimentos')
  const perroAccesorios = await getCat('perro-accesorios')
  const perroJuguetes = await getCat('perro-juguetes')
  const perroHigiene = await getCat('perro-higiene')
  const perroAntiparasitarios = await getCat('perro-antiparasitarios')
  const gatoAlimentos = await getCat('gato-alimentos')
  const gatoArena = await getCat('gato-arena')
  const gatoJuguetes = await getCat('gato-juguetes')
  const gatoHigiene = await getCat('gato-higiene')
  const gatoAntiparasitarios = await getCat('gato-antiparasitarios')
  const roedores = await getCat('pequenas-mascotas-roedores')
  const aves = await getCat('pequenas-mascotas-aves')
  const reptiles = await getCat('pequenas-mascotas-reptiles')
  const acuarios = await getCat('pequenas-mascotas-acuarios')

  const products = [
    // ── Perro — Alimentos ────────────────────────────────────────────────────
    {
      slug: 'royal-canin-maxi-adult-15kg',
      name: 'Royal Canin Maxi Adult 15kg',
      description: 'Alimento completo para perros adultos de razas grandes. Fórmula enriquecida con antioxidantes.',
      price: 45990, salePrice: 38990, stock: 15, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: royalCanin!.id,
    },
    {
      slug: 'hills-science-diet-adulto-7kg',
      name: "Hill's Science Diet Adulto 7kg",
      description: 'Nutrición precisa para perros adultos. Con proteínas de alta calidad y omega-6.',
      price: 32990, salePrice: null, stock: 8, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: hills!.id,
    },
    {
      slug: 'purina-proplan-cachorro-3kg',
      name: 'Purina Pro Plan Cachorro 3kg',
      description: 'Fórmula especial para cachorros. Con DHA para el desarrollo cerebral.',
      price: 18990, salePrice: 15990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: purina!.id,
    },
    {
      slug: 'advance-adult-medium-12kg',
      name: 'Advance Adult Medium 12kg',
      description: 'Para perros adultos de razas medianas. Balance ideal de nutrientes.',
      price: 38500, salePrice: null, stock: 6, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1534361960057-19f4434a1fc6?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: advance!.id,
    },
    {
      slug: 'pedigree-vital-protection-15kg',
      name: 'Pedigree Vital Protection 15kg',
      description: 'Alimento completo con vitaminas y minerales esenciales para tu perro.',
      price: 22990, salePrice: 18990, stock: 12, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: pedigree!.id,
    },
    {
      slug: 'eukanuba-medium-breed-adult-12kg',
      name: 'Eukanuba Medium Breed Adult 12kg',
      description: 'Fórmula avanzada con DHA y antioxidantes para perros adultos de raza mediana.',
      price: 41990, salePrice: 34990, stock: 9, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
      categoryId: perroAlimentos!.id, brandId: eukanuba!.id,
    },
    // ── Perro — Accesorios ───────────────────────────────────────────────────
    {
      slug: 'collar-reflectante-ajustable-m',
      name: 'Collar Reflectante Ajustable M',
      description: 'Collar de nylon con franja reflectante, hebilla de liberación rápida. Talla M.',
      price: 8990, salePrice: null, stock: 30, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=80',
      categoryId: perroAccesorios!.id, brandId: null,
    },
    {
      slug: 'correa-retractil-5m',
      name: 'Correa Retráctil 5 metros',
      description: 'Correa retráctil de 5m con freno y botón de bloqueo. Para perros hasta 25kg.',
      price: 14990, salePrice: 11990, stock: 18, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
      categoryId: perroAccesorios!.id, brandId: null,
    },
    {
      slug: 'cama-ortopedica-perro-l',
      name: 'Cama Ortopédica Perro Talla L',
      description: 'Cama de espuma viscoelástica para perros grandes. Funda lavable.',
      price: 39990, salePrice: null, stock: 5, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
      categoryId: perroAccesorios!.id, brandId: null,
    },
    {
      slug: 'arnés-antitiron-perro-m',
      name: 'Arnés Antitirón Perro Talla M',
      description: 'Arnés ergonómico con sistema antitirón frontal. Ideal para adiestramiento.',
      price: 19990, salePrice: 15990, stock: 22, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80',
      categoryId: perroAccesorios!.id, brandId: null,
    },
    {
      slug: 'bebedero-automatico-perro-2l',
      name: 'Bebedero Automático 2 Litros',
      description: 'Bebedero automático de acero inoxidable con filtro de carbón activo.',
      price: 24990, salePrice: null, stock: 11, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1416339698674-4f118dd3388b?w=600&q=80',
      categoryId: perroAccesorios!.id, brandId: null,
    },
    // ── Perro — Juguetes ─────────────────────────────────────────────────────
    {
      slug: 'juguete-kong-classic-m',
      name: 'Kong Classic Talla M',
      description: 'Juguete de goma resistente rellenable con premios. El clásico favorito.',
      price: 12990, salePrice: null, stock: 25, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80',
      categoryId: perroJuguetes!.id, brandId: null,
    },
    {
      slug: 'pelota-tenis-pack-3',
      name: 'Set 3 Pelotas de Tenis',
      description: 'Pack de 3 pelotas de tenis aptas para perros. Resistentes y seguras.',
      price: 5990, salePrice: 3990, stock: 40, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
      categoryId: perroJuguetes!.id, brandId: null,
    },
    {
      slug: 'cuerda-dental-juguete-perro',
      name: 'Juguete Cuerda Dental',
      description: 'Cuerda de algodón multicolor para jugar y limpiar los dientes naturalmente.',
      price: 4990, salePrice: null, stock: 35, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
      categoryId: perroJuguetes!.id, brandId: null,
    },
    {
      slug: 'frisbee-goma-perro',
      name: 'Frisbee de Goma Natural',
      description: 'Disco volador de goma natural flexible y resistente a mordidas.',
      price: 7990, salePrice: 5990, stock: 28, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1569289430985-7f69f6df5a15?w=600&q=80',
      categoryId: perroJuguetes!.id, brandId: null,
    },
    // ── Perro — Higiene ──────────────────────────────────────────────────────
    {
      slug: 'shampoo-perro-avena-500ml',
      name: 'Shampoo Perro Avena 500ml',
      description: 'Shampoo suave con extracto de avena para pieles sensibles. pH neutro.',
      price: 8990, salePrice: 6990, stock: 22, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
      categoryId: perroHigiene!.id, brandId: null,
    },
    {
      slug: 'cepillo-slicker-perro-mediano',
      name: 'Cepillo Slicker Perro Mediano',
      description: 'Cepillo metálico para desenredar y eliminar pelo muerto. Mango ergonómico.',
      price: 11990, salePrice: null, stock: 16, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=80',
      categoryId: perroHigiene!.id, brandId: null,
    },
    {
      slug: 'cortaunas-perro-profesional',
      name: 'Cortaúñas Profesional para Perro',
      description: 'Cortaúñas de acero inoxidable con guarda de seguridad y sensor de tejido vivo.',
      price: 13990, salePrice: 10990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
      categoryId: perroHigiene!.id, brandId: null,
    },
    {
      slug: 'toallitas-higienicas-perro-x50',
      name: 'Toallitas Higiénicas Perro x50',
      description: 'Toallitas húmedas con aloe vera para limpieza rápida de patas y pelaje.',
      price: 4990, salePrice: null, stock: 45, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1416339698674-4f118dd3388b?w=600&q=80',
      categoryId: perroHigiene!.id, brandId: null,
    },
    // ── Perro — Antiparasitarios ─────────────────────────────────────────────
    {
      slug: 'collar-antipulgas-perro-8-meses',
      name: 'Collar Antipulgas Perro 8 meses',
      description: 'Collar antiparasitario de larga duración, protege hasta 8 meses contra pulgas y garrapatas.',
      price: 16990, salePrice: 13990, stock: 17, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=80',
      categoryId: perroAntiparasitarios!.id, brandId: null,
    },
    {
      slug: 'pipetas-antiparasitarias-perro-xl',
      name: 'Pipetas Antiparasitarias Perro XL (3u)',
      description: 'Pipetas spot-on para perros de más de 40kg. Actúan en 24h contra pulgas y garrapatas.',
      price: 21990, salePrice: null, stock: 14, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80',
      categoryId: perroAntiparasitarios!.id, brandId: null,
    },
    {
      slug: 'spray-antipulgas-perro-250ml',
      name: 'Spray Antipulgas Perro 250ml',
      description: 'Spray de aplicación directa para eliminar pulgas y garrapatas al instante.',
      price: 9990, salePrice: 7990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
      categoryId: perroAntiparasitarios!.id, brandId: null,
    },
    // ── Gato — Alimentos ─────────────────────────────────────────────────────
    {
      slug: 'royal-canin-indoor-adulto-2kg',
      name: 'Royal Canin Indoor Adulto 2kg',
      description: 'Para gatos adultos que viven en interior. Controla el peso y los hairballs.',
      price: 19990, salePrice: null, stock: 14, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
      categoryId: gatoAlimentos!.id, brandId: royalCanin!.id,
    },
    {
      slug: 'hills-science-diet-gato-sterilised-1-5kg',
      name: "Hill's Science Diet Sterilised 1.5kg",
      description: 'Fórmula para gatos castrados. Controla el peso y la salud urinaria.',
      price: 17990, salePrice: 14990, stock: 10, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
      categoryId: gatoAlimentos!.id, brandId: hills!.id,
    },
    {
      slug: 'purina-proplan-gato-adulto-3kg',
      name: 'Purina Pro Plan Gato Adulto 3kg',
      description: 'Alimento completo para gatos adultos con pollo como primer ingrediente.',
      price: 24990, salePrice: 19990, stock: 9, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&q=80',
      categoryId: gatoAlimentos!.id, brandId: purina!.id,
    },
    {
      slug: 'royal-canin-kitten-2kg',
      name: 'Royal Canin Kitten 2kg',
      description: 'Alimento para gatitos de hasta 12 meses. Refuerza el sistema inmune.',
      price: 18990, salePrice: 15990, stock: 12, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
      categoryId: gatoAlimentos!.id, brandId: royalCanin!.id,
    },
    // ── Gato — Arena ─────────────────────────────────────────────────────────
    {
      slug: 'arena-sanitaria-aglomerante-10kg',
      name: 'Arena Sanitaria Aglomerante 10kg',
      description: 'Arena de bentonita de alta absorción, aglomerante, control de olores.',
      price: 9990, salePrice: 7990, stock: 35, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
      categoryId: gatoArena!.id, brandId: null,
    },
    {
      slug: 'bandeja-sanitaria-con-tapa',
      name: 'Bandeja Sanitaria con Tapa',
      description: 'Caja de arena cerrada con filtro de carbón activo para eliminar olores.',
      price: 24990, salePrice: null, stock: 7, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=80',
      categoryId: gatoArena!.id, brandId: null,
    },
    {
      slug: 'pala-arena-gato-premium',
      name: 'Pala Arena Premium con Soporte',
      description: 'Pala de arena con mango largo y soporte vertical incluido.',
      price: 5990, salePrice: null, stock: 30, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&q=80',
      categoryId: gatoArena!.id, brandId: null,
    },
    // ── Gato — Juguetes ──────────────────────────────────────────────────────
    {
      slug: 'raton-peluche-gato-pack-3',
      name: 'Ratones de Peluche Pack x3',
      description: 'Set de 3 ratones de peluche con sonido crujiente. Estimulan el instinto de caza.',
      price: 5990, salePrice: 3990, stock: 40, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
      categoryId: gatoJuguetes!.id, brandId: null,
    },
    {
      slug: 'varita-plumas-gato',
      name: 'Varita Interactiva con Plumas',
      description: 'Varita telescópica de 50cm con plumas de colores. Ideal para juego interactivo.',
      price: 7990, salePrice: null, stock: 25, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
      categoryId: gatoJuguetes!.id, brandId: null,
    },
    {
      slug: 'tunel-gato-plegable',
      name: 'Túnel Plegable para Gato',
      description: 'Túnel de poliéster plegable de 90cm con ventanas y bola colgante interior.',
      price: 14990, salePrice: 11990, stock: 15, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&q=80',
      categoryId: gatoJuguetes!.id, brandId: null,
    },
    {
      slug: 'circuito-bolas-gato',
      name: 'Circuito de Bolas Interactivo',
      description: 'Circuito de pistas con 2 bolas giratorias, estimula la actividad física.',
      price: 9990, salePrice: 7990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=80',
      categoryId: gatoJuguetes!.id, brandId: null,
    },
    // ── Gato — Higiene ───────────────────────────────────────────────────────
    {
      slug: 'shampoo-gato-sin-enjuague-200ml',
      name: 'Shampoo Gato Sin Enjuague 200ml',
      description: 'Shampoo seco en espuma para gatos que no toleran el baño. De uso fácil.',
      price: 9990, salePrice: 7990, stock: 18, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
      categoryId: gatoHigiene!.id, brandId: null,
    },
    {
      slug: 'cepillo-dematizador-gato',
      name: 'Cepillo Dematizador para Gato',
      description: 'Elimina el subpelo muerto y reduce la formación de hairballs hasta un 90%.',
      price: 15990, salePrice: null, stock: 14, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&q=80',
      categoryId: gatoHigiene!.id, brandId: null,
    },
    {
      slug: 'limpiador-oidos-gato-50ml',
      name: 'Limpiador de Oídos Gato 50ml',
      description: 'Solución limpiadora suave para oídos de gatos. Elimina cera y suciedad.',
      price: 6990, salePrice: null, stock: 22, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
      categoryId: gatoHigiene!.id, brandId: null,
    },
    // ── Gato — Antiparasitarios ──────────────────────────────────────────────
    {
      slug: 'pipetas-antiparasitarias-gato-3u',
      name: 'Pipetas Antiparasitarias Gato x3',
      description: 'Pipetas spot-on específicas para gatos. Protegen contra pulgas y ácaros.',
      price: 16990, salePrice: 13990, stock: 16, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
      categoryId: gatoAntiparasitarios!.id, brandId: null,
    },
    {
      slug: 'collar-antipulgas-gato-8-meses',
      name: 'Collar Antipulgas Gato 8 meses',
      description: 'Collar antiparasitario de larga duración exclusivo para gatos.',
      price: 14990, salePrice: 11990, stock: 19, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
      categoryId: gatoAntiparasitarios!.id, brandId: null,
    },
    {
      slug: 'antiparasitario-interno-gato-tabletas',
      name: 'Antiparasitario Interno Gato x4',
      description: 'Comprimidos desparasitantes de amplio espectro para gatos adultos.',
      price: 11990, salePrice: null, stock: 24, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
      categoryId: gatoAntiparasitarios!.id, brandId: null,
    },
    // ── Farmacia ─────────────────────────────────────────────────────────────
    {
      slug: 'frontline-pipetas-perro-l',
      name: 'Frontline Pipetas Perro L (3 unidades)',
      description: 'Antiparasitario externo en pipetas. Elimina pulgas, garrapatas y piojos.',
      price: 18990, salePrice: 15990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80',
      categoryId: farmaciaCat!.id, brandId: null,
    },
    {
      slug: 'drontal-perros-tabletas-x4',
      name: 'Drontal Perros Tabletas x4',
      description: 'Antiparasitario interno de amplio espectro para perros. 4 tabletas.',
      price: 12990, salePrice: null, stock: 25, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
      categoryId: farmaciaCat!.id, brandId: null,
    },
    {
      slug: 'shampoo-veterinario-antipulgas-250ml',
      name: 'Shampoo Veterinario Antipulgas 250ml',
      description: 'Shampoo medicado con permetrina, elimina pulgas y garrapatas al baño.',
      price: 7990, salePrice: 5990, stock: 18, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
      categoryId: farmaciaCat!.id, brandId: null,
    },
    {
      slug: 'suplemento-articular-perro-gato',
      name: 'Suplemento Articular Perro/Gato 60 cáps',
      description: 'Condroitín y glucosamina para articulaciones. Apto para perros y gatos.',
      price: 19990, salePrice: 16990, stock: 13, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
      categoryId: farmaciaCat!.id, brandId: null,
    },
    {
      slug: 'colirio-veterinario-15ml',
      name: 'Colirio Veterinario 15ml',
      description: 'Solución oftálmica limpiadora para ojos de perros y gatos. Sin conservantes.',
      price: 8990, salePrice: null, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
      categoryId: farmaciaCat!.id, brandId: null,
    },
    // ── Pequeñas Mascotas — Roedores ─────────────────────────────────────────
    {
      slug: 'jaula-hamster-multicolor',
      name: 'Jaula Hámster con Accesorios',
      description: 'Jaula completa para hámster con rueda, bebedero y casita. Fácil de limpiar.',
      price: 29990, salePrice: 24990, stock: 8, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
      categoryId: roedores!.id, brandId: null,
    },
    {
      slug: 'alimento-hamster-cobayo-500g',
      name: 'Alimento Hámster y Cobayo 500g',
      description: 'Mezcla de granos y semillas para roedores pequeños. Nutricionalmente balanceado.',
      price: 4990, salePrice: null, stock: 30, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
      categoryId: roedores!.id, brandId: null,
    },
    {
      slug: 'rueda-ejercicio-hamster-silenciosa',
      name: 'Rueda de Ejercicio Silenciosa',
      description: 'Rueda de rodamiento silencioso para hámsters. Superficie antideslizante.',
      price: 8990, salePrice: 6990, stock: 15, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
      categoryId: roedores!.id, brandId: null,
    },
    // ── Pequeñas Mascotas — Aves ─────────────────────────────────────────────
    {
      slug: 'jaula-pajaros-mediana',
      name: 'Jaula para Pájaros Mediana',
      description: 'Jaula metálica con 2 perchas, bebedero y comedero. Para canarios y periquitos.',
      price: 34990, salePrice: 27990, stock: 6, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
      categoryId: aves!.id, brandId: null,
    },
    {
      slug: 'alimento-periquito-canario-1kg',
      name: 'Alimento Periquito/Canario 1kg',
      description: 'Mezcla de semillas seleccionadas para periquitos y canarios. Sin conservantes.',
      price: 6990, salePrice: null, stock: 25, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
      categoryId: aves!.id, brandId: null,
    },
    {
      slug: 'arenilla-aves-calcio-500g',
      name: 'Arenilla con Calcio para Aves 500g',
      description: 'Arenilla digestiva enriquecida con calcio. Esencial para la digestión de aves.',
      price: 3990, salePrice: null, stock: 40, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
      categoryId: aves!.id, brandId: null,
    },
    // ── Pequeñas Mascotas — Reptiles ─────────────────────────────────────────
    {
      slug: 'terrario-reptil-30x30x40',
      name: 'Terrario Reptiles 30x30x40cm',
      description: 'Terrario de cristal con tapa de rejilla y ventilación frontal.',
      price: 49990, salePrice: 41990, stock: 4, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
      categoryId: reptiles!.id, brandId: null,
    },
    {
      slug: 'lampara-uv-reptil-10w',
      name: 'Lámpara UV Reptiles 10W',
      description: 'Lámpara UVB 10% para reptiles. Esencial para metabolismo de calcio.',
      price: 19990, salePrice: null, stock: 9, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
      categoryId: reptiles!.id, brandId: null,
    },
    {
      slug: 'alimento-tortuga-acuatica-100g',
      name: 'Alimento Tortuga Acuática 100g',
      description: 'Palitos flotantes para tortugas acuáticas. Fórmula completa con vitaminas.',
      price: 5990, salePrice: 4490, stock: 22, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
      categoryId: reptiles!.id, brandId: null,
    },
    // ── Pequeñas Mascotas — Acuarios ─────────────────────────────────────────
    {
      slug: 'acuario-kit-inicio-20l',
      name: 'Acuario Kit Inicio 20 Litros',
      description: 'Kit completo: acuario + filtro + iluminación LED + termómetro.',
      price: 44990, salePrice: 37990, stock: 5, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&q=80',
      categoryId: acuarios!.id, brandId: null,
    },
    {
      slug: 'alimento-peces-tropicales-100g',
      name: 'Alimento Peces Tropicales 100g',
      description: 'Escamas de colores para peces tropicales. Enriquecido con vitaminas.',
      price: 4990, salePrice: null, stock: 35, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&q=80',
      categoryId: acuarios!.id, brandId: null,
    },
    // ── Perro general ────────────────────────────────────────────────────────
    {
      slug: 'transportador-perro-mediano',
      name: 'Transportador Perro Mediano',
      description: 'Jaula transportadora de plástico rígido homologada para vuelos. Hasta 10kg.',
      price: 49990, salePrice: 39990, stock: 4, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80',
      categoryId: perroCat!.id, brandId: null,
    },
    {
      slug: 'snacks-premio-dental-perro',
      name: 'Snacks Premio Dental 300g',
      description: 'Premios dentales en forma de hueso para limpiar dientes y refrescar el aliento.',
      price: 6990, salePrice: null, stock: 30, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&q=80',
      categoryId: perroCat!.id, brandId: null,
    },
    // ── Gato general ─────────────────────────────────────────────────────────
    {
      slug: 'rascador-torre-gato',
      name: 'Rascador Torre para Gato',
      description: 'Torre rascadora de 120cm con 3 niveles, cuerda de sisal y hamaca.',
      price: 54990, salePrice: 44990, stock: 6, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&q=80',
      categoryId: gatoCat!.id, brandId: null,
    },
    {
      slug: 'cama-gato-cueva-suave',
      name: 'Cama Cueva para Gato',
      description: 'Cama con forma de cueva para gatos. Interior de peluche suave y cálido.',
      price: 19990, salePrice: 15990, stock: 11, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=80',
      categoryId: gatoCat!.id, brandId: null,
    },
    // ── Pequeñas mascotas general ────────────────────────────────────────────
    {
      slug: 'correa-arnés-conejo',
      name: 'Correa y Arnés para Conejo',
      description: 'Arnés ajustable con correa para pasear conejos y cobayas con seguridad.',
      price: 7990, salePrice: 5990, stock: 20, isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
      categoryId: pequenasCat!.id, brandId: null,
    },
  ]

  for (const p of products) {
    const { categoryId, brandId, ...rest } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        images: [],
        category: { connect: { id: categoryId } },
        ...(brandId ? { brand: { connect: { id: brandId } } } : {}),
      },
    })
  }

  console.log(`✅ ${products.length} products seeded`)

  // ── Admin user ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@petshop.cl' },
    update: {},
    create: { email: 'admin@petshop.cl', password: adminPassword, name: 'Administrador' },
  })
  console.log('✅ Admin seeded (admin@petshop.cl / admin123)')
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
