# Architecture

Fashion Feet is a two-deployment Next.js 16 application. The public storefront is built from the repository root; the admin dashboard is built from `apps/admin`. Both use shared TypeScript modules under `src/` and the same managed Neon PostgreSQL database in production. `npm run test:isolation` checks the route and Server Action separation after both builds.

## Boundaries

- The storefront serves customer pages, sign-in, contact/product enquiries, Judy, and read-only `/api/v1` content. Its proxy redirects `/admin/*` to the admin origin and rejects admin API/upload paths.
- The admin origin serves `/admin/*`, `/api/admin/*`, and `/api/upload`. Vercel Authentication gates the deployment, and app-level password, TOTP MFA, database sessions, and role checks protect admin operations. The proxy cookie check is only an early rejection; server actions and routes validate the session independently.
- The Expo source in `mobile/` reads published data through `/api/v1`. It has no direct database or admin access and has not been released.

## Content flow

Admin changes are written to PostgreSQL. A saved Storefront Studio draft stays private until published. Public pages read published sections, catalogue items, FAQs, stores, and appearance settings on request; an already-open page needs a refresh. Public API responses use whitelisted fields and `Cache-Control: no-store` to avoid serving outdated content after an admin change.

Admin media uploads use Vercel Blob in production. References to uploaded assets are stored in `MediaAsset` rows; uploading a file alone does not publish it on a page.

## Storage and local development

`prisma/postgres/schema.prisma` and `prisma/postgres/migrations/` are the production schema and migrations. `prisma/schema.prisma` and `prisma/migrations/` support local SQLite development. `src/lib/prisma.ts` chooses the adapter from `DATABASE_URL` and refuses to start a Vercel deployment without PostgreSQL. The local `dev.db` is not a production backup or migration source.

See [AdminDeployment.md](AdminDeployment.md) for deployed origins, [Database.md](Database.md) for migrations, and [API.md](API.md) for public endpoints.
