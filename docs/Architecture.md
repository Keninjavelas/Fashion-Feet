# Fashion Feet Architecture Specification

## Overview
**Fashion Feet** is built as an exclusive luxury Punjabi footwear digital experience. The application separates the customer-facing **Storefront** from the internal **Admin Application**.

## Tech Stack & Core Infrastructure

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (`strict: true`)
- **Database ORM**: Prisma ORM with SQLite (`prisma/dev.db`)
- **Authentication**: NextAuth.js v5 (JWT sessions with Credentials provider)
- **Styling**: Tailwind CSS v4 with custom CSS variables & theme tokens
- **Animations**: Framer Motion, HTML5 Canvas particle systems, CSS keyframes
- **Icons**: Lucide React
- **Mobile client**: Expo (React Native) + Expo Router + TypeScript (strict) in `mobile/` — consumes `/api/v1` only and never imports from `src/`

## Application Boundaries & Principles

1. **Boutique Selection Model (No Online Cart / Checkout)**:
   - Fashion Feet operates as an exclusive luxury boutique showroom where footwear is experienced in person for fit, feel, and finish.
   - Replaced e-commerce checkout with direct **Product Fitting Enquiries** and **Wishlist / Favorites**.

2. **Server/Client Component Separation**:
   - Page layouts (`StorefrontLayout.tsx`) are async Server Components executing Prisma queries on the server.
   - Interactive widgets (`EnquiryModal`, `SearchModal`, `InteractiveSizeFinderSection`) are Client Components.
   - DB adapters (`@prisma/adapter-better-sqlite3`) are isolated from Client Component bundles to prevent runtime errors.

3. **Global Seasonal Experience Engine**:
   - Seasonal presets (`normal`, `diwali`, `holi`, `eid`, `christmas`, `lohri`, `baisakhi`) apply via `data-theme` attribute on the root storefront wrapper.
   - Dynamic particle overlay canvases render themed ambient effects.

## Clients, the Public API and the Client/Server Boundary

The application has **two clients and one backend**:

1. **Website storefront** — the Next.js App Router pages, which read the database directly through Prisma inside Server Components (see item 2 above).
2. **Native mobile app** (`mobile/`) — an Expo / React Native client. It has no database access and no server-side privileges of any kind; it is a pure consumer of the public API.

The boundary between them is the public, versioned **`/api/v1`** surface:

- **Served by the same Next.js application.** `src/app/api/v1/**/route.ts` runs in the same process that renders the website, against the same database, so both clients read the same published rows.
- **Whitelisted responses only.** Every response object is built field by field in `src/lib/publicSerializers.ts`; no Prisma row is spread into a response. Adding a column to the schema therefore cannot widen a public response by accident.
- **The app never touches the database.** It does not import from `src/`, does not open `dev.db`, does not call a server action and does not use `@prisma/client`.
- **The app never touches the admin surface.** `/admin` and `/api/admin/*` remain gated to signed-in administrators (§6 of [SecurityHardening.md](SecurityHardening.md)); no route in `mobile/` reaches them.
- **Read-only.** The surface has no write handler, so a write method is answered with `405`. There is no authentication on it at all — by design, since there is no customer login in the app.

Because the two clients are independent codebases, a change to one does **not** automatically reach the other: the serialised contract is the only coupling, and it is versioned so that a breaking change becomes a new version rather than a broken app already installed on a phone. See [MobileApp.md](MobileApp.md) for the full contract and the trade-offs of the two-codebase model.
