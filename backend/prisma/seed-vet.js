const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SERVICES = [
  { name: 'Consulta general', durationMin: 30, price: 18000 },
  { name: 'Vacunación', durationMin: 20, price: 15000 },
  { name: 'Chequeo completo', durationMin: 45, price: 28000 },
  { name: 'Peluquería completa', durationMin: 60, price: 22000 },
  { name: 'Baño', durationMin: 40, price: 14000 },
  { name: 'Corte de uñas', durationMin: 15, price: 6000 },
  { name: 'Desparasitación', durationMin: 15, price: 10000 },
  { name: 'Certificado de salud (viajes)', durationMin: 20, price: 20000 },
  { name: 'Chip de identificación', durationMin: 20, price: 12000 },
]

// Lunes(1) a Viernes(5): 09:00-18:00 · Sábado(6): 09:00-14:00 · Domingo(0): sin atención
const AVAILABILITY = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
]

async function seedVet() {
  for (const service of SERVICES) {
    const existing = await prisma.vetService.findFirst({ where: { name: service.name } })
    if (existing) {
      await prisma.vetService.update({ where: { id: existing.id }, data: { ...service, isActive: true } })
    } else {
      await prisma.vetService.create({ data: { ...service, isActive: true } })
    }
  }
  console.log(`✅ ${SERVICES.length} vet services seeded`)

  for (const slot of AVAILABILITY) {
    const existing = await prisma.vetAvailability.findFirst({ where: { dayOfWeek: slot.dayOfWeek } })
    if (existing) {
      await prisma.vetAvailability.update({ where: { id: existing.id }, data: { ...slot, isActive: true } })
    } else {
      await prisma.vetAvailability.create({ data: { ...slot, isActive: true } })
    }
  }
  console.log('✅ Vet recurring availability seeded (Lun-Vie 09:00-18:00, Sáb 09:00-14:00, Dom sin atención)')
}

seedVet()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
