import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * PRISMA CLIENT SINGLETON PATTERN (إصلاح مشكلة الـ Connection Pooling)
 * Prevents database connection pool exhaustion in development HMR (Hot Module Replacement)
 * and serverless Next.js runtimes. Instantiates the Prisma Client exactly once and caches
 * the instance on the globalThis context, preventing Next.js from creating new connections
 * on every code refresh.
 */
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
