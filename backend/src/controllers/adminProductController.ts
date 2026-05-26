import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

export const getAdminProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20)
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, brand: true },
      }),
      prisma.product.count(),
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
    const { name, slug, description, price, salePrice, stock, imageUrl, categoryId, brandId, isFeatured } =
      req.body as {
        name?: unknown
        slug?: unknown
        description?: unknown
        price?: unknown
        salePrice?: unknown
        stock?: unknown
        imageUrl?: unknown
        categoryId?: unknown
        brandId?: unknown
        isFeatured?: unknown
      }

    if (!name || !slug || price === undefined || price === null || stock === undefined || stock === null || !categoryId) {
      res.status(400).json({ error: 'name, slug, price, stock, and categoryId are required' })
      return
    }

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

    const { name, slug, description, price, salePrice, stock, imageUrl, images, isActive, isFeatured, categoryId, brandId } =
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
