# Database and migrations

Production uses a managed Neon PostgreSQL database shared by the storefront and admin Vercel projects. Local development can use the separate SQLite schema and `dev.db` fallback. Keep their migration histories distinct.

## Production

- Schema: `prisma/postgres/schema.prisma`.
- Migrations: `prisma/postgres/migrations/`.
- Pooled runtime URL: `DATABASE_URL` in both Vercel projects.
- Direct migration URL: `DATABASE_URL_UNPOOLED` or `DIRECT_URL`.
- Apply migrations with `npm run db:deploy:postgres` before deploying code that depends on a new schema.
- Generate the production Prisma Client with `prisma generate --config prisma.postgres.config.ts`; the Vercel build scripts do this automatically.

Do not import the old local SQLite database into production. It can contain legacy administrator accounts and sample content. Bootstrap a fresh production administrator as described in [AdminDeployment.md](AdminDeployment.md).

## Local SQLite

When `DATABASE_URL` is unset, `src/lib/prisma.ts` uses a local SQLite file. The local schema and migrations live under `prisma/`. These files are for development and historical acceptance tests, not for multi-host production.

## Backups and recovery

The SQLite backup/restore implementation applies only to a local SQLite database. It is disabled for managed PostgreSQL. Production recovery depends on the Neon project's backup and restore facilities; verify the provider's actual retention and restore process before relying on it. The admin system-health page does not certify backup freshness.

See [DataModel.md](DataModel.md) for the main entities and [ProductionReadiness.md](ProductionReadiness.md) for the operational checklist.
