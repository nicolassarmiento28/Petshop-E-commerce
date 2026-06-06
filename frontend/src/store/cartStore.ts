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

const calcTotals = (items: CartItemType[]) => ({
  totalItems: items.reduce((n, i) => n + i.quantity, 0),
  totalPrice: items.reduce((n, i) => n + i.unitPrice * i.quantity, 0),
})

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          const items = existing
            ? state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              )
            : [
                ...state.items,
                {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  imageUrl: product.imageUrl,
                  unitPrice: product.salePrice ?? product.price,
                  quantity,
                },
              ]
          return { items, ...calcTotals(items) }
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return { items, ...calcTotals(items) }
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const items = quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
          return { items, ...calcTotals(items) }
        }),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'petshop-cart',
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)
