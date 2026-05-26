import api from './api'
import type { ProductType, CategoryType, BrandType, ProductFilters } from '@/types'

export interface ProductsResponse {
  products: ProductType[]
  nextCursor: number | null
}

export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  const { data } = await api.get<ProductsResponse>('/products', { params: filters })
  return data
}

export const fetchProductBySlug = async (slug: string): Promise<ProductType> => {
  const { data } = await api.get<ProductType>(`/products/${slug}`)
  return data
}

export const fetchCategories = async (): Promise<CategoryType[]> => {
  const { data } = await api.get<CategoryType[]>('/categories')
  return data
}

export const fetchBrands = async (): Promise<BrandType[]> => {
  const { data } = await api.get<BrandType[]>('/brands')
  return data
}

export const fetchRelatedProducts = async (slug: string): Promise<ProductType[]> => {
  const { data } = await api.get<ProductType[]>(`/products/${slug}/related`)
  return data
}
