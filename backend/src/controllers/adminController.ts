import type { Request, Response, NextFunction } from 'express'
import type { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' })
      return
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'] }
    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, options)

    res.status(200).json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })
  } catch (error) {
    next(error)
  }
}
