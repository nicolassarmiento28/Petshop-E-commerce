import { prisma } from '../lib/prisma'

interface TimeWindow {
  startTime: string
  endTime: string
}

/**
 * Parsea una fecha "YYYY-MM-DD" como medianoche LOCAL, no UTC — `new Date('2026-07-06')`
 * parsea como UTC y se corre al día calendario anterior en timezones negativos (ej. Chile).
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10))
  return new Date(year, month - 1, day)
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10))
  return h * 60 + m
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function dayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

/** Subtracts a blocked window from a list of open windows, splitting windows as needed. */
function subtractWindow(windows: TimeWindow[], blocked: TimeWindow): TimeWindow[] {
  const blockedStart = toMinutes(blocked.startTime)
  const blockedEnd = toMinutes(blocked.endTime)
  const result: TimeWindow[] = []

  for (const w of windows) {
    const wStart = toMinutes(w.startTime)
    const wEnd = toMinutes(w.endTime)

    if (blockedEnd <= wStart || blockedStart >= wEnd) {
      // No overlap
      result.push(w)
      continue
    }
    if (blockedStart > wStart) {
      result.push({ startTime: w.startTime, endTime: toTimeString(Math.min(blockedStart, wEnd)) })
    }
    if (blockedEnd < wEnd) {
      result.push({ startTime: toTimeString(Math.max(blockedEnd, wStart)), endTime: w.endTime })
    }
  }

  return result
}

/**
 * Calcula los slots disponibles para un servicio en una fecha dada:
 * disponibilidad recurrente (VetAvailability) menos excepciones bloqueadas
 * más excepciones extra, menos citas ya reservadas (PENDING/CONFIRMED),
 * dividido en bloques según la duración del servicio.
 */
export async function getAvailableSlots(date: Date, serviceId: number): Promise<string[]> {
  const service = await prisma.vetService.findUnique({ where: { id: serviceId } })
  if (!service || !service.isActive) return []

  const { start, end } = dayRange(date)
  const dayOfWeek = date.getDay()

  const [recurring, exceptions, existingAppointments] = await Promise.all([
    prisma.vetAvailability.findMany({ where: { dayOfWeek, isActive: true } }),
    prisma.vetException.findMany({ where: { date: { gte: start, lt: end } } }),
    prisma.appointment.findMany({
      where: {
        date: { gte: start, lt: end },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
  ])

  if (exceptions.some((e) => e.type === 'BLOCKED_FULL_DAY')) return []

  let windows: TimeWindow[] = recurring.map((r) => ({ startTime: r.startTime, endTime: r.endTime }))

  for (const exc of exceptions) {
    if (exc.type === 'EXTRA_SLOT' && exc.startTime && exc.endTime) {
      windows.push({ startTime: exc.startTime, endTime: exc.endTime })
    }
  }

  for (const exc of exceptions) {
    if (exc.type === 'BLOCKED_SLOT' && exc.startTime && exc.endTime) {
      windows = subtractWindow(windows, { startTime: exc.startTime, endTime: exc.endTime })
    }
  }

  const duration = service.durationMin
  const slots: string[] = []

  for (const w of windows) {
    let cursor = toMinutes(w.startTime)
    const windowEnd = toMinutes(w.endTime)
    while (cursor + duration <= windowEnd) {
      slots.push(toTimeString(cursor))
      cursor += duration
    }
  }

  const bookedRanges = existingAppointments.map((a) => ({
    start: toMinutes(a.startTime),
    end: toMinutes(a.endTime),
  }))

  const availableSlots = slots.filter((slot) => {
    const slotStart = toMinutes(slot)
    const slotEnd = slotStart + duration
    return !bookedRanges.some((b) => slotStart < b.end && slotEnd > b.start)
  })

  return [...new Set(availableSlots)].sort((a, b) => toMinutes(a) - toMinutes(b))
}
