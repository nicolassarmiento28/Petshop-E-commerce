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
          bg: '#111111',
          surface: '#1a1a1a',
          surface2: '#222222',
          text: '#e8eaf0',
          muted: '#8892a4',
          border: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}

export default config
