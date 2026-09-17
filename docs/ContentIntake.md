# Task 11 — Real Fashion Feet Content: Intake Manifest

**Status: CONTENT LOADING BLOCKED on real-world inputs. Structural work COMPLETE. No content has been invented.**
**Deployment level: localhost / not deployed** (unchanged from Task 10).

This file records the *verified current state* of storefront content and lists exactly what must be supplied
to complete Task 11. It intentionally contains no fabricated Fashion Feet data.

**How to hand assets over:** drop them into the `intake/` folder at the project root and fill in the templates
there. See [../intake/README.md](../intake/README.md) for the exact layout, the `catalogue.csv` columns, and the
store/brand templates. Your assets in `intake/` are gitignored; the templates are tracked.

---

## 0. Completed in this pass (structural only — no invented content)

| Change | Detail |
|---|---|
| **Product images must be managed media** | `validateManagedImageUrls()` (`src/lib/media.ts`). `createProductAction` / `updateProductAction` now reject any image URL that is not backed by a `MediaAsset`, so unmanaged external hotlinks can no longer enter the catalogue. Enforcement is server-side, not just the picker UI. |
| **Media Library "Used In" stays accurate** | `refreshMediaUsage()` recomputes the cached usage labels after product image changes. |
| **All third-party stock imagery removed** | 34 hardcoded `images.unsplash.com` fallbacks in **15 source files** replaced by local placeholders (`src/lib/placeholders.ts` → `public/placeholders/*.svg`), and 12 stock URLs purged from `dev.db`. `images.remotePatterns` is now **empty**, so a stock hotlink cannot render even if one were reintroduced. |
| **Taxonomy corrected** | `Category` now holds product types only — gender (`Men`/`Women`) and the five occasion names removed. `Occasion` is now populated (Casual, Festive, Wedding, Office, Traditional). All 8 products had `occasion` backfilled and `category` retyped to Jutti/Mojari. The product form no longer defaults a new product's category to `"Men"`. |
| **No data-loss risk on edit** | The product form's category select renders an existing value even when it is absent from the list, so editing a product can never silently rewrite its category. |
| **Verification** | `lint` 0 errors · `tsc` clean · build green · `test:acceptance` passed · `test:gate2` **72/72, 0 console errors**. |
| **Fabricated store records removed** | The three fabricated placeholder store records (invented names, street addresses, phone numbers, pin codes, opening hours and `@fashionfeet.com` mailboxes) were deleted from `dev.db` **and** from `prisma/seed.ts` — not renamed and not set to `DRAFT`, because a draft row would still ship the fabrication in the repository. `Store` now holds **0 rows**, `GET /api/v1/stores` returns `{"data": []}` and `/stores` renders its "Stores Coming Soon" panel. Fabricated contact/location copy was removed from the footer, contact, FAQ, accessibility, enquiry and admin store-form surfaces in the same pass (see §5). |

**Still requires your input:** every row in §1 below whose value is placeholder/demo — most importantly all
photography, the real catalogue, and the real store details.

---

## 1. Verified current state (inventory, read from `dev.db` + `public/`)

Everything below is **demo/seed data written during earlier phases**. None of it is real Fashion Feet content.

| Content | Rows | State |
|---|---|---|
| `Product` | 8 | Generic demo names, INR 2,199–3,499. `material`, `colors`, `occasion` are **NULL for all 8**. |
| `ProductImage` | 8 | **All 8 are hotlinked `images.unsplash.com` stock URLs.** Not Fashion Feet photography. |
| `MediaAsset` | **0** | The media system is entirely unused. |
| `public/uploads` | **0 files** | No uploaded media exists at all. |
| Branding logo | — | No `branding.primaryLogo` setting and no published branding asset → `siteLogo` resolves to `""` and the name falls back to the hardcoded string `"Fashion Feet"`. |
| `SiteSetting` | **0** | No `general.siteName`, contact, or social settings. |
| `Category` | 2 | `Jutti, Mojari` — product types only. Gender and occasion values removed (see §0). |
| `Occasion` | 5 | `Casual, Festive, Wedding, Office, Traditional`. |
| `Collection` | **0** | Feature empty. |
| `Store` | **0** | **Empty by design.** The three fabricated placeholder records (invented addresses, phone numbers and `@fashionfeet.com` emails) have been removed from `prisma/seed.ts` and from the database, and no store is seeded any more. Intended to stay empty until real locations are supplied — see §2 and §5. |
| `Festival` | 3 | Diwali / Lohri / Baisakhi demo campaigns, all `INACTIVE`. |
| `Faq` | 4 | Generic copy. |
| `CompanyContent` | 5 | Appearance tokens only. |
| `StorefrontConfig` | 2 | one `DRAFT` + one `PUBLISHED` homepage v1. Hero title is `"Timeless Elegance in Every Step"`; its subtitle still carries a legacy region reference, pending the code/data pass. |
| `Discount` | 0 | — |

