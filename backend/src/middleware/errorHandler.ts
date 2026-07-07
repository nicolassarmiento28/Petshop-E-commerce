import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500
  logger.error(`${req.method} ${req.originalUrl} → ${err.message}`, err.stack, err)

  const isProduction = process.env.NODE_ENV === 'production'
  const message = !isProduction || statusCode < 500 ? (err.message ?? 'Internal server error') : 'Internal server error'
  res.status(statusCode).json({ error: message })
}
