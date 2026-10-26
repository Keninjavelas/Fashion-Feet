import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

const localSqliteUrl = process.cwd().replace(/\\/g, "/").endsWith("/apps/admin")
  ? "file:../../dev.db"
  : "file:./dev.db";
const databaseUrl = process.env.DATABASE_URL || localSqliteUrl;
const isPostgres = /^postgres(?:ql)?:\/\//.test(databaseUrl);

if (process.env.VERCEL && !isPostgres) {
  throw new Error("Vercel deployments require a managed PostgreSQL DATABASE_URL.");
}

const adapter = isPostgres
  ? new PrismaPg({ connectionString: databaseUrl })
  : new PrismaBetterSqlite3({ url: databaseUrl });

const globalForPrisma = globalThis as unknown as { prisma_v7: PrismaClient };

export const prisma =
  globalForPrisma.prisma_v7 || new PrismaClient({ adapter, log: ['error'] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v7 = prisma;
