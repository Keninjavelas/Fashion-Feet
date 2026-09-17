# Fashion Feet — native mobile app

A read-only, customer-facing mobile client for the **existing** Fashion Feet public REST API
(`/api/v1`). Expo (React Native) + Expo Router + TypeScript (strict).

This directory is self-contained: its own `package.json`, its own dependency tree, its own
TypeScript config. It does not use npm workspaces, it does not touch the root `package.json`,
and it does not import anything from the web app under `src/`.

> **The API is not part of this deliverable.** It already exists and is already tested. Nothing
> here modifies, extends or wraps it — this app only performs `GET` requests against it.

---

## What this app is

- Home — hero + featured products, composed from `/api/v1/site` and `/api/v1/products`
- Shop — product grid, category/occasion filters, debounced search, `limit`/`offset` pagination
- Product detail — image carousel, price, description, and size/colour sections that hide themselves
- Stores — published locations with status, address, services, photos and contact actions
- FAQ — accordion over `/api/v1/faqs`
- Contact — an enquiry form **that is honest about not being wired to a backend** (see below)

## What this app is not

- No authentication: no login, no sign-up, no session, no token storage
- No cookies and no `Authorization` header — the API is credential-free and so is the client
- No privileged/back-office surface of any kind
- No cart, checkout, order, payment or write request of any sort
- No `POST`/`PUT`/`PATCH`/`DELETE` anywhere in the codebase

---

## Requirements

- Node.js 20+ and npm (developed against Node 22 / npm 10)
- The Expo Go app on a phone, **or** a platform emulator/simulator (neither is present in this
  development environment — see "Verification status" below)

## Getting started

```bash
cd mobile
npm install
```

Configure the API base URL, then start the bundler:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env

npx expo start
```

### Base URL configuration

The base URL is read from **`EXPO_PUBLIC_API_BASE_URL`** (Expo's public env-var convention) in
exactly one place: `src/api/client.ts`. No screen contains a URL. Metro inlines
`process.env.EXPO_PUBLIC_*` at build time, so **restart the bundler after changing it**
(`npx expo start --clear` if a stale value seems to stick).

Fallback when the variable is unset: **`http://10.0.2.2:3000`** (see below).

| Where the app runs | Value to use |
| --- | --- |
| **Android emulator** | `http://10.0.2.2:3000` — **not `localhost`** |
| iOS simulator | `http://localhost:3000` |
| Physical device (Expo Go) | `http://<your-machine-LAN-IP>:3000`, same Wi-Fi as the phone |

**Why `10.0.2.2` and not `localhost`:** inside an Android emulator, `localhost` refers to the
emulated device itself, so a request to `http://localhost:3000` would try to reach a server on the
phone and fail — typically presenting as a connection error on every screen. `10.0.2.2` is the
special alias the emulator maps to the host machine's loopback interface. On the iOS simulator,
`localhost` does reach the host, which is why the two differ. Because the Android case is the one
that silently breaks, the built-in development fallback is `10.0.2.2:3000`; set the variable
explicitly for any other environment. If the fallback is in use and requests fail, the error screen
prints the base URL that was actually used, so the mismatch is visible rather than mysterious.

---

## The API this app consumes

Base path `/api/v1`, `GET` only, no auth, no cookies. Lists return `{ data: T[] }`; failures return
`{ error: string }`. Responses carry `Access-Control-Allow-Origin: *` and `Cache-Control`. A `429`
means the caller is rate-limited and carries a `Retry-After` header — both are surfaced in the UI.

| Endpoint | Notes |
| --- | --- |
| `GET /products` | `category`, `occasion`, `collection`, `q`, `limit` (default 24, **max 60**), `offset`. Returns `pagination: { total, limit, offset, hasMore }` |
| `GET /products/:idOrSku` | Look up by cuid **id** or unique **sku** — there is no slug field. `404` → `{ error: "Product not found" }` |
| `GET /categories` | Category list |
| `GET /collections` | May legitimately be an empty array |
| `GET /occasions` | Occasion list |
| `GET /stores` | Only `OPEN`, `COMING_SOON`, `TEMPORARILY_CLOSED` |
| `GET /faqs` | FAQ list |
| `GET /site` | `{ appearance, homepage: { page, version, publishedAt, sections } }` |

The types for all of the above live in a single file, **`src/api/types.ts`**, mirroring
`src/lib/publicSerializers.ts` so any drift is visible in one place. Everything HTTP-related —
base URL, query building, timeouts, status handling, rate-limit messages, response guards and image
URL resolution — lives in a single module, **`src/api/client.ts`**.

### Data reality the UI is built around

- `sizes` and `colors` are currently **empty arrays for every seeded product**. The product screen
  therefore renders the "Available sizes" and "Available colours" sections **only when the arrays
  are non-empty** — an empty list never produces an empty heading.
- There are currently **zero collections**, and `/collections` may be empty by design. No screen
  depends on that endpoint, so an empty (or absent) set of collections cannot blank a screen.
- `flags.featured` drives the Home "Featured pieces" row. `/products` has no `featured` filter
  parameter, so the flag is applied client-side to the first page. When nothing is flagged, the
  newest items are shown under the heading "Latest additions" instead — the app does not relabel
  ordinary products as featured.
- Optional fields (`material`, `care`, `sizeGuide`, `craftsmanship`, store `photos`, store
  `services`, …) are rendered only when present, so missing data removes a block instead of leaving
  an empty label behind.

---

## Project structure

