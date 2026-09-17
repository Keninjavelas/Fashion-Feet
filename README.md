# Fashion Feet

## ✨ Bespoke Punjabi Luxury Footwear

**Hand‑crafted, royalty‑inspired Juttis** that blend centuries‑old Punjabi craftsmanship with modern digital experiences.

---

![Next.js 16](https://img.shields.io/badge/Next.js-16.2.10-black?style=flat&logo=next.js) ![Turbopack](https://img.shields.io/badge/Engine-Turbopack-blueviolet?style=flat) ![Prisma 7](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=flat&logo=prisma) ![Argon2id](https://img.shields.io/badge/Security-Argon2id-darkred?style=flat) ![SQLite](https://img.shields.io/badge/Database-SQLite%20(WAL)-blue?style=flat&logo=sqlite) ![Quality Gate](https://img.shields.io/badge/Acceptance-100%25%20Verified-emerald?style=flat)

---

## 🌟 The Fashion Feet Vision

Fashion Feet is a **luxury boutique footwear label**. We honor Punjabi heritage through:
- **Vegetable‑tanned leather** – ethically sourced, naturally beautiful.
- **Royal dabka needlework** – intricate silver‑zari stitching.
- **Bespoke comfort** – double‑cushioned velvet arches crafted for a perfect fit.

Our digital showroom mirrors this devotion, offering a **personalised, immersive online journey** that feels like stepping into a handcrafted boutique.

The showroom now has two clients: the **website storefront**, and a **native mobile app** (`mobile/`) that reads the same published catalogue through a new public JSON surface, `GET /api/v1` — see [docs/MobileApp.md](docs/MobileApp.md).

---

## 🎉 Signature Seasonal Atmospheres

Our storefront automatically transforms with India’s cultural calendar, delivering seven distinct festive experiences:
- **Default** – regal crimson with champagne gold.
- **Diwali** – floating diyas, warm lamp glow.
- **Holi** – soft gulal clouds, vibrant radiance.
- **Eid** – crescent silhouettes, silver filigree.
- **Christmas** – gold snowflakes, velvet night.
- **Lohri** – bonfire embers, phulkari motifs.
- **Baisakhi** – mustard petals, golden wheat.

Each atmosphere blends subtle motion presets, curated colour palettes, and thematic graphics to create a living celebration on every page.

---

## 🖥️ In‑Browser Visual Storefront Studio

Administrators shape the public face of Fashion Feet from an **embedded sandbox editor** (`/admin/editor`):
- **Responsive canvas** – desktop (1440 px), tablet (768 px), mobile (375 px) views.
- **Drag‑and‑drop sections**, typography tweaks, and motion presets.
- **Draft / Live workflow** – changes are previewed in isolation and published atomically.
- **One‑click rollback** – every publish creates a version snapshot for instant restoration.

---

## 📱 Native Mobile App & the `/api/v1` Surface

A read-only, customer-facing app (**Expo / React Native**) lives in [`mobile/`](mobile/) and renders the same published content as the storefront. It talks to the backend through one interface — the public JSON surface under `/api/v1`:

- `/api/v1/products` — published catalogue; `category`, `occasion`, `collection`, `q`, `limit` (default 24, max 60), `offset`, plus `pagination`
- `/api/v1/products/:idOrSku` — a single product by cuid **id** or unique **sku** (there is no slug)
- `/api/v1/categories` · `/api/v1/collections` · `/api/v1/occasions` · `/api/v1/stores` · `/api/v1/faqs` · `/api/v1/site`

The surface is `GET`/`OPTIONS` only, **unauthenticated by design**, rate-limited (120 requests/min per IP, then `429` with `Retry-After`), and returns whitelisted fields from `src/lib/publicSerializers.ts` — never raw Prisma rows. The storefront and the app are two clients of one backend, so the contract is versioned and any change to it must be mirrored in `mobile/src/api/types.ts`.

Full contract, architecture and the honest trade-offs: [docs/MobileApp.md](docs/MobileApp.md).

---

## 🛡️ Enterprise‑Grade Security & Resilience

- **Argon2id password hashing** – industry‑leading protection for admin and customer accounts.
- **TOTP 2FA** – RFC 6238 time‑based codes with cryptographically hashed recovery tokens.
- **SQLite WAL snapshots** – point‑in‑time backups with SHA‑256 verification.
- **Append‑only audit timeline** – filterable log of every administrative action.

---

## 📦 Getting Started (Developer Quick‑Start)

### Prerequisites
- **Node.js** v20+ 
- **npm** v10+ (or `pnpm`/`yarn` if preferred)
- Modern browser (Edge, Chrome, Safari)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/fashion-feet.git
cd fashion-feet

# Install dependencies
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your DB path and secret keys
```

### Database & Seed
```bash
# Apply formal Prisma migrations
npx prisma migrate status
# Seed initial super‑admin, boutiques and sample products
npx tsx prisma/seed.ts
```

### Run Locally
```bash
npm run dev   # Development server at http://localhost:3000
```
Visit **/admin** for the studio console.

---

## ✅ Comprehensive Verification Suites

```bash
# Full engineering acceptance suite (Phases A‑E)
npm run test:acceptance

# Real‑rendered browser suite (72 viewport & studio checks)
npm run test:gate2

# Strict TypeScript validation
npx tsc --noEmit

# Production Turbopack build
npm run build
```

---


---

## 📜 Intellectual Property

© 2026 Fashion Feet. All rights reserved.

---

*Experience the legacy of Punjabi craftsmanship, re‑imagined for the digital age.*
