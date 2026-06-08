import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'
import { z, ZodError } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  description: z.string().optional(),
  salePrice: z.number().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.number(),
  brandId: z.number().optional(),
  isFeatured: z.boolean().optional(),
  sizeGroup: z.string().optional(),
})

export const getAdminProducts = async (
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
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, brand: true },
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    res.json({ products, total, page, totalPages })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let parsed: { name: string; slug: string; price: number; stock: number; description?: string; salePrice?: number; imageUrl?: string; categoryId: number; brandId?: number; isFeatured?: boolean; sizeGroup?: string }
    try {
      parsed = createProductSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors.map(e => e.message).join(', ') })
        return
      }
      throw error
    }
    const { name, slug, description, price, salePrice, stock, imageUrl, categoryId, brandId, isFeatured, sizeGroup } = parsed

    const existing = await prisma.product.findUnique({ where: { slug: String(slug) } })
    if (existing) {
      res.status(409).json({ error: 'Slug already exists' })
      return
    }

    const product = await prisma.product.create({
      data: {
        name: String(name),
        slug: String(slug),
        description: description !== undefined ? String(description) : undefined,
        price: Number(price),
        salePrice: salePrice !== undefined && salePrice !== null ? Number(salePrice) : undefined,
        stock: Number(stock),
        imageUrl: imageUrl !== undefined ? String(imageUrl) : undefined,
        images: [],
        isActive: true,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
        categoryId: Number(categoryId),
        brandId: brandId !== undefined && brandId !== null ? Number(brandId) : undefined,
        sizeGroup: sizeGroup !== undefined && sizeGroup !== '' ? String(sizeGroup) : undefined,
      },
      include: { category: true, brand: true },
    })

    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const { name, slug, description, price, salePrice, stock, imageUrl, images, isActive, isFeatured, categoryId, brandId, sizeGroup } =
      req.body as Record<string, unknown>

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(slug !== undefined && { slug: String(slug) }),
        ...(description !== undefined && { description: String(description) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice !== null ? Number(salePrice) : null }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl !== null ? String(imageUrl) : null }),
        ...(images !== undefined && { images: images as string[] }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
        ...(brandId !== undefined && { brandId: brandId !== null ? Number(brandId) : null }),
        ...(sizeGroup !== undefined && { sizeGroup: sizeGroup !== null ? String(sizeGroup) : null }),
      },
      include: { category: true, brand: true },
    })

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    await prisma.product.update({ where: { id }, data: { isActive: false } })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const getLowStockProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const threshold = parseInt(String(_req.query.threshold ?? '5'), 10) || 5

    const products = await prisma.product.findMany({
      where: { isActive: true, stock: { lte: threshold } },
      orderBy: { stock: 'asc' },
      take: 20,
      include: { category: { select: { name: true } } },
    })

    res.json({ products, total: products.length })
  } catch (error) {
    next(error)
  }
}

export const getTopSellingProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const top = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    })

    const ids = top.map((t) => t.productId)
    const products =
      ids.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, price: true, imageUrl: true, slug: true },
          })
        : []

    const map = Object.fromEntries(products.map((p) => [p.id, p]))
    const result = top.map((t) => ({
      product: map[t.productId] ?? null,
      totalSold: t._sum.quantity ?? 0,
    }))

    res.json(result)
  } catch (error) {
    next(error)
  }
}
