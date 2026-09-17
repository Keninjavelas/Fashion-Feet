# Task 11 — Real Fashion Feet Content: Intake Manifest

**Status: CONTENT LOADING BLOCKED on real-world inputs. Structural work COMPLETE. No content has been invented.**
**Fabricated-content purge: COMPLETE** — every fabricated placeholder record has been removed from `dev.db`
and from `prisma/seed.ts` (see the note below and §1).
**Deployment level: localhost / not deployed** (unchanged from Task 10).

This file records the *verified current state* of storefront content and lists exactly what must be supplied
to complete Task 11. It intentionally contains no fabricated Fashion Feet data.

> ### ⚠ Current content situation (measured after the purge)
>
> **The catalogue, the FAQ table and the store table have been deliberately emptied.** `Product`,
> `ProductImage`, `Faq`, `Enquiry`, `Store` and `Collection` all hold **0 rows** in `dev.db`, and
> `SystemBackup` holds 0 rows with `backups/` empty. Every fabricated placeholder record — the invented
> product names, SKUs, prices, store names, cities, pin codes, phone numbers and mailboxes — has been
> deleted from **both** `dev.db` and `prisma/seed.ts`, and none of those values is reproduced anywhere in
> this file: they are referred to only as *fabricated placeholder records*.
>
> The storefront is therefore in an **honest empty state** rather than a fabricated one: it renders what the
> database actually holds — nothing — instead of inventing content. The built-in homepage defaults are what
> is served, because `StorefrontConfig` is empty too (`/api/v1/site` reports `version: null`).
>
> What the storefront is waiting for is **real content**: the **logo**, **real products** and **real
> categories** (§2). Real product data will be supplied later, and **when it arrives these documents must be
> updated again** — every count in §1 and in `MobileApp.md` §7 is a measurement of the emptied database, not
> a target or a description of a finished catalogue.

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
| **Taxonomy corrected** | `Category` now holds product types only — gender (`Men`/`Women`) and the five occasion names removed. `Occasion` is now populated (Casual, Festive, Wedding, Office, Traditional). The product records that then existed (since deleted — see the row below) had `occasion` backfilled and `category` retyped to Jutti/Mojari. The product form no longer defaults a new product's category to `"Men"`. |
| **Fabricated catalogue, FAQ and store content removed** | Every fabricated placeholder record was deleted from `dev.db` **and** from `prisma/seed.ts` — not renamed and not set to `DRAFT`, because a draft row would still ship the fabrication in the repository. `Product` **0**, `ProductImage` **0**, `Faq` **0**, `Enquiry` **0**, `Store` **0**, `Collection` **0** (see §1). The storefront, the mobile app and the admin console now read empty tables rather than invented copy; where a client has a dedicated empty state (the `/faq` page and `/stores` do) that is what it renders. |
| **FAQ page now reads the database** | The `/faq` drift defect recorded in the previous revision of this file is **fixed** — see §5. |
| **No data-loss risk on edit** | The product form's category select renders an existing value even when it is absent from the list, so editing a product can never silently rewrite its category. |
| **Verification** | Recorded for the structural pass: `lint` 0 errors · `tsc` clean · build green · `test:acceptance` passed · `test:gate2` **72/72, 0 console errors**. Not re-run for the purge documentation pass — see §5.2 item 1 for what those test runs do to `backups/`. |
| **Fabricated store records removed** | The three fabricated placeholder store records (invented names, street addresses, phone numbers, pin codes, opening hours and mailboxes on a domain the business does not use) were deleted from `dev.db` **and** from `prisma/seed.ts` — not renamed and not set to `DRAFT`, because a draft row would still ship the fabrication in the repository. `Store` now holds **0 rows**, `GET /api/v1/stores` returns `{"data": []}` and `/stores` renders its "Stores Coming Soon" panel. Fabricated contact/location copy was removed from the footer, contact, FAQ, accessibility, enquiry and admin store-form surfaces in the same pass (see §5). |

**Still requires your input:** every row in §1 below whose value is placeholder/demo — most importantly all
photography, the real catalogue, and the real store details.

---

## 1. Verified current state (inventory, measured from `dev.db` + `public/`)

Measurements taken from the live database with the Prisma adapter pattern used by `src/lib/prisma.ts`
(`url: "file:./dev.db"`), after the purge. Rows marked **0** are legitimately empty: the content they held
was fabricated and has been removed, not merely hidden. Everything else below is still demo/seed data
written during earlier phases — none of it is real Fashion Feet content.