```
mobile/
├── app/                          # Expo Router routes (file-based)
│   ├── _layout.tsx               #   app shell: site config provider + stack
│   ├── (tabs)/
│   │   ├── _layout.tsx           #   five customer-facing tabs
│   │   ├── index.tsx             #   Home   — hero (/site) + featured (/products)
│   │   ├── shop.tsx              #   Shop   — filters, search, pagination
│   │   ├── stores.tsx            #   Stores
│   │   ├── faq.tsx               #   FAQ accordion
│   │   └── contact.tsx           #   Contact (enquiry form is UI-only)
│   └── product/[id].tsx          # Product detail, by id or sku
├── src/
│   ├── api/
│   │   ├── types.ts              # THE contract, mirrored from publicSerializers.ts
│   │   ├── client.ts             # THE one api client (base URL, errors, guards)
│   │   └── hooks.ts              # loading/error/empty + pagination state machines
│   ├── site/SiteProvider.tsx     # one /site fetch, shared theme + homepage sections
│   ├── theme/theme.ts            # sanitised appearance tokens -> Theme
│   ├── components/               # StateView, ProductCard, ProductImage, Chip, Badge, …
│   └── lib/                      # formatting, route-param and debounce helpers
├── assets/                       # icons from the Expo template
├── app.json                      # Expo config (name, slug, router/image plugins)
├── .env.example                  # documented EXPO_PUBLIC_API_BASE_URL
├── expo-env.d.ts                 # so `tsc --noEmit` sees process.env.EXPO_PUBLIC_*
└── tsconfig.json                 # strict, extends expo/tsconfig.base
```

## States: loading, empty and error

Every data-backed screen renders an explicit loading state, an explicit empty state and an explicit
error state — there is no path that yields a blank screen.

- **Loading** — spinner with a screen-specific label (shared `LoadingState`)
- **Empty** — an explanatory message plus a refresh action, worded for the actual situation
  ("No matches" when filters are active vs "Nothing published yet" for an empty catalogue)
- **Error** — `ErrorState`, which maps the failure to a useful title and keeps the API's own
  message; `429` shows the `Retry-After` wait ("Too many requests"), `404` shows "Product not
  found", an unreachable API shows the base URL in use
- **Partial failure** — if a later page or a secondary request fails while data is already on
  screen, the data stays and a non-blocking `Notice` with a retry appears instead
- Pull-to-refresh on Home, Shop, Stores and FAQ; in-flight requests are aborted on navigation so a
  cancelled request never surfaces as an error

## The enquiry form does not send anything

The public API is read-only (`GET /api/v1` only) and this app has no other backend, so the Contact
form has nowhere to deliver a message. Rather than showing a fake confirmation:

- the screen states up front that the form does not send anything;
- the button is labelled "Submit enquiry" but its caption says it only validates locally;
- after submitting valid input the app shows a **"Not sent"** notice explaining that nothing was
  transmitted — there is no success message anywhere in the codebase;
- the real contact channels published by `/api/v1/stores` (phone, email, WhatsApp) are surfaced on
  the same screen as links.

## Credentials

There are none, deliberately and by design. No cookie handling, no `Authorization` header, no token
storage, no login, no privileged screen and no privileged route. Grep the source for
`Authorization`, `cookie`, `token` or the back-office term and you will find only prose in comments
explaining their absence.

## Currency and other assumptions

- Product prices are bare numbers in the contract, with no currency field. The storefront prices in
  Indian rupees, so prices render as `₹1,23,456` with Indian digit grouping. If the catalogue ever
  becomes multi-currency, the API needs a currency field — this is not papered over in the client.
- `appearance.typography` is fetched and exposed on the theme (`typographyToken`) but **not
  applied**: React Native can only use font families bundled at build time, so a runtime string
  cannot be honoured. `appearance.primaryColor`, `accentGold`, `cardRadius` and `buttonStyle` are
  applied, each validated (hex colour check, radius clamp, contrast-derived foreground) so a bad
  merchandiser value cannot render unreadable text.
- Homepage `ctaLink` values are web paths. Only those with a native equivalent (`/shop`, `/store*`,
  `/faq`, `/contact`) produce a button; an unmapped link hides the button rather than rendering a
  control that goes nowhere.

---

## Verification status

### What was actually run in this environment

```bash
cd mobile
npm install          # completed: "added 467 packages, and audited 468 packages in 47s"
                     # (+ 8 SDK-compatible native modules added afterwards with `npx expo install`)
npx tsc --noEmit     # passes: exit code 0, no output
```

The type check was sanity-checked, not merely observed to be silent: a deliberately broken file was
added to the project, `tsc` reported it
(`typecheck-probe.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.`), the
file was removed, and `tsc --noEmit` then exited 0. That confirms the app's own sources are inside
the compilation and are genuinely being checked.

### Explicitly NOT verified

This environment has **no Android SDK, no Xcode, no emulator, no simulator and no physical device**,
so the following were **not** done and must not be assumed:

- The app was never launched, rendered, screenshotted or interacted with
- No request was ever made from the app to the API — every endpoint integration is
  type-checked and code-reviewed only, never executed end to end
- Runtime rendering, navigation, layout/visual correctness on any screen size — unverified
- Native module behaviour (expo-image loading, expo-router navigation, safe-area handling) — unverified
- iOS and Android builds, and EAS/native builds generally — unverified
- Accessibility behaviour with a screen reader — unverified
- Behaviour on a real `429` or a real network outage (the code paths exist and are typed, but were
  never exercised against a live server)
- Dependency audit findings (npm reported "10 moderate severity vulnerabilities" in the Expo
  dependency tree; nothing was force-updated, since `npm audit fix --force` would break Expo SDK
  compatibility). No advisories were triaged individually.

Everything in this README that is stated as fact about runtime behaviour is a statement about the
code, not about an observed run.
