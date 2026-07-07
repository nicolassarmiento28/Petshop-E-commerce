import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#059669',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#fbbf24',
          foreground: '#1f2937',
        },
        dark: {
          bg: '#0e100c',
          surface: '#181a13',
          'surface-elevated': '#20231a',
          text: '#e8eaf0',
          muted: '#8892a4',
          border: '#282b1e',
          'border-hover': '#3a3f2b',
        },
      },
    },
  },
  plugins: [],
}

export default config
