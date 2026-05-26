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

export const getBrands = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
    res.json(brands)
  } catch (error) {
    next(error)
  }
}
