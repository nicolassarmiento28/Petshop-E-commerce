const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedOrders() {
  const existingOrders = await prisma.order.count()
  if (existingOrders > 0) {
    console.log('Orders already exist, skipping order seed')
    return
  }

  const products = await prisma.product.findMany({ where: { isActive: true } })
  if (products.length === 0) {
    console.log('No products found, skipping orders')
    return
  }

  const customers = [
    { name: 'María González', email: 'maria.gonzalez@gmail.com', phone: '+56912345678', address: 'Av. Providencia 1234, Santiago' },
    { name: 'Carlos Muñoz', email: 'carlos.munoz@yahoo.com', phone: '+56923456789', address: 'Los Olivos 567, Viña del Mar' },
    { name: 'Ana Soto', email: 'ana.soto@hotmail.com', phone: '+56934567890', address: 'Calle del Sol 890, Valparaíso' },
    { name: 'Pedro Ramírez', email: 'pedro.ramirez@gmail.com', phone: '+56945678901', address: 'Av. Alemania 234, Temuco' },
    { name: 'Laura Fernández', email: 'laura.fernandez@outlook.com', phone: '+56956789012', address: 'Los Laureles 678, Concepción' },
    { name: 'Diego Torres', email: 'diego.torres@gmail.com', phone: '+56967890123', address: 'Av. España 901, Antofagasta' },
    { name: 'Valentina Martínez', email: 'valentina.mtz@yahoo.com', phone: '+56978901234', address: 'San Martín 345, La Serena' },
    { name: 'Felipe Castro', email: 'felipe.castro@gmail.com', phone: '+56989012345', address: "O'Higgins 123, Rancagua" },
    { name: 'Carolina Lagos', email: 'carolina.lagos@hotmail.com', phone: '+56990123456', address: 'Av. Los Pinos 456, Puerto Varas' },
    { name: 'Javier Villanueva', email: 'javier.villa@gmail.com', phone: '+56901234567', address: 'Calle Larga 789, Chillán' },
    { name: 'Isidora Paz', email: 'isidora.paz@outlook.com', phone: '+56911223344', address: 'Av. Matta 234, Santiago' },
    { name: 'Tomás Rojas', email: 'tomas.rojas@gmail.com', phone: '+56922334455', address: 'Los Ciruelos 567, Maipú' },
    { name: 'Francisca Díaz', email: 'francisca.diaz@yahoo.com', phone: '+56933445566', address: 'Av. Kennedy 890, Las Condes' },
    { name: 'Matías Herrera', email: 'matias.herrera@gmail.com', phone: '+56944556677', address: 'Calle del Parque 123, Providencia' },
    { name: 'Camila Torres', email: 'camila.torres@hotmail.com', phone: '+56955667788', address: 'Los Almendros 456, Ñuñoa' },
    { name: 'Benjamín Soto', email: 'benjamin.soto@gmail.com', phone: '+56966778899', address: 'Av. Macul 789, Macul' },
    { name: 'Antonia Vega', email: 'antonia.vega@outlook.com', phone: '+56977889900', address: 'San Diego 234, Santiago Centro' },
    { name: 'Sebastián Mora', email: 'sebastian.mora@gmail.com', phone: '+56988990011', address: 'Los Olmos 567, La Florida' },
    { name: 'Emilia Rivas', email: 'emilia.rivas@yahoo.com', phone: '+56999001122', address: 'Av. Vicuña Mackenna 890, Puente Alto' },
    { name: 'Gabriel Fuentes', email: 'gabriel.fuentes@gmail.com', phone: '+56910111213', address: 'Calle Real 345, San Bernardo' },
  ]

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const orderCount = 50

  for (let i = 0; i < orderCount; i++) {
    const daysAgo = Math.random() * 30
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(randInt(8, 22), randInt(0, 59), randInt(0, 59))

    const customer = pickRandom(customers)
    const itemCount = randInt(1, 4)
    const selectedProducts = Array.from({ length: itemCount }, () => pickRandom(products))
    const unique = [...new Map(selectedProducts.map((p) => [p.id, p])).values()]

    const items = unique.map((p) => {
      const qty = randInt(1, 3)
      const unitPrice = p.salePrice ?? p.price
      return { productId: p.id, quantity: qty, unitPrice, subtotal: unitPrice * qty }
    })

    const total = Math.round(items.reduce((s, i) => s + i.subtotal, 0))
    const orderNumber = `PS-${String(1001 + i)}`

    let status
    if (daysAgo < 1) {
      status = Math.random() < 0.5 ? 'PENDING' : pickRandom(['PAID', 'PROCESSING'])
    } else if (daysAgo < 3) {
      status = pickRandom(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'CANCELLED'])
    } else if (daysAgo < 7) {
      status = pickRandom(['SHIPPED', 'DELIVERED', 'PAID', 'CANCELLED'])
    } else if (daysAgo < 15) {
      status = pickRandom(['DELIVERED', 'CANCELLED', 'REFUNDED', 'PAID'])
    } else {
      status = pickRandom(['DELIVERED', 'CANCELLED', 'REFUNDED'])
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status,
        total,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        createdAt,
        items: { create: items },
      },
    })

    if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          status: 'APPROVED',
          tbkToken: `tbk_token_${order.id}`,
          tbkBuyOrder: `buy_order_${order.id}`,
          tbkSessionId: `session_${order.id}`,
          tbkAmount: total,
          tbkAuthCode: String(randInt(100000, 999999)),
          tbkResponseCode: 0,
          tbkCardNumber: `**** **** **** ${String(randInt(1000, 9999))}`,
        },
      })
    } else if (status === 'CANCELLED' && Math.random() < 0.5) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          tbkToken: `tbk_token_${order.id}`,
          tbkBuyOrder: `buy_order_${order.id}`,
          tbkSessionId: `session_${order.id}`,
          tbkAmount: total,
        },
      })
    }
  }

  console.log(`✅ ${orderCount} orders seeded`)

  // Reduce stock on some products for low-stock alerts
  const targetProducts = products.slice(0, 6)
  for (const p of targetProducts) {
    await prisma.product.update({
      where: { id: p.id },
      data: { stock: randInt(1, 3) },
    })
  }
  console.log('✅ 6 low-stock products created')
}

seedOrders()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