| Content | Rows | State |
|---|---|---|
| `Product` | **0** | **The catalogue is empty.** Every fabricated placeholder product record (invented names, SKUs and prices) has been deleted. |
| `ProductImage` | **0** | **Empty.** The stock hotlinks that the removed placeholder products carried are gone from the database, and `images.remotePatterns` is empty (§0). |
| `MediaAsset` | **0** | The media system is entirely unused. |
| `public/uploads` | **0 files** | No uploaded media exists at all. |
| Branding logo | — | No `branding.primaryLogo` setting and no published branding asset → `siteLogo` resolves to `""` and the name falls back to the hardcoded string `"Fashion Feet"`. |
| `SiteSetting` | **0** | No `general.siteName`, contact, or social settings. |
| `Category` | 2 | `Jutti, Mojari` — product types only, both active. Gender and occasion values removed (see §0). |
| `Occasion` | 5 | `Casual, Festive, Wedding, Office, Traditional`, all active. |
| `Collection` | **0** | Feature empty. |
| `Store` | **0** | **Empty by design.** The fabricated placeholder records (invented addresses, phone numbers and mailboxes) have been removed from `prisma/seed.ts` and from the database, and no store is seeded any more. Intended to stay empty until real locations are supplied — see §2 and §5. |
| `Festival` | 3 | Diwali / Lohri / Baisakhi demo campaigns, all `INACTIVE` and `enabled: false`. |
| `Faq` | **0** | **The FAQ table is empty.** The generic demo rows have been deleted; `/faq` now reads this table (§5). |
| `CompanyContent` | 5 | Appearance tokens only (`appearance.primaryColor`, `accentGold`, `typography`, `buttonStyle`, `cardRadius`). |
| `StorefrontConfig` | **0** | **Custom configuration deleted.** No `DRAFT` and no `PUBLISHED` homepage row, so the **built-in homepage defaults are the served content** and `/api/v1/site` reports `version: null` (see §2). |
| `Enquiry` | **0** | The fabricated test enquiries (invented names and mailboxes) have been deleted. See §5.2 item 1 for the backed-up copies that still existed on disk. |
| `SystemBackup` | **0** | No backup records. `backups/` is empty on disk as well — see §5.2 item 1. |
| `AdminAuditLog` | 101 | Grows with admin activity; 101 entries at the time of this measurement. Audit history is not content and was not purged. |
| `Discount` | 0 | — |

### Structural problems found while taking inventory

1. **Images bypass the media system.** Products referenced external stock URLs directly, contradicting the
   Task 11 requirement that *every image is properly associated through the existing media system*.
   **Moot now** — `ProductImage` is empty and the placeholder product records that carried those hotlinks
   have been removed (§0, §1). The enforcement added in §0 (`validateManagedImageUrls()`) still stands, so a
   new product cannot reintroduce an unmanaged URL.
2. **`Category` conflated two dimensions.** `Men`/`Women` are gender, while `Casual`/`Festive`/`Office`/
   `Traditional`/`Wedding` are occasions. **Resolved** — see §0: `Category` now holds product types only
   (Jutti, Mojari) and `Occasion` holds the five occasion values.
3. **`appearance.accentGold` is `#40bbc4`** — a teal/cyan, not gold. It contradicts both its own key name and
   the `#D4AF37` gold used throughout the admin design system.
4. **Store emails used a fabricated mailbox domain** while the production domain is `fashionfeet.co.in`.
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
**The catalogue is empty (`Product` 0, `ProductImage` 0 — §1), so every item below is still to be supplied.**
- [ ] Real **product name**
- [ ] Real **price** (and `promoPrice`/`discount` if applicable)
- [ ] Real **category** (and confirm the intended category taxonomy — see finding 2)
- [ ] **Gender** and **occasion**
- [ ] **Material** and **colours**
- [ ] **Sizes** and size-guide mapping
- [ ] **Care instructions**
- [ ] **Description** and **craftsmanship** copy
- [ ] **Photographs** — see §3
- [ ] Which products are `featured` / `isNewArrival` / `isBestSeller` / `isFestivalExclusive`

### Collections and occasions
- [ ] Real **collections** (title, description, thumbnail, banner, display order) — table is empty
- [ ] Real **occasions** — the 5 current values (`Casual, Festive, Wedding, Office, Traditional`) are demo
      taxonomy: confirm, rename or replace them
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
- [ ] Confirm/approve the homepage hero copy and sections — **there is no `StorefrontConfig` row at all**
      (§1), so what is served today is the built-in default homepage, not a stored demo copy
