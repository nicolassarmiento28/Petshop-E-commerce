import app from './app'
import { prisma } from './lib/prisma'
import { logger } from './utils/logger'

const PORT = process.env.PORT ?? 3001

async function start() {
  try {
    await prisma.$connect()
    logger.info('Database connected')
  } catch (error) {
    logger.error('Failed to connect to database', error)
    process.exit(1)
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
}

start()
