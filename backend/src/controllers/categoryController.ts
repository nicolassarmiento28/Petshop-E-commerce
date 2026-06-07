import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          select: { id: true, name: true, slug: true, imageUrl: true },
        },
      },
      orderBy: { name: 'asc' },
    })
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        children: {
          select: { id: true, name: true, slug: true, imageUrl: true },
        },
        parent: { select: { id: true, name: true, slug: true } },
      },
    })
    if (!category) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    res.json(category)
  } catch (error) {
    next(error)
  }
}

export const getPublicBrands = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({ where: { logoUrl: { not: null } }, orderBy: { name: 'asc' } })
    res.json(brands)
  } catch (error) {
    next(error)
  }
}
