import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });

const globalForPrisma = globalThis as unknown as { prisma_v7: PrismaClient };

export const prisma =
  globalForPrisma.prisma_v7 || new PrismaClient({ adapter, log: ['error'] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v7 = prisma;
