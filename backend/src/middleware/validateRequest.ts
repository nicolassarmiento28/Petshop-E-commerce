import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema, ZodError } from 'zod'

export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') })
        return
      }
      next(err)
    }
  }
