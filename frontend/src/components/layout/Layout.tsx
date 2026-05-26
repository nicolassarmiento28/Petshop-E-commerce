import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import Navbar from './Navbar'
import Footer from './Footer'
import { useThemeStore } from '@/store/themeStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-[#111111] transition-colors duration-300">
      <Toaster position="top-center" richColors closeButton />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