### Structural problems found while taking inventory

1. **Images bypass the media system.** Products reference external Unsplash URLs directly, contradicting the
   Task 11 requirement that *every image is properly associated through the existing media system*.
2. **`Category` conflates two dimensions.** `Men`/`Women` are gender, while `Casual`/`Festive`/`Office`/
   `Traditional`/`Wedding` are occasions. `Product` already has separate `gender` and `occasion` columns that
   are unused, and `Occasion` is a separate empty table.
3. **`appearance.accentGold` is `#40bbc4`** — a teal/cyan, not gold. It contradicts both its own key name and
   the `#D4AF37` gold used throughout the admin design system.
4. **Store emails used `@fashionfeet.com`** while the production domain is `fashionfeet.co.in`.
   **Resolved** — the records carrying them were removed (see §0 and §5), and no fabricated mailbox
   remains anywhere in the project.
5. **Dead/placeholder fields**: `Store.photos`, `Store.googleMapsUrl`, `Store.latitude/longitude`,
   `Store.managerName`, `Store.whatsapp`, `Store.services`, `Store.accessibility` were all NULL.
   **Moot for the seeded data now** — every one of those NULLs belonged to the three fabricated
   placeholder rows, which have been deleted. The columns themselves are unchanged; the empty table
   simply has no rows to carry values, and the same fields still need supplying for a real location.

---

## 2. Required inputs (cannot be derived or invented)

To be supplied as **real assets and real facts**. Format suggestions are what the existing systems already
consume; nothing new needs to be built.

### Branding
- [ ] **Logo** — SVG or high-res PNG (transparent background preferred). Target: uploaded via
      `/admin/media` into the `branding` folder and published, so `getPublishedAsset("branding")` resolves it.
- [ ] Confirm the legal/display **brand name** exactly as it should render (currently hardcoded `"Fashion Feet"`).
- [ ] Brand colours: confirm or replace `primaryColor #1A1A1A`, `accentGold #40bbc4` (see finding 3),
      typography `Cinzel & Inter`, button style, card radius.

### Products (per item)
- [ ] Real **product name**
- [ ] Real **price** (and `promoPrice`/`discount` if applicable)
- [ ] Real **category** (and confirm the intended category taxonomy — see finding 2)
- [ ] **Gender** and **occasion**
- [ ] **Material** and **colours** (currently NULL on every product)
- [ ] **Sizes** and size-guide mapping
- [ ] **Care instructions**
- [ ] **Description** and **craftsmanship** copy
- [ ] **Photographs** — see §3
- [ ] Which products are `featured` / `isNewArrival` / `isBestSeller` / `isFestivalExclusive`

### Collections and occasions
- [ ] Real **collections** (title, description, thumbnail, banner, display order) — table is empty
- [ ] Real **occasions** — table is empty
- [ ] Which products belong to which collection

### Stores
- [ ] Real **store details** for each location you actually operate: name, type, street, city, state, PIN,
      phone, email, WhatsApp, opening hours, services, accessibility notes, map URL/co-ordinates
- [ ] **Store photographs**

There is nothing left to confirm about the old rows: the three fabricated placeholder records have been
removed from **both** `prisma/seed.ts` and the database, so the `Store` table is empty (see §5).
`prisma/seed.ts` deliberately creates **no** store at all, so a freshly seeded database also starts with a
legitimately empty store table. Capture each real location with
[../intake/stores-template.md](../intake/stores-template.md) and add it through the admin console
(`/admin/stores`); a newly created store defaults to `DRAFT` with blank contact fields, so nothing becomes
customer-visible until publishing is a deliberate act. The removed records remain recoverable from git
history at commit `b2c2f79`.

### Homepage and seasonal
- [ ] Confirm/approve the homepage hero copy and sections (a `PUBLISHED` v1 currently holds demo copy)
- [ ] Real **homepage imagery**
- [ ] Real **festival/seasonal imagery** and which campaigns are genuinely run (3 demo festivals exist, all inactive)

### Company / contact
- [ ] Footer/about/contact/policy copy and real contact channels
- [ ] Social handles and any GST/legal identifiers to display

---

## 3. Photographs — the critical dependency

