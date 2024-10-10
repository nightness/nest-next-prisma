// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // This prevents TypeScript errors when assigning to global
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Add log levels as needed
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

// Assign the prisma object to the `global` object if it doesn't exist
// This prevents the client from creating multiple instances of Prisma in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
