import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cartStore'

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], totalItems: 0, totalPrice: 0 })
  })

  it('adds item to empty cart', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' })
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.totalItems).toBe(1)
  })

  it('increments quantity when adding existing item', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' }, 2)
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' }, 3)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes item', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' })
    useCartStore.getState().removeItem(1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears cart', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' })
    useCartStore.getState().addItem({ id: 2, name: 'Test2', slug: 'test2', imageUrl: '', price: 2000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 2, createdAt: '', updatedAt: '' })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('computes totalPrice', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Test', slug: 'test', imageUrl: '', price: 1000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 1, createdAt: '', updatedAt: '' }, 2)
    useCartStore.getState().addItem({ id: 2, name: 'Test2', slug: 'test2', imageUrl: '', price: 2000, stock: 10, isActive: true, isFeatured: false, images: [], categoryId: 2, createdAt: '', updatedAt: '' }, 3)
    const state = useCartStore.getState()
    expect(state.totalPrice).toBe(8000)
  })
})
