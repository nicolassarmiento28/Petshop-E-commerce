import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItemType, ProductType } from '@/types'

interface CartStore {
  items: CartItemType[]
  addItem: (product: ProductType, quantity?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.imageUrl,
                unitPrice: product.salePrice ?? product.price,
                quantity,
              },
            ],
          }
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((n, i) => n + i.quantity, 0)
      },

      get totalPrice() {
        return get().items.reduce((n, i) => n + i.unitPrice * i.quantity, 0)
      },
    }),
    {
      name: 'petshop-cart',
    },
  ),
)
