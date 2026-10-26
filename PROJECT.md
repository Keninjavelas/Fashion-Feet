# Fashion Feet project map

The repository has a public storefront in the root Next.js app and a separate admin application in `apps/admin`. Both production deployments use Neon PostgreSQL. Local development can use SQLite. The mobile Expo client in `mobile/` consumes public `/api/v1` routes and has not been released to app stores.

Start with [README.md](README.md) for setup and [docs/Architecture.md](docs/Architecture.md) for boundaries. [docs/AdminDeployment.md](docs/AdminDeployment.md) records Vercel project setup and the pending custom-domain and email DNS work. [docs/ProductionReadiness.md](docs/ProductionReadiness.md) is the current operational checklist.

The source of truth for behavior is code and the PostgreSQL schema in `prisma/postgres/schema.prisma`. Historical test and content-intake reports in `docs/` are labeled as snapshots; their old localhost or SQLite observations should not be read as present production state.
