import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/postgres/schema.prisma",
  migrations: { path: "prisma/postgres/migrations" },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || "",
  },
});
