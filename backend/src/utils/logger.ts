const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    if (isDev) console.log(`[INFO] ${msg}`, ...args)
  },
  warn: (msg: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${msg}`, ...args)
  },
  error: (msg: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${msg}`, ...args)
  },
}
