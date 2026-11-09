import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton Instance
 * 
 * DESIGN DECISION EXPLAINED:
 * During development with tools like tsx/nodemon, files get re-executed on save.
 * If we instantiate `new PrismaClient()` in every file or on every hot-reload,
 * we would quickly exhaust PostgreSQL's connection pool.
 * 
 * By attaching the client to Node's `globalThis` in development, we ensure
 * a single shared database connection pool across all hot-reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