Task 11 asks for **real jutti photographs**. There are currently **zero** Fashion Feet image files anywhere in
the project. Until real photographs exist, any "content completion" pass would have to substitute something
that is not Fashion Feet.

Three viable paths, and the choice changes the work substantially:

| Path | What happens | Trade-off |
|---|---|---|
| **A. Supply real photographs** | Files are uploaded through the existing media system, associated to products, and the Unsplash hotlinks are removed | Correct end state. Requires you to provide the files. |
| **B. AI-generated interim imagery** | I generate clearly-labelled interim placeholders so layout/mobile work can be validated, tracked for later replacement | **Not real photography.** Must never be presented as Fashion Feet's own product shots. |
| **C. Leave stock images for now** | Content pass proceeds on text/data only; the Unsplash dependency remains | Fastest, but leaves a licensing/relevance problem and an external hotlink dependency in production. |

> Recommend confirming the path **before** any image work, so nothing is generated that later has to be
> unpicked or, worse, mistaken for real product photography.

---

## 4. Explicitly out of scope for Task 11

Per instruction, this is **not** an architecture refactor and **must not** fake physical separation. Belongs to
Task 12:

- `fashionfeet.co.in` / `admin.fashionfeet.co.in` provisioning and reverse-proxy routing
- Server database migration (SQLite is a single file and blocks two independent deployments)
- Persistent media storage, secrets management, HTTPS, real backup destination, synchronisation

---

## 5. Verified content defects found while removing the fabricated stores

Recorded here so they are not lost. Both are **open items — not fixed**; neither is a build, lint or
type error, which is exactly why neither was caught by the existing checks.

1. **The website's FAQ page does not read the FAQ table.** The public `/faq` page renders a **hardcoded
   `FAQ` array** in `src/app/faq/FaqClient.tsx`, entirely separate from the four rows in the database
   `Faq` table that `GET /api/v1/faqs` serves. The two disagree — different questions, and until the
   store cleanup they also disagreed about store locations. **Consequence:** the website and the mobile
   app show *different* FAQs, and editing a FAQ in the admin console cannot change what the website
   displays. The website's copy must eventually be driven by the table (or the table retired), but that
   is a behaviour change, not a content edit, so it is left as found.
2. **The contact form fakes a successful submission.** `src/app/contact/ContactClient.tsx` resolves on a
   `setTimeout` (line 14, cleared at line 17) and then displays "Message Sent Successfully!" (line 76) —
   nothing is sent and nothing is stored. Anyone using that form is told their message was delivered
   when it was not. This matches the mobile app's honest "Not sent" behaviour (`MobileApp.md` §5) only
   in the sense that neither transmits anything; the web form is the one that lies about it.

---

## 6. Deliberately left unchanged — pending your decision, not defects

Choosing replacement brand wording is **your** decision, not a defect fix, so the following is still
published and was deliberately not touched. Each is listed with file and line references so it can be
actioned directly.

| Where | Published wording | Kind |
|---|---|---|
| `src/components/layout/Footer.tsx:13` | "Join Our Heritage Atelier" | Brand wording |
| `src/app/layout.tsx:20`, `:23`, `:24`, `:27-28`, `:36-37` | SEO title `Fashion Feet \| Royal Punjabi Juttis & Bespoke Atelier`, the matching meta/OG descriptions, and keywords including "Patiala Jutti" | Brand wording + regional claim |
| `src/lib/storefrontConfigTypes.ts:32` | Hero subtitle "Patiala Heritage & Modern Couture Mojaris" | Regional claim |
| `src/lib/storefrontConfigTypes.ts:59` | Section title "Centuries of Patiala Mastery" | Regional claim |
| `src/lib/storefrontConfigTypes.ts:152` | "Preserving Punjab's Cordwainer Heritage **Since 1994**" | **Invented founding year — see below** |
| `src/lib/storefrontConfigTypes.ts:167` | "Crafted with passion in Patiala, Punjab. Worldwide delivery." | Regional claim |
| `src/lib/seasonalConstants.ts:31` | Seasonal badge "Patiala Heritage Atelier" | Regional claim |
| `src/app/accessibility/page.tsx:34` | "Light Atelier" theme name | Theme name (shares the "Atelier" wording) |

> **"Since 1994" is an invented founding year.** It is a **factual claim about the business**, not a
> style choice, so it must not be removed silently and must not be swapped for another guess. It needs
> explicit confirmation from you — supply the real founding year, or confirm removal. Until then it
> stays exactly as it is, listed here as a content defect awaiting a decision.
