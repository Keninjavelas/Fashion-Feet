# Fashion Feet — Mobile App & Public API

> **Current production differences, 26 October 2026:** The `/api/v1` routes are served by the Vercel storefront against shared Neon PostgreSQL, and public responses use `Cache-Control: no-store` so admin publications appear on the next request. The single-file SQLite deployment caveat, old cache durations, and old data counts below describe the earlier local prototype. The Expo app source still exists in `mobile/`, but has no app-store release or verified production client session. Treat the field lists below as historical until checked against `src/lib/publicSerializers.ts` and the live API. See [API.md](API.md) and [ProductionReadiness.md](ProductionReadiness.md).

**Scope.** This document covers the native mobile client in `mobile/` and the public JSON surface
(`/api/v1`) it consumes. It is documentation only — no application code was changed to produce it.

**Sources of truth.** If this document and the code ever disagree, the code wins:

| File | What it defines |
|---|---|
| `src/lib/publicApi.ts` | CORS headers, rate limiting, cache headers, error envelope, pagination parsing |
| `src/lib/publicSerializers.ts` | The exact field list of every response object |
| `src/app/api/v1/**/route.ts` | The eight route paths, their filters and their status codes |
| `mobile/src/api/types.ts` | The client-side mirror of the contract |
| `mobile/src/api/client.ts` | The only module that knows about URLs, status codes and timeouts |
| `mobile/README.md` | How to run the app (tooling, base URL, screens) |

---

## 1. The decision: a full native app, not a PWA or a Capacitor shell

Three delivery shapes were possible. The project chose the first.

1. **A separate native app (chosen).** Expo (React Native) + Expo Router + TypeScript in `mobile/`.
   A genuinely native client with native navigation, image loading and platform behaviours, and a
   real presence in the app stores.
2. **An installable PWA.** Rejected. It would have reused the existing Next.js storefront — one
   codebase, one deploy — but installability and home-screen distribution on iOS are constrained,
   there is no first-class store listing, and the app would have been limited to what the browser
   exposes.
3. **A Capacitor (or similar) shell.** Rejected. It would have wrapped the existing web storefront
   in a WebView and shipped it to the stores from a single web codebase, but it ships a website
   inside a native frame: gestures, navigation and rendering stay web-shaped, and anything
   native-level still means rebuilding and resubmitting the shell.

**The trade-off, stated plainly:** choosing option 1 creates a **permanent two-codebase
obligation**. The storefront and the app are now **two clients of one backend**. A change to one
does not automatically reach the other — nothing in the Next.js build renders into the app, and no
page, section, layout or visual change in the website appears in the app unless it is separately
implemented there. Every storefront feature now has to be asked twice: does this belong in the
website, the app, or both?

The one thing that does bind the two together is the API contract in section 3, and it is
versioned precisely so that the binding can be changed without breaking software that is already
installed on customers' phones (section 4).

---

## 2. Architecture

The mobile app is a client of the public API and nothing else. It has no database access, no server
dependencies and no administrative surface.

