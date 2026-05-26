import { useQuery } from '@tanstack/react-query'
import { fetchProducts, fetchProductBySlug, fetchCategories, fetchBrands, fetchRelatedProducts } from '@/services/productService'
import type { ProductFilters } from '@/types'

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  })

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

export const useBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  })

export const useRelatedProducts = (slug: string) =>
  useQuery({
    queryKey: ['related', slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: !!slug,
  })
