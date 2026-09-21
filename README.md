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

## 🧠 Judy — the Storefront Assistant

**Judy** is the Fashion Feet customer assistant, mounted once in the root layout as a floating chat panel. She is designed from first principles to be **honest, grounded and safe**: Judy never fabricates a price, policy, delivery time or store location — if the answer is not in the site's own published information, she says so plainly and routes the customer to `/contact`.

### Design principles
- **Offline‑first.** Judy works with **zero configuration** and **no API key**. Her default path is a deterministic keyword retriever over the site's published content — nothing is ever sent to a third party.
- **Grounded answers only.** Every reply cites, and is bounded by, data that is already public on the website or on `/api/v1` — no Prisma row is ever spread. Coverage grows automatically the moment content is published.
- **Graceful degradation.** A missing key, a provider outage, a timeout or a malformed configuration is a **server‑side log line**, never a broken bubble in the UI. The customer always gets either a grounded answer or an honest "I don't know" — never a 500.
- **Never invents.** The remote‑model system prompt forbids guessing prices, policies, stock, materials, shipping costs or locations, and the offline path cannot generate text at all — it only concatenates retrieved entry bodies.

### Knowledge base
Judy's knowledge is assembled at request time (cached for 60 s) from the same published predicates the storefront uses:

| Source | What Judy sees | Predicate |
|---|---|---|
| **FAQ** | Questions + answers | Every published FAQ row |
| **Product** | Title, description, category, occasion, price (incl. promo), material, colours, sizes, craftsmanship, care, SKU | `archived: false, published: true` (≤ 200) |
| **Collection** | Title + description | `visible: true, status: "PUBLISHED"` (≤ 100) |
| **Store** | Name, status, address, opening hours, phone, WhatsApp, email, services, accessibility, description | Status ∈ `OPEN`, `COMING_SOON`, `TEMPORARILY_CLOSED` (≤ 100) |
| **Homepage** | All visible published storefront sections (titles, badges, subtitles, descriptions, CTAs) | The `PUBLISHED` StorefrontConfig only |
| **Company** | Public appearance keys (brand colours, logo, typography) | `PUBLIC_APPEARANCE_KEYS` allowlist, `PUBLISHED` rows only |

The retriever (`src/lib/judy/retrieval.ts`) uses conservative weighted scoring with a minimum score threshold — a query that merely shares a stopword with some entry's body is **not** treated as an answer, which is exactly the point: a confident silence beats a confident lie.

### Remote providers (opt‑in)
Remote mode is selected by `JUDY_PROVIDER` and speaks the **OpenAI‑compatible chat‑completions protocol** (plain `fetch`, no vendor SDK). Four modes are available:

| `JUDY_PROVIDER` | Meaning | Notes |
|---|---|---|
| `offline` **(default)** | Deterministic retrieval; no network | Works out of the box, no keys needed |
| `groq` | Groq's documented endpoint | `https://api.groq.com/openai/v1` |
| `gemini` | Gemini's OpenAI‑compatible surface | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `openai` | OpenAI's official API | `https://api.openai.com/v1` |

Remote mode **requires** both `JUDY_API_KEY` and `JUDY_MODEL` (model ids are **never hard‑coded** — a guessed model id fails at runtime, so the operator must copy the exact id from the vendor's current list). `JUDY_BASE_URL` optionally overrides the endpoint for self‑hosted gateways, and `JUDY_TIMEOUT_MS` (1–30 s, default 10 s) bounds how long a customer waits before Judy falls back to the offline reply.

The customer is always told whether the answer came from `offline` or from `online` mode in the widget's status line — but **the provider name, endpoint, model and credential are never rendered** and never appear in any HTTP response.

### API surface
- **`POST /api/judy`** — the only public entry point. Body:
  ```json
  { "message": "What sizes do the Royal Gold juttis come in?",
    "history": [ { "role": "user", "content": "…" },
                 { "role": "assistant", "content": "…" } ] }
  ```
  Returns HTTP 200 for every path that isn't a validation rejection:
  ```json
  { "reply":    "…",
    "source":   "offline" | "groq" | "gemini" | "openai",
    "grounded": true,
    "links":    ["/product/…", "/faq", "/contact"] }
  ```
- **Rate limit:** 10 questions / minute per IP → 429 with `Retry-After`.
- `OPTIONS` returns the standard CORS preflight.

### UI widget
- **Floating launcher** (bottom‑right) opens a fixed panel at `z-40` — deliberately below modals, quick‑views and the search overlay, so Judy never fights existing UI for the top layer.
- **Seasonal‑theme aware.** Reads the live `<html data-theme>` palette on mount and observes theme mutations so she inherits Diwali, Holi, Eid etc. palettes correctly.
- **Honesty always visible.** A permanent grounding note states "Judy answers only from Fashion Feet's own published information" and links to `/contact`; the mode line below the transcript shows Offline/Online.
- **Accessibility.** `role="dialog"` with `aria-describedby`, Escape to close, focus returns to the launcher on close, `aria-live="polite"` transcript, keyboard‑operable composer, max‑length inputs, and a 6‑turn history window.

### Configuration
See `.env.example` for the full annotated block:
```
JUDY_PROVIDER=offline | groq | gemini | openai
JUDY_API_KEY=…          # server-side only; NO NEXT_PUBLIC_ prefix
JUDY_MODEL=…            # REQUIRED for remote; exact id from vendor
JUDY_BASE_URL=…         # optional override
JUDY_TIMEOUT_MS=10000   # optional 1000–30000
```

### Where the code lives
- Assistant logic: [`src/lib/judy/`](file:///c:/Users/aryan/OneDrive/Desktop/Fashion%20Feet/src/lib/judy) — `index.ts` (orchestrator), `knowledge.ts` (DB sources & allowlists), `retrieval.ts` (scoring), `providers.ts` (OpenAI‑compatible adapter), `types.ts`
- Widget: [`src/components/judy/JudyWidget.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/Fashion%20Feet/src/components/judy/JudyWidget.tsx)
- Endpoint: [`src/app/api/judy/route.ts`](file:///c:/Users/aryan/OneDrive/Desktop/Fashion%20Feet/src/app/api/judy/route.ts)
- Mounted in: [`src/app/layout.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/Fashion%20Feet/src/app/layout.tsx#L59-L62) (once, in the root body, below the storefront children)

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
git clone https://github.com/Keninjavelas/Fashion-Feet.git
cd Fashion-Feet

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