```widget
<svg viewBox="0 0 680 410" width="100%" role="img" aria-labelledby="ff-arch-title ff-arch-desc" font-family="inherit" xmlns="http://www.w3.org/2000/svg">
  <title id="ff-arch-title">Fashion Feet mobile app architecture</title>
  <desc id="ff-arch-desc">The native app and the website storefront are two independent clients. The only interface between the app and the backend is the public /api/v1 JSON surface, which the same Next.js process serves. The app has no path to the database or to the admin surface.</desc>
  <defs>
    <marker id="ff-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--theme-color-accent, #8a1c2b)"/>
    </marker>
    <marker id="ff-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--theme-color-text-muted, #6b6259)"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="680" height="410" fill="var(--theme-color-bg, #faf8f5)"/>

  <text x="24" y="34" font-size="15" font-weight="600" fill="var(--theme-color-text, #2b2420)">One backend, two clients</text>
  <text x="24" y="54" font-size="11" fill="var(--theme-color-text-muted, #6b6259)">Both clients read the same published content; the only interface between them is the public JSON surface.</text>

  <rect x="24" y="80" width="184" height="80" rx="8" fill="var(--theme-color-surface, #ffffff)" stroke="var(--theme-color-border, #e2ddd6)"/>
  <text x="40" y="108" font-size="12.5" font-weight="600" fill="var(--theme-color-text, #2b2420)">Native mobile app</text>
  <text x="40" y="126" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Expo / React Native</text>
  <text x="40" y="143" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">mobile/ — its own codebase</text>

  <rect x="24" y="180" width="184" height="80" rx="8" fill="var(--theme-color-surface, #ffffff)" stroke="var(--theme-color-border, #e2ddd6)"/>
  <text x="40" y="208" font-size="12.5" font-weight="600" fill="var(--theme-color-text, #2b2420)">Website storefront</text>
  <text x="40" y="226" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Next.js App Router</text>
  <text x="40" y="243" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Server Components</text>

  <rect x="248" y="80" width="184" height="180" rx="8" fill="var(--theme-color-accent, #8a1c2b)" fill-opacity="0.07" stroke="var(--theme-color-accent, #8a1c2b)"/>
  <text x="264" y="108" font-size="12.5" font-weight="600" fill="var(--theme-color-accent, #8a1c2b)">Public interface</text>
  <text x="264" y="132" font-size="16" font-weight="700" fill="var(--theme-color-accent, #8a1c2b)">/api/v1</text>
  <text x="264" y="158" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">GET + OPTIONS only</text>
  <text x="264" y="174" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">unauthenticated, no cookies</text>
  <text x="264" y="190" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">read-only: no write handler</text>
  <text x="264" y="206" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">120 req/min per IP → 429</text>
  <text x="264" y="222" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">whitelisted fields only</text>
  <text x="264" y="238" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Cache-Control: public, 60s</text>

  <rect x="472" y="80" width="184" height="110" rx="8" fill="var(--theme-color-surface, #ffffff)" stroke="var(--theme-color-border, #e2ddd6)"/>
  <text x="488" y="108" font-size="12.5" font-weight="600" fill="var(--theme-color-text, #2b2420)">Next.js application</text>
  <text x="488" y="126" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">serves pages + /api/v1</text>
  <text x="488" y="143" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Prisma ORM</text>
  <text x="488" y="160" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">whitelist serializers</text>

  <rect x="472" y="200" width="184" height="60" rx="8" fill="var(--theme-color-surface, #ffffff)" stroke="var(--theme-color-border, #e2ddd6)"/>
  <text x="488" y="226" font-size="11" font-weight="600" fill="var(--theme-color-text, #2b2420)">dev.db — SQLite (WAL)</text>
  <text x="488" y="244" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">one file, one process</text>

  <rect x="472" y="292" width="184" height="68" rx="8" fill="none" stroke="var(--theme-color-text-muted, #6b6259)" stroke-dasharray="4 4"/>
  <text x="488" y="316" font-size="11.5" font-weight="600" fill="var(--theme-color-text, #2b2420)">Admin surface</text>
  <text x="488" y="334" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">/admin · /api/admin/*</text>
  <text x="488" y="350" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">signed-in admins only</text>

  <line x1="208" y1="120" x2="242" y2="120" stroke="var(--theme-color-accent, #8a1c2b)" stroke-width="1.5" marker-end="url(#ff-arrow-accent)"/>
  <line x1="208" y1="220" x2="242" y2="220" stroke="var(--theme-color-accent, #8a1c2b)" stroke-width="1.5" marker-end="url(#ff-arrow-accent)"/>
  <line x1="432" y1="140" x2="466" y2="140" stroke="var(--theme-color-accent, #8a1c2b)" stroke-width="1.5" marker-end="url(#ff-arrow-accent)"/>
  <line x1="564" y1="292" x2="564" y2="266" stroke="var(--theme-color-text-muted, #6b6259)" stroke-width="1.2" marker-end="url(#ff-arrow-muted)"/>

  <path d="M 24 130 H 10 V 320 H 420" fill="none" stroke="var(--theme-color-text-muted, #6b6259)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="426" y="325" font-size="13" fill="var(--theme-color-text-muted, #6b6259)">✕</text>
  <text x="120" y="344" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">no path: the app never reaches the database or the admin surface</text>

  <text x="24" y="392" font-size="10" fill="var(--theme-color-text-muted, #6b6259)">Two independent clients: a change to one does not automatically reach the other.</text>
</svg>
```

In words:

- **Native app → `/api/v1` → Next.js application → Prisma → `dev.db`.** The app performs HTTP `GET`
  requests against the public base path and renders the JSON it receives.
- **The app never touches the database.** It does not import anything from the web app under `src/`,
  does not open `dev.db`, and does not call a server action.
- **The app never touches the admin surface.** `/admin` and `/api/admin/*` remain gated to signed-in
  administrators (see §6 of `SecurityHardening.md`); no route in `mobile/` reaches them.
