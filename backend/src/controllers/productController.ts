import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

interface VariantItem {
  id: number
  name: string
  slug: string
  price: number
  salePrice: number | null
  stock: number
  imageUrl: string | null
  sizeLabel: string
}

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
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true, children: { select: { id: true } } },
      })
      const ids = cat ? [cat.id, ...cat.children.map((c) => c.id)] : []
      where.categoryId = { in: ids }
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

    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined
    if (minPrice !== undefined) {
      where.AND = [
        ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
        { OR: [
          { price: { gte: minPrice } },
          { salePrice: { gte: minPrice } },
        ]},
      ]
    }
    if (maxPrice !== undefined) {
      where.AND = [
        ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
        { OR: [
          { price: { lte: maxPrice } },
          { salePrice: { lte: maxPrice } },
        ]},
      ]
    }

    const sortOptions: Record<string, object> = {
      name_asc: { name: 'asc' },
      name_desc: { name: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
    }
    const orderBy = sort && sortOptions[sort] ? sortOptions[sort] : { name: 'asc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        ...(cursor ? { skip: 1, cursor: { id: parseInt(cursor, 10) } } : {}),
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    const nextCursor =
      products.length === take ? products[products.length - 1].id : null

    // total = full matching count regardless of cursor position
    res.json({ products, nextCursor, total })
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

    let variants: VariantItem[] | undefined
    if (product.sizeGroup) {
      const siblings = await prisma.product.findMany({
        where: { sizeGroup: product.sizeGroup, isActive: true },
        select: { id: true, name: true, slug: true, price: true, salePrice: true, stock: true, imageUrl: true },
        orderBy: { name: 'asc' },
      })

      const sizeLabelRegex = /(\d+(?:\.\d+)?)\s*kg/i
      variants = siblings
        .map((s) => ({
          ...s,
          sizeLabel: s.name.match(sizeLabelRegex)?.[0]?.toLowerCase() ?? s.name,
        }))
        .sort((a, b) => {
          const aNum = parseFloat(a.sizeLabel)
          const bNum = parseFloat(b.sizeLabel)
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
          return a.sizeLabel.localeCompare(b.sizeLabel)
        })
    }

    res.json({ ...product, variants })
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
