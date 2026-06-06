import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

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
    const { name, slug, logoUrl } = req.body as {
      name?: unknown
      slug?: unknown
      logoUrl?: unknown
    }

    if (!name || !slug) {
      res.status(400).json({ error: 'name and slug are required' })
      return
    }

    const existing = await prisma.brand.findUnique({ where: { slug: String(slug) } })
    if (existing) {
      res.status(409).json({ error: 'Slug already exists' })
      return
    }

    const brand = await prisma.brand.create({
      data: {
        name: String(name),
        slug: String(slug),
        logoUrl: logoUrl !== undefined ? String(logoUrl) : undefined,
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

    const { name, slug, logoUrl } = req.body as Record<string, unknown>

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(slug !== undefined && { slug: String(slug) }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl !== null ? String(logoUrl) : null }),
      },
    })

    res.json(brand)
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