- **One process serves both clients today.** The API routes live in the same Next.js application that
  renders the website, against the same database. That is what makes the single-file SQLite constraint
  in section 6 acceptable for now — and what makes it a blocker if the API is ever split onto its own
  host.

---

## 3. The API contract — the synchronisation contract

This is the most important section in this document: it is the **only** coupling between the two
codebases. Anything not written here is an implementation detail of one client and is free to change.

### 3.1 Transport, envelopes, CORS, rate limiting and caching

| Property | Value |
|---|---|
| Base path | `/api/v1` |
| Methods | `GET` and `OPTIONS` only. A write method (`POST`/`PUT`/`PATCH`/`DELETE`) has no handler and is answered with **`405`** |
| Preflight | `OPTIONS` → **`204`** with the CORS headers below |
| Item envelope | `{ data: T }` |
| List envelope | `{ data: T[] }` — `/products` additionally returns `pagination` |
| Error envelope | `{ error: string }`, always sent with `Cache-Control: no-store` |
| Credentials | Never. There is no session, no cookie and no `Authorization` header on this surface |

**CORS** (`PUBLIC_CORS_HEADERS` in `src/lib/publicApi.ts`):

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

`Access-Control-Allow-Credentials` is **never** set. A native client does not enforce CORS, but a
WebView, an Expo web build and browser tooling do, so preflight is answered properly rather than left
to fall through to a `405`.

**Rate limiting.** 120 requests per 60,000 ms window per client key, with a 60,000 ms lockout. The
client key is the first `X-Forwarded-For` entry, falling back to `X-Real-IP`, falling back to a single
shared `unknown` bucket — never to "unlimited". When the limit is exceeded the response is:

```
429  { "error": "Too many requests. Please slow down." }
Retry-After: <seconds>
```

