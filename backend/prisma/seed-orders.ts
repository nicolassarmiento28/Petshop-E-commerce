import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CUSTOMERS = [
  { name: 'María González', email: 'maria@example.com', phone: '+56911111111', address: 'Av. Providencia 1234, Santiago' },
  { name: 'Carlos Muñoz', email: 'carlos@example.com', phone: '+56922222222', address: 'Calle Los Leones 567, Ñuñoa' },
  { name: 'Ana Soto', email: 'ana@example.com', phone: '+56933333333', address: 'Pasaje El Arrayán 890, Vitacura' },
  { name: 'Pedro Ramírez', email: 'pedro@example.com', phone: '+56944444444', address: 'Av. Las Condes 2345, Las Condes' },
  { name: 'Javiera Torres', email: 'javiera@example.com', phone: '+56955555555', address: 'Calle Mercedes 678, Providencia' },
  { name: 'Diego Castro', email: 'diego@example.com', phone: '+56966666666', address: 'Av. Kennedy 9012, Las Condes' },
  { name: 'Valentina Rojas', email: 'vale@example.com', phone: '+56977777777', address: 'Calle Suecia 345, Providencia' },
  { name: 'Felipe Vega', email: 'felipe@example.com', phone: '+56988888888', address: 'Av. Apoquindo 6789, Las Condes' },
  { name: 'Camila Díaz', email: 'camila@example.com', phone: '+56999999999', address: 'Pasaje Los Olivos 123, La Reina' },
  { name: 'Matías Flores', email: 'matias@example.com', phone: '+56910101010', address: 'Calle Bilbao 456, Providencia' },
]

const STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

async function main() {
  const products = await prisma.product.findMany({ where: { isActive: true, stock: { gt: 0 } }, take: 30 })

  if (products.length === 0) {
    console.log('No active products with stock found')
    return
  }

  const orders = []
  const now = Date.now()

  for (let i = 0; i < 15; i++) {
    const customer = CUSTOMERS[i % CUSTOMERS.length]
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)
    const createdAt = new Date(now - hoursAgo * 3600000 - minutesAgo * 60000)

    const itemCount = Math.floor(Math.random() * 3) + 1
    const usedIds = new Set<number>()
    const items: { productId: number; quantity: number; unitPrice: number; subtotal: number }[] = []

    for (let j = 0; j < itemCount; j++) {
      let product = products[Math.floor(Math.random() * products.length)]
      let attempts = 0
      while (usedIds.has(product.id) && attempts < 5) {
        product = products[Math.floor(Math.random() * products.length)]
        attempts++
      }
      usedIds.add(product.id)
      const qty = Math.floor(Math.random() * 2) + 1
      const unitPrice = product.salePrice ?? product.price
      items.push({ productId: product.id, quantity: qty, unitPrice, subtotal: unitPrice * qty })
    }

    const total = items.reduce((s, i) => s + i.subtotal, 0)
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
    const orderNumber = `ORD-${now + i}`

    orders.push({ customer, createdAt, orderNumber, total, status, items })
  }

  console.log(`Creating ${orders.length} orders...`)

  for (const o of orders) {
    await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        customerEmail: o.customer.email,
        customerPhone: o.customer.phone,
        shippingAddress: o.customer.address,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        items: { create: o.items },
      },
    })
  }

  console.log('Done. Orders created:')
  for (const o of orders) {
    console.log(`  ${o.orderNumber} — ${o.customer.name} — $${o.total} — ${o.status} — ${o.createdAt.toISOString()}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
