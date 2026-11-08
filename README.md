# Fashion Feet

Fashion Feet is a Punjabi jutti storefront with a separate administration dashboard. The brand tagline is **Designer Punjabi Jutties**. The official logo is in `public/branding/fashion-feet-official.png`; two photographs of past exhibitions are in `public/exhibitions/` and appear on the homepage.

## Current deployment

- Public storefront: [fashion-feet-storefront.vercel.app](https://fashion-feet-storefront.vercel.app), Vercel project `fashion-feet-storefront`.
- Admin dashboard: [fashion-feet-admin.vercel.app](https://fashion-feet-admin.vercel.app), Vercel project `fashion-feet-admin` with its own sign-in and TOTP MFA.
- Intended storefront domain: `fashionfeet.co.in`. It is attached to Vercel, but its DNS A record has not been added at GoDaddy (reconfirmed by an authoritative DNS query on 8 November 2026), so use the Vercel storefront address until DNS is configured.
- Production data: both deployments use the same managed Neon PostgreSQL database. The local development fallback is SQLite; `dev.db` is not production data.
- Contact and product enquiries: saved to PostgreSQL for the admin inbox. Formspree notifies the verified `aryan.kapoor@fashionfeet.co.in` recipient without Fashion Feet DNS changes. A live storefront test was saved, appeared in Formspree, and arrived in the Microsoft 365 inbox on 6 November 2026. The Formspree account has two-factor authentication enabled. Submissions remain in the admin dashboard if notification fails. Resend remains an optional legacy path.

The current deployment steps and remaining DNS records are in [docs/AdminDeployment.md](docs/AdminDeployment.md). The operational checklist is in [docs/ProductionReadiness.md](docs/ProductionReadiness.md).

The product catalogue has three shared business groupings: **Daily Wear**, **Festive**, and **Ceremonial**. Each can be browsed for Men or Women; Unisex products appear in both. **Rajwadi** is women-only; **Functional** and **Office Wear** are men-only. The owner supplied 28 women's footwear photographs, one group photograph showing five men's Functional juttis, three photographs of men's Office Wear pairs, and 50 further distinct men's footwear photos from WhatsApp. Each visible design has a consistently framed preview with a descriptive name and a link to its source photo. See [docs/Media.md](docs/Media.md). Confirmed product names, prices, sizes, and availability still need verified entries in `intake/catalogue.csv` before individual products can be published.

The proposed [Interactive Product Stage](display.md) is a future display plan. Revisit it after the Men's section and the rest of the storefront are ready; it is not implemented yet.

## Repository layout

- `src/app/`, `src/components/`: public Next.js storefront and shared components.
- `apps/admin/`: separate Next.js admin application. Its pages, upload endpoint, and admin API routes do not ship in the public storefront build.
- `src/lib/`: shared server utilities and content readers.
- `prisma/postgres/`: production PostgreSQL schema and migrations.
- `prisma/`: local SQLite schema and migrations.
- `mobile/`: Expo client for the read-only public `/api/v1` API. It is source code, not an app-store release.
- `docs/`: architecture, operations, feature guides, and clearly marked historical test reports.

## How updates reach the storefront

The admin publishes products, collections, FAQs, stores, site settings, and storefront layout through the shared database. Public pages read published content on request; an already-open browser tab needs a refresh. The FAQ page and `/api/v1/faqs` read the same FAQ rows. Saving a draft in Storefront Studio does not publish it.

The public `/api/v1` routes provide a read-only catalogue for the mobile client. Judy, the storefront assistant, defaults to an offline answer path grounded in published site content; optional remote providers need separate credentials.

## Local development

Use Node.js and npm, then install dependencies:

```bash
npm install
npm run dev
npm run dev:admin
```

The storefront runs on port 3000 and the admin app on port 3001. Copy `.env.example` to an untracked `.env` and set development values as needed. The server uses local SQLite when `DATABASE_URL` is unset; Vercel requires a PostgreSQL URL. Never commit `.env`, database files, API keys, or recovery codes.

Useful checks:

```bash
npm run build
npm run build:admin
npm run test:isolation
npx tsc --noEmit
```

If OneDrive locks `.next` during a local rebuild, set `FF_BUILD_DIR=build` for both `npm run build` and `npm run test:isolation` in that shell. The production build uses the default directory.

`test:isolation` checks that admin routes and actions are excluded from the storefront build. Production deployment and database migration commands are documented in [docs/AdminDeployment.md](docs/AdminDeployment.md).

## Documentation

- [Architecture](docs/Architecture.md), [database](docs/Database.md), [data model](docs/DataModel.md), and [public API](docs/API.md).
- [Storefront](docs/Storefront.md), [components](docs/Components.md), [design system](docs/DesignSystem.md), [seasonal experiences](docs/SeasonalExperiences.md), and [media](docs/Media.md).
- [Admin deployment and security](docs/AdminDeployment.md), [production operations](docs/ProductionReadiness.md), and [mobile app](docs/MobileApp.md).
- [Content intake](docs/ContentIntake.md), [MFA test history](docs/MfaFlow.md), [security test history](docs/SecurityHardening.md), and [acceptance history](docs/AcceptanceManifest.md).
- [Interactive Product Stage — future display plan](display.md).
- [Heritage Atelier redesign audit and screenshots](docs/HeritageAtelierAudit.md).

The older reports record what was tested at the time. Use the deployment and operations guides for current production status.