**Caching in the deployed storefront.** Successful public API responses currently carry
`Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. The admin is a separate deployment,
so a new request must read the latest published data from the shared database rather than wait for
an old cache lifetime to expire.

**Errors generally.** Unhandled exceptions are logged server-side and returned as a generic
`500 { "error": "Internal server error" }` — no stack traces, no `error.message`, consistent with the
defect #14 fix recorded in `SecurityHardening.md`.

### 3.2 Endpoint reference

All eight routes live under `src/app/api/v1/**/route.ts`. All of them are wrapped by `publicGet()`,
so none can ship without rate limiting, CORS and error containment.

#### `GET /api/v1/products`

Public catalogue listing. Filtered to the same predicate the storefront uses — `archived: false,
published: true` — so it can never become a back door onto drafts or archived SKUs.

| Query parameter | Accepts | Behaviour |
|---|---|---|
| `category` | Category **slug or name** (case-insensitive) | Resolved against **active** categories. An unrecognised value returns an **empty page**, never the unfiltered catalogue |
| `occasion` | Occasion **slug or name** (case-insensitive) | Resolved against **active** occasions. Unrecognised → empty page |
| `collection` | Collection **id or title** (case-insensitive) | Resolved against collections that are `visible: true` **and** `status: "PUBLISHED"`. Unrecognised → empty page |
| `q` | Free text | Substring (`contains`) match against `title`, `description`, `category`, `occasion` |
| `limit` | Integer | Default **24**, maximum **60**. Missing, non-numeric or ≤ 0 → 24; anything above 60 is clamped to 60 |
| `offset` | Integer | Default **0**. Missing, non-numeric or ≤ 0 → 0 |

Filter values are trimmed and capped at 120 characters before use; an empty value is treated as
"not supplied". Ordering is `featured` descending, then `createdAt` descending. Products store their
category and occasion as plain name strings, so the filters are resolved against the taxonomy tables
first.

Response:

```json
{
  "data": [ /* Product[] — see 3.3 */ ],
  "pagination": { "total": 0, "limit": 24, "offset": 0, "hasMore": false }
}
```

`total` is the count **after** filtering and before pagination; `hasMore` is
`offset + <rows returned> < total`.

There is **no** `featured` query parameter. The flag is returned inside `flags` and is applied by the
client (the app filters the first page for the Home row and falls back to "Latest additions" when
nothing is flagged).

#### `GET /api/v1/products/:idOrSku`

| Outcome | Body |
|---|---|
| `200` | `{ data: Product }` |
| `404` | `{ error: "Product not found" }` |

**There is no slug column on `Product`.** Lookup is by cuid `id` **or** by the unique `sku` — the path
segment is one of those two values, and nothing else. This is stated explicitly because a reader will
otherwise assume a slug exists (the storefront routes by id; packaging and label artwork carry the
SKU, which is why both are accepted).

This endpoint applies the same `archived: false, published: true` predicate as the listing. The web
product page does **not** filter on those columns, so an unpublished product is reachable on the
website by anyone who knows its id — this endpoint deliberately does not inherit that behaviour, and
returns a clean `404` instead.

#### `GET /api/v1/categories`

`{ data: Category[] }` — **active** categories only, ordered by `displayOrder` ascending then `name`
ascending. This table holds product *types* (currently Jutti and Mojari); gender and occasion live on
the product itself.

#### `GET /api/v1/collections`

`{ data: Collection[] }` — only collections that are `visible: true` **and** `status: "PUBLISHED"`
(a `DRAFT` collection is merchandising work-in-progress and must not surface here), ordered by
`displayOrder` then `title`. **This table is currently empty**, so the endpoint returns an empty array
rather than a `404` and a client may call it unconditionally.

#### `GET /api/v1/occasions`

`{ data: Occasion[] }` — **active** occasions only, ordered by `displayOrder` then `name`. The `name`
returned here is the value to pass back as `?occasion=` on `/products`.

#### `GET /api/v1/stores`

`{ data: Store[] }` — only statuses a customer may see: `OPEN`, `COMING_SOON`,
`TEMPORARILY_CLOSED` (`DRAFT` is an unpublished location being set up, `ARCHIVED` is a closed one),
ordered by `displayOrder` then `name`. `managerName` is dropped by the serializer — it is a named
individual's internal point of contact, not storefront content.

#### `GET /api/v1/faqs`

`{ data: Faq[] }` — every row in the table, ordered `isPinned` descending then `displayOrder`
ascending. The `Faq` model has **no** draft/visible/status column, so there is nothing to filter on:
every FAQ is public by construction.

#### `GET /api/v1/site`

```json
{
  "data": {
    "appearance": { /* Appearance — see 3.3 */ },
    "homepage": {
      "page": "homepage",
      "version": 3,
      "publishedAt": "2026-01-01T00:00:00.000Z",
      "sections": [ /* StorefrontSection[] */ ]
    }
  }
}
```

Reads the storefront's public configuration so a native client can render Home without hardcoding
layout decisions that merchandisers control in the admin console. Two deliberate exclusions: only the
**PUBLISHED** `StorefrontConfig` row is read (the `DRAFT` row is the merchandiser's unpublished
sandbox), and `lastEditedById` is omitted from the query because it holds an `AdminUser` id that has no
business on an unauthenticated endpoint.

`appearance` values take `CompanyContent` first and are then overridden by `SiteSetting`, matching the
storefront's own precedence so the API and the website cannot disagree about a colour. `version` and
`publishedAt` are `null` when no published homepage row exists. When the stored `sections` blob is
absent or not valid JSON, the response falls back to the built-in homepage configuration rather than
returning a `500`. This endpoint caches for 120 seconds instead of 60.

There are currently **0** `StorefrontConfig` rows — no `DRAFT` and no `PUBLISHED` — so `version` and
`publishedAt` are `null` and the **built-in homepage defaults are the content this endpoint actually serves**
(§7).

### 3.3 Response field lists

These are copied from the interfaces in `src/lib/publicSerializers.ts`. `| null` means the field is
present and explicitly nullable; the serializer never omits a declared key.

**Product** (`PublicProduct`)

```ts
{
  id: string;
  sku: string | null;
  title: string;
  description: string;
  craftsmanship: string | null;
  category: string;
  gender: string;
  occasion: string | null;
  price: number;
  promoPrice: number | null;
  discount: number | null;
  effectivePrice: number;          // promoPrice when set and lower than price, else price
  material: string | null;
  colors: string[];                // normalised — see 3.4
  sizes: string[];                 // normalised — see 3.4
  care: string | null;
  sizeGuide: string | null;
  flags: {
    featured: boolean;
    newArrival: boolean;           // serialised from the isNewArrival column
    bestSeller: boolean;           // serialised from the isBestSeller column
    festivalExclusive: boolean;    // serialised from the isFestivalExclusive column
  };
  collectionId: string | null;
  images: string[];                // ProductImage.url values only, no image metadata
  createdAt: string;               // ISO-8601
}
```

**Category** (`PublicCategory`)

```ts
{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
}
```

`active` (already filtered) and `createdAt` are intentionally omitted.

**Occasion** (`PublicOccasion`)

```ts
{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}
```

**Collection** (`PublicCollection`)

```ts
{
  id: string;
  title: string;
  description: string | null;
  banner: string | null;
  thumbnail: string | null;
  displayOrder: number;
}
```

**Store** (`PublicStore`)

```ts
{
  id: string;
  name: string;
  code: string | null;
  type: string;
  status: string;                  // OPEN | COMING_SOON | TEMPORARILY_CLOSED from this endpoint
  city: string;
  state: string;
  country: string;
  street: string | null;
  pinCode: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  openingHours: string | null;
  services: string[];              // normalised — see 3.4
  photos: string[];                // normalised — see 3.4
  description: string | null;
  accessibility: string | null;
  displayOrder: number;
}
```

`managerName` and `createdAt` are intentionally omitted.

**Faq** (`PublicFaq`)

```ts
{
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  displayOrder: number;
}
```

**Appearance** (`PublicAppearance`)

```ts
{
  primaryColor: string | null;
  accentGold: string | null;
  typography: string | null;
  buttonStyle: string | null;
  cardRadius: string | null;
}
```

These are the only site-configuration keys that may leave the server. The allowlist is
`appearance.primaryColor`, `appearance.accentGold`, `appearance.typography`,
`appearance.buttonStyle`, `appearance.cardRadius` — settings are stored as arbitrary key/value strings,
so this is an allowlist rather than a denylist, and a new key is private until it is added to it.

**Homepage section** (`StorefrontSection`, inside `homepage.sections`)

The server stores `sections` as free-form JSON and casts it, so the shape below is the only thing the
endpoint guarantees. `items` is deliberately unknown and is not rendered by the app. The
following fields are what the client relies on:

```ts
{
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;          // a web path; the app maps only /shop, /store*, /faq and /contact
  image?: string;
  displayOrder: number;
  visible?: boolean;
  stylePreset?: string;
  motionPreset?: string;
  layoutSettings?: { width?: string; paddingY?: string; alignment?: string };
  items?: unknown[];
}
```

### 3.4 Two contract rules the client depends on

**Field renames.** The response deliberately does not use the internal column names. The API returns
`flags.newArrival` for the `isNewArrival` column, and `flags.bestSeller` / `flags.festivalExclusive`
for `isBestSeller` / `isFestivalExclusive`. Clients must use the serialised names, not the column
names.

**Normalisation.** `Product.colors`, `Product.sizes`, `Store.services` and `Store.photos` are stored
as **untyped strings** in the database — the seed writes JSON arrays, a hand-edited row may hold a
comma-separated list, and several rows are null. The serializer normalises all four to `string[]`
(parse as JSON when the value begins with `[`, otherwise split on commas, otherwise `[]`) so a client
never has to guess and a malformed value degrades to an empty list rather than a `500`. The declared
types above are therefore trustworthy regardless of what is in the column.

---

## 4. The sync story: how the two clients stay in step

The API is **versioned** precisely so that a breaking change gets a new version (`/api/v2`) instead of
silently breaking apps that are already installed on customers' phones. **An installed app cannot be
patched server-side.** Once a build is in a store, old builds keep calling the old path for as long as
users do not update, and a backend change that "just" renames a field is, to those users, a broken app.

Any additive change to the contract must be reflected in **`mobile/src/api/types.ts`**, which is
deliberately the single place drift becomes visible: it mirrors `src/lib/publicSerializers.ts` and both
screens and the API client read their types from it. The client also guards responses at runtime
(`isProduct`, `isCategory`, …), so a row that does not match the documented shape is dropped rather
than crashing a screen.

Two consequences worth stating explicitly:

- **Additive is survivable; subtractive is not.** Adding a field is safe — an old build ignores what it
  does not know about. **Removing or renaming a field is a breaking change even though the code
  compiles**, because the compiler cannot see the app already installed on a customer's phone.
- **App-store releases lag the backend.** Users may run an old build against a new backend for weeks
  or months. Treat every serialised field as public API from the moment it ships, and make changes in
  this order: add the new field (v1), migrate clients, then consider removal — in a new version at the
  earliest.

---

## 5. What is NOT built

Be precise about this, because the app looks more finished than it is:

- **No database migration off SQLite.** The app does not change this; see section 6.
- **No app-store distribution or build pipeline.** There is no EAS configuration, no signing
  credential, no store listing and no release process. Nothing has ever been submitted anywhere.
- **No push notifications.**
- **No offline caching.** Responses are not persisted; nothing is stored for off-line reading. Every
  screen fetches, and with no network there is no content.
- **No authentication of any kind.** This is by design: there is no customer login in the app. No
  sign-up, no session, no token storage, no cookie handling, no `Authorization` header, and no
  privileged or back-office screen.
- **The enquiry form does not submit anywhere.** The public API is read-only and the app has no other
  backend, so the Contact form validates locally and then says so ("Not sent"); there is no success
  message anywhere in the codebase, because nothing is transmitted. The real contact channels published
  by `/api/v1/stores` are surfaced on the same screen as links — but that table is currently empty
  (§7), so no store contact links resolve today and the web `/contact` page is the contact route.
- **No write requests at all** — no `POST`/`PUT`/`PATCH`/`DELETE`, and therefore no cart, checkout,
  order or payment flow.

---

## 6. Database deployment

The storefront API and the separate admin deployment now share Neon PostgreSQL in production. The
single-file SQLite limitation recorded in the earlier review has been resolved for production.
Local `dev.db` remains useful only for single-machine development and historical tests; it is not a
source of production content. See [Database.md](Database.md).

---

## 7. Historical local data snapshot

The earlier local `dev.db` was cleared of fabricated products, stores, and FAQs. Counts recorded
during that work do not describe the current Neon production database. The production FAQ table
contains 12 restored entries as of 26 October 2026; their answers still need owner review.
Use the live public API to inspect current published catalogue and store counts.

The mobile UI is designed to handle empty arrays and absent optional fields. Product sizes,
colours, craftsmanship, care, and store details are rendered only when present. These code paths
do not establish that the native app has been tested on a device.

---

## 8. Verification status

Reported honestly, split into what was run and what was not.

### The API — exercised against a real local production build

The API was verified against a real local production build (`npm run build` + `npm start` on
`http://localhost:3000`):

- all **8 endpoints returned `200`**;
- **pagination** and **filtering** behaved as documented;
- an unknown product id produced a **clean `404`**;
- write methods were answered with **`405`**;
- the **CORS preflight** (`OPTIONS`) was answered correctly;
- every response was **scanned for forbidden field names** (no internal or admin-only columns
  appeared);
- **`/api/admin/*` remained gated** throughout.

### The mobile app — NOT run

The app was **not run**. There is **no Android SDK, no Xcode, no emulator and no device** in this
environment, so it was never launched, rendered or interacted with, and no request was ever made from
the app to the API.

Inside `mobile/`, `npm install` and `npx tsc --noEmit` both pass. **That is a type-level guarantee
only, not evidence it renders** — it says the sources compile against the contract, nothing about
runtime behaviour, layout, navigation or native modules.

No app-store build was produced.

### Still outstanding

An **independent verification pass was run and returned FAIL on one genuine regression**, since fixed and
re-tested — see §9. Its remaining checks (documented field names against the serializers, and a
published-vs-draft comparison that current data cannot exercise) were not completed because the run timed
out. Treat every statement in this document as a statement about the code and the tested API, not about an
observed run of the app.

---

## 9. Maintenance notes

### `mobile/` must stay excluded from the root tsconfig and eslint config

Adding this directory **broke the web application's build**, and the failure looked nothing like its cause.

The root `tsconfig.json` includes `**/*.ts` and its `exclude` listed only `node_modules` — which covers the
root one only. With `mobile/` present, the web app's single type-check therefore absorbed
`mobile/node_modules` too: React Native's and Expo's type declarations, which redeclare DOM globals such as
`FormData`. The symptom surfaced nowhere near the cause — the build failed on four lines of an unrelated,
pre-existing file:

```text
./src/app/api/upload/route.ts:34:27
Type error: Property 'get' does not exist on type 'FormData'.
```

For the same reason the root `eslint.config.mjs` `globalIgnores` did not cover `mobile/`, so its sources were
linted under the Next.js ruleset and `npm run lint` reported new errors that had nothing to do with the rules
being broken.

Both configs now exclude it:

| File | Entry added |
|---|---|
| `tsconfig.json` | `exclude: ["node_modules", "mobile"]` |
| `eslint.config.mjs` | `globalIgnores([..., "mobile/**"])` |

**Do not remove either entry.** `mobile/` carries its own `tsconfig.json` and is type-checked independently by
running `npx tsc --noEmit` inside `mobile/`, so nothing is lost. `tsconfig.json` must remain strictly valid
JSON and cannot carry a comment explaining this, which is why the warning lives here instead.
