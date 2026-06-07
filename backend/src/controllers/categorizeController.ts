import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

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
  { parentSlug: 'perro', subId: 7, patterns: ['alimento para perro', 'alimento humedo para perro', 'premio para perro', 'snack para perro', 'nutrition', 'adult', 'puppy', 'senior', 'cachorro', 'alimento', 'comida', 'croquetas', 'balanceado'] },
  { parentSlug: 'perro', subId: 8, patterns: ['arnes', 'collar', 'correa', 'cama', 'comedero', 'bebedero', 'bowl', 'plato', 'transportador', 'jaula', 'bolso', 'mochila', 'identificacion', 'placa'] },
  { parentSlug: 'perro', subId: 9, patterns: ['juguete', 'pelota', 'bola', 'kong', 'mordedor', 'soga', 'frisbee', 'cuerda', 'sonido', 'squeaky', 'tug'] },
  { parentSlug: 'perro', subId: 10, patterns: ['shampoo', 'cepillo', 'cortaunas', 'perfume', 'desodorante', 'toalla', 'peine', 'higiene', 'lava', 'banio', 'limpieza'] },
  { parentSlug: 'perro', subId: 11, patterns: ['antiparasitario', 'pipeta', 'pulgas', 'garrapatas', 'frontline', 'revolution', 'advantage', 'bravecto', 'nexgard', 'drontal', 'simparica', 'seresto', 'parasiticida'] },
  { parentSlug: 'gato', subId: 12, patterns: ['alimento para gato', 'alimento humedo para gato', 'snack para gato', 'premio para gato', 'comida para gato', 'churu', 'catxtreme', 'applaws', 'bravery cat', 'alimento'] },
  { parentSlug: 'gato', subId: 13, patterns: ['arena', 'litter', 'sand', 'america litter'] },
  { parentSlug: 'gato', subId: 14, patterns: ['juguete', 'catnip', 'raton', 'ratones', 'pluma', 'varita', 'bola', 'pelota', 'charmy'] },
  { parentSlug: 'gato', subId: 15, patterns: ['shampoo', 'cepillo', 'cortaunas', 'peine', 'higiene', 'banio', 'limpieza'] },
  { parentSlug: 'gato', subId: 16, patterns: ['antiparasitario', 'pipeta', 'pulgas', 'garrapatas', 'frontline', 'revolution', 'advantage', 'bravecto', 'nexgard', 'drontal', 'simparica', 'seresto', 'parasiticida'] },
]

export const reassignCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany()
    const catMap = new Map(categories.map((c) => [c.slug, c]))
    let totalUpdated = 0
    const results: string[] = []

    for (const rule of SUBCATEGORY_RULES) {
      const parentCat = catMap.get(rule.parentSlug)
      if (!parentCat) continue

      const products = await prisma.product.findMany({
        where: { categoryId: parentCat.id, isActive: true },
        orderBy: { id: 'asc' },
      })

      if (products.length === 0) continue

      const matched: number[] = []

      for (const product of products) {
        const normalized = normalize(product.name)
        if (rule.patterns.some((p) => normalized.includes(p))) {
          matched.push(product.id)
        }
      }

      if (matched.length > 0) {
        const result = await prisma.product.updateMany({
          where: { id: { in: matched } },
          data: { categoryId: rule.subId },
        })
        totalUpdated += result.count
        results.push(`✅ ${rule.parentSlug} → sub ${rule.subId}: ${result.count} products`)
      }
    }

    res.json({ ok: true, updated: totalUpdated, details: results })
  } catch (error) {
    next(error)
  }
}
