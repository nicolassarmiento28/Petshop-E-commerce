import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      category,
      brand,
      sale,
      search,
      featured,
      sort,
      cursor,
      limit = '20',
    } = req.query as Record<string, string | undefined>

    const take = Math.min(parseInt(limit ?? '20', 10), 100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }
    if (brand) {
      where.brand = { slug: brand }
    }
    if (sale === 'true') {
      where.salePrice = { not: null }
    }
    if (featured === 'true') {
      where.isFeatured = true
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const sortOptions: Record<string, object> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
    }
    const orderBy = sort && sortOptions[sort] ? sortOptions[sort] : { createdAt: 'desc' }

    const products = await prisma.product.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: parseInt(cursor, 10) } } : {}),
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    })

    const nextCursor =
      products.length === take ? products[products.length - 1].id : null

    res.json({ products, nextCursor })
  } catch (error) {
    next(error)
  }
}

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params['slug'] as string },
      include: {
        category: true,
        brand: true,
      },
    })
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = req.params['slug'] as string

    const current = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, isActive: true, categoryId: true, brandId: true },
    })

    if (!current || !current.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: current.id },
        OR: [
          { categoryId: current.categoryId },
          ...(current.brandId !== null ? [{ brandId: current.brandId }] : []),
        ],
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    })

    res.json(related)
  } catch (error) {
    next(error)
  }
}
