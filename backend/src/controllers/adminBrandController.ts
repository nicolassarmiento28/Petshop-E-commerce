import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'
import { z, ZodError } from 'zod'

const createBrandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional().or(z.literal('')),
  sku: z.string().optional(),
})

export const getBrands = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit
    const search = req.query.search ? String(req.query.search) : undefined

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    res.json({ brands, total, page, totalPages })
  } catch (error) {
    next(error)
  }
}

export const createBrand = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let parsed: { name: string; slug: string; logoUrl?: string; sku?: string }
    try {
      parsed = createBrandSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors.map(e => e.message).join(', ') })
        return
      }
      throw error
    }
    const { name, slug, logoUrl, sku } = parsed

    const existing = await prisma.brand.findUnique({ where: { slug: String(slug) } })
    if (existing) {
      res.status(409).json({ error: 'Slug already exists' })
      return
    }

    const brand = await prisma.brand.create({
      data: {
        name: String(name),
        slug: String(slug),
        logoUrl: logoUrl !== undefined && logoUrl !== '' ? String(logoUrl) : undefined,
        sku: sku !== undefined && sku !== '' ? String(sku) : undefined,
      },
    })

    res.status(201).json(brand)
  } catch (error) {
    next(error)
  }
}

export const updateBrand = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.brand.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }

    const { name, slug, logoUrl, sku } = req.body as Record<string, unknown>

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(slug !== undefined && { slug: String(slug) }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl !== null && logoUrl !== '' ? String(logoUrl) : null }),
        ...(sku !== undefined && { sku: sku !== null && sku !== '' ? String(sku) : null }),
      },
    })

    res.json(brand)
  } catch (error) {
    next(error)
  }
}

// Brand keyword matching — same logic as seed-brands.ts
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
  'Churu': ['churu'],
  'Advance': ['advance'],
  'Eukanuba': ['eukanuba'],
  'Pedigree': ['pedigree'],
  'SuperZoo': ['superzoo'],
  'Pet Wippi': ['pet wippi'],
  'Naturalistic': ['naturalistic'],
  'Catit': ['catit'],
  'Furminator': ['furminator'],
  'Bravecto': ['bravecto'],
  'Comfort': ['comfort rope', 'comfort skinny'],
  'Feliway': ['feliway'],
  'Frontline': ['frontline'],
  'Kong': ['kong'],
  'Nath': ['nath'],
  'Salvaje': ['salvaje'],
  'Mpets': ['mpets'],
  'Leeby': ['leeby'],
  'Tootoy': ['tootoy'],
  'Fit Formula': ['fit formula'],
  'Dogxtreme': ['dogxtreme'],
  'Dingo': ['dingo'],
  'Rahue': ['rahue'],
  'Wanpy': ['wanpy'],
  'Acana': ['acana'],
  'Applaws': ['applaws'],
  'Bravery': ['bravery'],
  'Vitakraft': ['vitakraft'],
  'Ama': ['ama alimento'],
  'Gotoo': ['gotoo'],
  'Outech': ['outech'],
  'My Zoo': ['my zoo'],
  'Nexgard': ['nexgard'],
  'Simparica': ['simparica'],
  'Leonardo': ['leonardo'],
  'Belcando': ['belcando'],
  'Wellness Core': ['wellness core'],
  'Zeedog': ['zeedog'],
  'Amity': ['amity'],
  'Dogzilla': ['dogzilla'],
  'Catzilla': ['catzilla'],
  'Tk Pet': ['tk pet'],
  'Nice Care': ['nice care'],
  'Natural & Delicious': ['natural & delicious', 'n&d'],
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

function findBrand(name: string, brandSlugMap: Map<string, { id: number; name: string }>): { id: number; name: string } | null {
  const normalized = normalize(name)
  for (const [brandName, keywords] of Object.entries(BRAND_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        const found = brandSlugMap.get(brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
        if (found) return found
        break
      }
    }
  }
  return null
}

export const autoAssignBrands = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany()
    const slugMap = new Map<string, { id: number; name: string }>()
    for (const b of brands) {
      slugMap.set(b.slug, { id: b.id, name: b.name })
    }

    const products = await prisma.product.findMany({
      where: { brandId: null, isActive: true },
      select: { id: true, name: true },
    })

    let assigned = 0
    const results: { id: number; name: string; brand: string }[] = []

    for (const product of products) {
      const match = findBrand(product.name, slugMap)
      if (match) {
        await prisma.product.update({
          where: { id: product.id },
          data: { brandId: match.id },
        })
        assigned++
        results.push({ id: product.id, name: product.name, brand: match.name })
      }
    }

    res.json({
      assigned,
      total: products.length,
      remaining: products.length - assigned,
      details: results,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteBrand = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.brand.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }

    await prisma.brand.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'P2003'
    ) {
      res.status(409).json({ error: 'Cannot delete brand with associated products' })
      return
    }
    next(error)
  }
}
