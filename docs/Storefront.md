# Storefront Architecture & Route Specification

## Information Architecture & Navigation

Primary Header Navigation is frozen:
1. `Home` (`/`)
2. `Men` (`/men`)
3. `Women` (`/women`)
4. `Collections` (`/shop` with mega-dropdown: `Wedding`, `Festive`, `Casual`, `Office`, `Luxury`, `Heritage`, `Best Sellers`)
5. `New Arrivals` (`/shop?type=new`)
6. `Size Studio` (`/size-guide`)
7. `About` (`/about`)
8. Dynamic Seasonal Campaign Badge (e.g. `✨ Diwali Collection`) when a festival preset is active

## Route Map

| Route | Purpose | Key Components |
|-------|---------|----------------|
| `/` | Brand Homepage | `Hero`, `CraftsmanshipScrollStory`, `TrendingProductsClient`, `VirtualShowroom`, `InteractiveSizeFinderSection` |
| `/men` | Men's Punjabi Jutti Catalog | `ShopClient` with `gender=Men` |
| `/women` | Women's Punjabi Jutti Catalog | `ShopClient` with `gender=Women` |
| `/shop` | Full Product Catalog & Filters | `ShopClient` with category, occasion, price & size filters |
| `/product/[id]` | Product Details & Fitting Enquiry | `ProductClient`, `EnquiryModal`, `Accordion` |
| `/size-guide` | Interactive Size & Fitting Studio | `InteractiveSizeFinderSection`, foot length cm slider, size conversion matrix |
| `/profile` | Customer Profile & Favorites | Customer dashboard, saved size, favorites grid |
| `/stores` | Boutiques Showcase | **Displays "Stores Coming Soon" with launch notification form** |
| `/about` | Brand Heritage Narrative | 400-year Punjabi craftsmanship story |
| `/contact` | Enquiries | Direct contact form & store concierge details |
| `/faq` | Frequently Asked Questions | **1st Question: "Why doesn't Fashion Feet offer online shopping?"** |
| `/privacy` | Privacy Policy | Customer data protection terms |
| `/terms` | Terms of Service | Fitting terms |
| `/accessibility` | Accessibility Statement | WCAG AA standards, contrast rules, & feedback details |
| `/not-found` | 404 Route Error Page | Custom 404 view |

## Storefront Content as Public JSON (`/api/v1`)

The storefront's published content is now also served, read-only, as public JSON for the native mobile client. Same source tables and the same published/active filters the pages use, with every response field whitelisted by `src/lib/publicSerializers.ts`:

| v1 Route | Serves |
|-------|--------|
| `GET /api/v1/products` | Published catalogue. Query: `category`, `occasion`, `collection`, `q`, `limit` (default 24, max 60), `offset` — returns `pagination: { total, limit, offset, hasMore }` |
| `GET /api/v1/products/:idOrSku` | One product by cuid **id** or unique **sku** — there is no slug; `404` → `{ error: "Product not found" }` |
| `GET /api/v1/categories` | Active product types (Jutti, Mojari) |
| `GET /api/v1/collections` | Visible + `PUBLISHED` collections — currently empty, so this legitimately returns `[]` |
| `GET /api/v1/occasions` | Active occasions |
| `GET /api/v1/stores` | `OPEN`, `COMING_SOON` and `TEMPORARILY_CLOSED` locations |
| `GET /api/v1/faqs` | All FAQs, pinned first |
| `GET /api/v1/site` | Appearance tokens plus the published homepage composition (`page`, `version`, `publishedAt`, `sections`) |

`GET`/`OPTIONS` only, unauthenticated by design, rate-limited at 120 requests/min per IP, and cached `public, max-age=60` (120s for `/site`). The full contract and field lists are in [MobileApp.md](MobileApp.md).
