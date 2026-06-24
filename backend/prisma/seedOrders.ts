import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CUSTOMERS = [
  { name: 'Carlos Muñoz', email: 'carlos@mail.cl' },
  { name: 'María González', email: 'maria@mail.cl' },
  { name: 'Pedro Soto', email: 'pedro@mail.cl' },
  { name: 'Ana López', email: 'ana@mail.cl' },
  { name: 'José Rojas', email: 'jose@mail.cl' },
  { name: 'Francisca Díaz', email: 'francisca@mail.cl' },
  { name: 'Miguel Ángel Ruiz', email: 'miguel@mail.cl' },
  { name: 'Carmen Vera', email: 'carmen@mail.cl' },
  { name: 'Pablo Torres', email: 'pablo@mail.cl' },
  { name: 'Valentina Castro', email: 'valentina@mail.cl' },
  { name: 'Felipe Contreras', email: 'felipe@mail.cl' },
  { name: 'Daniela Morales', email: 'daniela@mail.cl' },
  { name: 'Andrés Fuentes', email: 'andres@mail.cl' },
  { name: 'Javiera Herrera', email: 'javiera@mail.cl' },
  { name: 'Rodrigo Vargas', email: 'rodrigo@mail.cl' },
]

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Seeding 25 orders...')

  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, price: true, salePrice: true, stock: true },
  })

  if (products.length === 0) {
    console.error('No active products with stock found')
    process.exit(1)
  }

  const now = Date.now()

  for (let i = 0; i < 25; i++) {
    const customer = pick(CUSTOMERS)
    const status = pick(STATUSES)
    // Stagger createdAt over the last 24 hours
    const createdAt = new Date(now - randomInt(0, 86400000))

    // Pick 1-3 products for this order
    const itemCount = randomInt(1, 3)
    const selectedProducts: typeof products = []
    const usedIndices = new Set<number>()

    for (let j = 0; j < itemCount; j++) {
      let idx: number
      let attempts = 0
      do {
        idx = randomInt(0, products.length - 1)
        attempts++
      } while (usedIndices.has(idx) && attempts < 20)
      usedIndices.add(idx)
      selectedProducts.push(products[idx])
    }

    const items = selectedProducts.map((p) => ({
      productId: p.id,
      quantity: randomInt(1, 2),
      unitPrice: p.salePrice ?? p.price,
    }))

    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const orderNumber = `ORD-${now}-${String(i).padStart(2, '0')}`

    await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: `+569${String(randomInt(10000000, 99999999))}`,
          shippingAddress: `Dirección ${randomInt(100, 9999)}, Santiago`,
          total,
          status,
          createdAt,
          updatedAt: createdAt,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.unitPrice * item.quantity,
            })),
          },
        },
      }),
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    ])

    console.log(`  ✅ Order ${orderNumber} — ${customer.name} — $${total.toLocaleString('es-CL')} — ${status}`)
  }

  console.log('🎉 Done! 25 orders created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
