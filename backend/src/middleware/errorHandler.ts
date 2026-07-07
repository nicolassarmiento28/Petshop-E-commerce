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
  res.status(statusCode).json({ error: err.message ?? 'Internal server error' })
}
