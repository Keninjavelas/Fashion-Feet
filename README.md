# Fashion Feet

![Fashion Feet Logo](public/branding/fashion-feet-official.png)

> **Designer Punjabi Jutties** – A premium Punjabi jutti storefront with an admin dashboard for seamless product management.

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## About

Fashion Feet is a **Punjabi jutti** e‑commerce platform. It consists of two separately deployed Next.js applications:

1. **Public storefront** – The customer‑facing site.
2. **Admin dashboard** – A secure interface for managing products, collections, FAQs, and site settings.

Both apps share a common database (Neon PostgreSQL in production, SQLite locally) and a set of shared UI components.

---

## Features

- **Product catalogue** with three business groupings: Daily Wear, Festive, Ceremonial.
- **Gender‑specific collections** (Men, Women, Unisex) with dedicated “Rajwadi” (women‑only) and “Functional/Office Wear” (men‑only) lines.
- **Admin UI** for content publishing, image uploads, and MFA‑protected sign‑in.
- **Read‑only public API** (`/api/v1`) for the Expo mobile client.
- **Responsive design** and a modern design system (see `docs/DesignSystem.md`).
- **Automated CI/CD** via Vercel with preview deployments.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React), Tailwind CSS |
| Mobile | Expo (React Native) |
| API / Server | Next.js API routes, Node.js |
| Database | PostgreSQL (Neon) – production, SQLite – local |
| ORM / Migrations | Prisma |
| CI/CD | Vercel |
| Form handling | Formspree |
| Authentication | Password + TOTP MFA |

---

## Repository Layout

```
src/app/               # Public storefront pages & components
src/components/        # Shared UI components
apps/admin/            # Admin dashboard (Next.js)
src/lib/               # Server utilities & content readers
prisma/postgres/       # Production Postgres schema & migrations
prisma/                # Local SQLite schema & migrations
mobile/                # Expo client (read‑only API)
public/                # Static assets (logo, exhibition photos)
docs/                  # Architecture, ops guides, feature docs
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development servers
npm run dev          # Storefront (http://localhost:3000)
npm run dev:admin    # Admin dashboard (http://localhost:3001)
```

1. Copy `.env.example` → `.env` and fill in required values.
2. If `DATABASE_URL` is unset, the apps fall back to a local `dev.db` SQLite file.
3. **Never** commit `.env`, database files, API keys, or recovery codes.

### Useful Checks

```bash
npm run build                # Build storefront
npm run build:admin          # Build admin dashboard
npm run test:isolation       # Verify admin routes are excluded from storefront build
npx tsc --noEmit             # TypeScript compile check
```

> **Tip:** If OneDrive locks the `.next` folder during a rebuild, set `FF_BUILD_DIR=build` for the commands above.

---

## Deployment

- **Storefront:** [https://fashionfeet.co.in](https://fashionfeet.co.in) (also served on the Vercel alias `https://fashion-feet-storefront.vercel.app`)
- **Admin dashboard:** `https://fashion-feet-admin.vercel.app`
- **Custom domain:** [fashionfeet.co.in](https://fashionfeet.co.in) — live since 10 November 2026 (GoDaddy apex A record added, Microsoft 365 records preserved, Vercel certificate issued).

Production uses the shared Neon PostgreSQL instance. Deployment steps and current operational status are documented in:
- `docs/AdminDeployment.md`
- `docs/ProductionReadiness.md`

---

## Documentation

- **Architecture:** `docs/Architecture.md`
- **Database schema:** `docs/Database.md` & `docs/DataModel.md`
- **Public API:** `docs/API.md`
- **Storefront guide:** `docs/Storefront.md`
- **Component library:** `docs/Components.md`
- **Design system:** `docs/DesignSystem.md`
- **Seasonal experiences:** `docs/SeasonalExperiences.md`
- **Media assets:** `docs/Media.md`
- **Admin deployment & security:** `docs/AdminDeployment.md`
- **Production operations:** `docs/ProductionReadiness.md`
- **Mobile app guide:** `docs/MobileApp.md`
- **Content intake workflow:** `docs/ContentIntake.md`
- **MFA test history:** `docs/MfaFlow.md`
- **Security test history:** `docs/SecurityHardening.md`
- **Acceptance test history:** `docs/AcceptanceManifest.md`
- **Future interactive product stage:** `display.md`
- **Heritage Atelier audit:** `docs/HeritageAtelierAudit.md`

---

## Contributing

We welcome community contributions! Please see the forthcoming `CONTRIBUTING.md` for guidelines, then follow the typical GitHub workflow:
1. Fork the repository.
2. Create a feature branch.
3. Open a pull request.
4. Verify all tests pass (`npm run test:isolation`).

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

*Last updated: 2026-11-10*
## Contributing

We welcome community contributions! Please see the forthcoming `CONTRIBUTING.md` for guidelines, then follow the typical GitHub workflow:
1. Fork the repository.
2. Create a feature branch.
3. Open a pull request.
4. Verify all tests pass (`npm run test:isolation`).

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

*Last updated: 2026-11-10*
