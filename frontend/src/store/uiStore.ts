import { create } from 'zustand'

interface UiStore {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}))
