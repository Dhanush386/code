import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import path from 'path'

const prismaClientSingleton = () => {
    // Prisma 7 requires a driver adapter for SQLite on Node.js
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    console.log('PRISMA: Initializing with DB at:', dbPath)
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
    return new PrismaClient({ adapter })
}

declare global {
    var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
