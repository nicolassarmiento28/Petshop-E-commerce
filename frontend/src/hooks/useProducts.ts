import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductBySlug,
  fetchCategories,
  fetchBrands,
  fetchRelatedProducts,
  fetchPriceRange,
} from '@/services/productService'
import type { ProductsResponse } from '@/services/productService'
import type { ProductFilters } from '@/types'

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })

export const useProductsInfinite = (filters: Omit<ProductFilters, 'cursor'>) =>
  useInfiniteQuery<
    ProductsResponse,
    Error,
    { pages: ProductsResponse[] },
    [string, Omit<ProductFilters, 'cursor'>],
    number | undefined
  >({
    queryKey: ['products-infinite', filters],
    queryFn: ({ pageParam }) => fetchProducts({ ...filters, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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

export const usePriceRange = (params?: { category?: string; brand?: string; sale?: boolean }) =>
  useQuery({
    queryKey: ['price-range', params],
    queryFn: () => fetchPriceRange(params),
  })