- [ ] Real **homepage imagery**
- [ ] Real **festival/seasonal imagery** and which campaigns are genuinely run (3 demo festivals exist, all inactive)

### Company / contact
- [ ] Footer/about/contact/policy copy and real contact channels
- [ ] Social handles and any GST/legal identifiers to display

---

## 3. Photographs — the critical dependency

Task 11 asks for **real jutti photographs**. There are currently **zero** Fashion Feet image files anywhere in
the project — and, at the time of measurement, no image *references* either: `ProductImage` is empty (§1), so
nothing in the database points at an image of any kind. Until real photographs exist, any "content completion"
pass would have to substitute something that is not Fashion Feet.

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

## 5. Verified content defects found while removing the fabricated content

Recorded here so they are not lost. One defect has been **fixed** (5.1); the rest are **open items — not
fixed**. None of them is a build, lint or type error, which is exactly why none was caught by the existing
checks.

### 5.1 Fixed in this pass

1. **The website's FAQ page now reads the FAQ table (was: a hardcoded array).** The public `/faq` page used
   to render a **hardcoded `FAQ` array** in `src/app/faq/FaqClient.tsx`, entirely separate from the rows in
   the database `Faq` table that `GET /api/v1/faqs` serves. The two disagreed — different questions, and
   until the store cleanup they also disagreed about store locations — so the website and the mobile app
   showed *different* FAQs and a FAQ edited in the admin console could not change what the website
   displayed. **Fixed:** `src/app/faq/page.tsx` is now `dynamic = "force-dynamic"` and reads
   `prisma.faq.findMany({ orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }] })` — the **same table
   and the same ordering as `GET /api/v1/faqs`** (`src/app/api/v1/faqs/route.ts`) — and passes the rows to
   `FaqClient`, which renders them. The two clients can no longer drift. With `Faq` at **0 rows** (§1) the
   page currently renders its explicit empty state ("Our FAQs are being updated — please check back
   shortly.") instead of a stale hardcoded list.

### 5.2 Open items — not fixed

1. **A test run writes a real database snapshot into `backups/` as a side effect, so data that was deleted
   from the live database can be re-materialised on disk — and the file survives the run, untracked.**
   `createDatabaseBackup()` (`src/lib/backup.ts:28`) runs `VACUUM INTO` (line 42) and writes a full copy of
   `dev.db` to `backups/backup_<timestamp>.db` (lines 36–38). Both acceptance scripts trigger it:
   `npm run test:acceptance` calls it directly (`src/scripts/test-all-acceptance.ts:219`), and
   `npm run test:gate2` clicks the admin "Create DB Backup" button (`src/scripts/run-gate-2-acceptance.js:463–474`),
   which runs the same helper. The acceptance script then deletes the `SystemBackup` **record**
   (`src/scripts/test-all-acceptance.ts:246`) but **not the file on disk**, so the snapshot remains in
   `backups/` with nothing in the database pointing at it.
   **Measured consequence:** a backup file produced by such a run contained the personal data — a name and
   an email address — of the fabricated test enquiry that had already been deleted from the live database.
   In other words, the `Enquiry` table read 0 rows while the same data was still readable inside the
   snapshot: **test runs re-materialise deleted data on disk.** A purge is therefore not complete until
   `backups/` is cleared, and any future deletion of personal data must be followed by removing stale
   snapshots. (`backups/` is empty and `SystemBackup` reads 0 at the time of this measurement — the defect
   is that the next test run recreates the exposure, not that a file is present today.)
2. **The contact form fakes a successful submission.** `src/app/contact/ContactClient.tsx` resolves on a
   `setTimeout` (line 14, with a nested reset timer at line 17) and then displays "Message Sent
   Successfully!" (line 76) — nothing is sent and nothing is stored. Anyone using that form is told their
   message was delivered when it was not. This matches the mobile app's honest "Not sent" behaviour
   (`MobileApp.md` §5) only in the sense that neither transmits anything; the web form is the one that lies
   about it.
3. **Unverified product/material claims are still published and are awaiting the owner's confirmation.**
   These are **deliberately retained** (they are brand claims, not defects that can be fixed by an
   engineer), and they are **unverified — this file does not assert that any of them is false**; each needs
   a yes/no from the owner, because each is a factual claim about the goods. Occurrence counts and line
   numbers are case-insensitive measurements across `src/` at the time of this pass (see the note in §6 about
   line numbers moving as `src/` is edited):

   | Claim | Occurrences | Files |
   |---|---|---|
   | "100% Handcrafted" | 4 | `src/components/home/Features.tsx:8`, `src/components/home/HeritageArtistrySection.tsx:40`, `src/components/home/HeroEditorialShowcase.tsx:82`, `src/components/layout/CollectionsMegaMenu.tsx:65` |
   | "100% Genuine vegetable-tanned leather sole" | 1 | `src/app/product/[id]/ProductClient.tsx:246` |
   | "genuine leather" | 7 | `src/components/admin/ProductCatalogClient.tsx:114`, `src/components/home/FeaturedCollections.tsx:37`, `src/components/home/HeritageArtistrySection.tsx:82`, `src/components/home/Hero.tsx:62`, `src/components/home/InteractiveSizeFinderSection.tsx:179`, `src/components/home/VirtualShowroom.tsx:27`, `src/components/home/VirtualShowroom.tsx:55` |
   | "vegetable-tanned" | 6 | `src/app/product/[id]/ProductClient.tsx:246`, `src/components/home/CraftsmanshipScrollStory.tsx:12`, `src/components/home/HeritageArtistrySection.tsx:34`, `src/components/home/HeroEditorialShowcase.tsx:36`, `src/components/home/VirtualShowroom.tsx:55`, `src/lib/storefrontConfigTypes.ts:61` |
   | "silk velvet" | 9 | `src/components/admin/ProductCatalogClient.tsx:114`, `src/components/home/CraftsmanshipScrollStory.tsx:23`, `src/components/home/FeaturedCollections.tsx:21`, `src/components/home/HeritageArtistrySection.tsx:34`, `src/components/home/HeroEditorialShowcase.tsx:24`, `src/components/home/Real3DJuttiHeroCanvas.tsx:103`, `src/components/home/Real3DJuttiHeroCanvas.tsx:235`, `src/components/home/VirtualShowroom.tsx:19`, `src/lib/mediaConstants.ts:8` |
   | "Pure Leather Soles" | 1 | `src/lib/themeTokens.ts:55` |

   The claim "100% Genuine vegetable-tanned leather sole" is the strongest of them and sits on the product
   page (`src/app/product/[id]/ProductClient.tsx:246`), which is currently unreachable in practice because
   there are no products to open (§1). The wording is still in the code and would publish again with the
   first real product.
4. **The word "Atelier" is still present and its replacement is still undecided.** It is not confined to
   the rows tabulated in §6: at the time of measurement it appeared in **29 lines of `src/`** — published
   storefront copy (`src/components/layout/Footer.tsx:13`, `src/components/home/VirtualShowroom.tsx:171`,
   `src/lib/seasonalConstants.ts:31`, `src/lib/storefrontConfigTypes.ts:58,164`), the SEO/metadata strings
   in `src/app/layout.tsx`, the accessibility theme name (`src/app/accessibility/page.tsx:34`), design-token
   and theme names (`src/lib/themeTokens.ts:34`, `src/app/globals.css:22`), festival fallback / admin console
   copy (`src/app/actions/festivals.ts:24,117,299`, `src/components/admin/FestivalStudioClient.tsx` (7
   lines), `src/components/admin/EnquiriesInboxClient.tsx:157,250,274`,
   `src/components/shop/EnquiryModal.tsx:194`) and two test scripts — plus 2 occurrences in `prisma/seed.ts`
   demo campaign copy. That figure is a **snapshot, not a fixed total**: the count moved from 24 to 29 during
   this documentation pass as concurrent edits to `src/` landed, so line numbers should be re-confirmed
   before acting on them. Choosing the replacement wording is the owner's decision, not an engineering fix,
   so nothing was changed; see §6.

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

> Line numbers above are as measured during this pass. Several `src/` files were being edited concurrently,
> so re-confirm a line reference before acting on it — the wording, not the line number, is the claim.

> **"Since 1994" is an invented founding year.** It is a **factual claim about the business**, not a
> style choice, so it must not be removed silently and must not be swapped for another guess. It needs
> explicit confirmation from you — supply the real founding year, or confirm removal. Until then it
> stays exactly as it is, listed here as a content defect awaiting a decision.

> **The "Atelier" wording is likewise still undecided.** The table above lists the published occurrences;
> the same word also appears in design-token names, festival fallback labels, admin console copy and the
> demo campaign copy in `prisma/seed.ts` (see §5.2 item 4 for the measured list). No replacement wording has
> been chosen, so none was applied. This is a decision for the owner, not a defect fix.

