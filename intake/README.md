# Task 11 — Real Content Intake

**Status: waiting on real Fashion Feet assets. Nothing here has been invented.**

Drop your real material into this folder. I will upload it through the Admin Media Library (so every image
becomes a managed `MediaAsset`), associate it to the right products and pages, and remove the placeholder
imagery currently standing in.

The templates in this folder are tracked in git. **Your actual assets are gitignored** — see `.gitignore` — so
adding them will not pollute the repository.

---

## What to put where

```text
intake/
├── logo/          brand logo (SVG or transparent PNG), favicon if you have one
├── products/      product photography — one subfolder per product, or flat
├── homepage/      hero / editorial / seasonal campaign imagery
├── collections/   collection banners and thumbnails
├── stores/        storefront photographs
├── catalogue.csv  <- fill in catalogue-template.csv and save it as catalogue.csv
├── stores.md      <- fill in stores-template.md
└── brand.md       <- fill in brand-template.md
```

**Filenames matter more than folder shape.** If a photo's filename contains the product name (e.g.
`noir-leather-jutti-01.jpg`), I can match images to products automatically. Otherwise just tell me the mapping
in a note — a plain list is fine.

**Send what you have first.** I do not need everything at once. Photography is the real blocker; text and facts
can follow.

---

## 1. Products — `catalogue.csv`

Use `catalogue-template.csv` (header row is already exact). Columns:

| Column | Required | Notes |
|---|---|---|
| `title` | **yes** | Real product name |
| `category` | **yes** | Product type. `Category` currently holds `Jutti`, `Mojari` — replace with your real taxonomy |
| `gender` | **yes** | `Men` / `Women` / `Unisex` |
| `price` | **yes** | Number only, no currency symbol |
| `promoPrice` | no | Leave blank if not on offer |
| `occasion` | no | Must match an `Occasion` row: `Casual`, `Festive`, `Wedding`, `Office`, `Traditional` (extend if needed) |
| `material` | no | Currently **NULL on every product** |
| `colors` | no | Currently **NULL on every product** |
| `sizes` | no | e.g. `36,37,38,39,40` |
| `care` | no | Care instructions |
| `description` | **yes** | Real product copy |
| `craftsmanship` | no | Craft/heritage detail |
| `featured` `isNewArrival` `isBestSeller` `isFestivalExclusive` | no | `true` / `false` |
| `imageFiles` | no | Filenames from `intake/products/`, comma-separated |

Example row (illustrative only — **not** real data, do not ship it):

```text
title,category,gender,price,material,imageFiles
Example Product Name,Mojari,Women,2499,Leather,"example-01.jpg,example-02.jpg"
```

## 2. Stores — `stores.md`

Use `stores-template.md`. Fields: name, type, street, city, state, PIN, phone, email, WhatsApp, opening hours,
services, accessibility notes, map URL, photographs.

The three stores currently in the database (Patiala / Chandigarh / New Delhi) have **invented addresses, phone
numbers and `@fashionfeet.com` emails**. Tell me which are real, which need renaming, and which to delete.

## 3. Brand — `brand.md`

Use `brand-template.md`. I need:

- the **exact brand name** to render (the app currently falls back to a hardcoded string `"Fashion Feet"`)
- the **logo** file
- **colour confirmation** — see the open question below
- footer / about / contact / policy copy, and social handles

### Open brand question

`appearance.accentGold` is currently **`#40bbc4` (a teal)** — which contradicts both its own key name and the
`#D4AF37` gold used throughout the admin design system. `appearance.primaryColor` is `#1A1A1A`. Typography is
`Cinzel & Inter`.

I have deliberately **not** changed these, because brand colours are your decision, not a bug fix. Confirm the
real values and I will apply them.

## 4. Imagery notes

All product images currently in the database are **third-party stock photos**, now replaced with neutral local
placeholders. `images.remotePatterns` is empty, so an external stock hotlink can no longer render — your real
photographs go through the media system into `public/uploads/`.

For each image, if you can, note the subject and (for products) which product. Alt text is worth supplying —
it feeds accessibility and SEO.

Seasonal/festival imagery: the database has three **inactive demo campaigns** (Diwali, Lohri, Baisakhi). Tell me
which campaigns you actually run and when, and I will set them up properly.
