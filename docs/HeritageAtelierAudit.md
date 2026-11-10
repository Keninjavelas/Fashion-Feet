# Heritage Atelier storefront refinement

Audit date: 29 October 2026. This document describes the public storefront only; the admin is a separate deployment with its own dark interface.

## Before and after

- Desktop homepage: [before](visual-audit/home-desktop-before.png) · [after](visual-audit/home-desktop-after.png)
- Mobile homepage: [before](visual-audit/home-mobile-before.png) · [after](visual-audit/home-mobile-after.png)
- Updated category and information pages: [women, desktop](visual-audit/women-desktop-after.png) · [women, mobile](visual-audit/women-mobile-after.png) · [size guide, mobile](visual-audit/size-mobile-after.png) · [stores, desktop](visual-audit/stores-desktop-after.png)

The earlier homepage allocated large panels to nine procedural WebGL canvases, particles, a repeated hanging footwear graphic, curved ornaments, and small generic shoe models. The updated homepage has zero canvases. It leads with a large photographed pair, three distinct catalogue images, a photographed detail feature, a simpler measurement guide, and the two actual exhibition photographs. The global decoration and card tilt were removed. The exhibition archive retains real documentary images and does not invent dates or venues.

The final design favors the ivory/oxblood/espresso palette. Product imagery uses a neutral frame and `object-contain`; documentary photography uses `object-cover`. The public header retains the official logo and tagline. The general enquiry action now leads to the real contact page. The default announcement marquee is off because its free fitting and shipping claims were not verified.

## Public route inventory

- `/`: dynamic homepage; published Studio sections, collections, product highlights, photographic story, and exhibition archive.
- `/men`, `/women`: gender collection pages. Both now show photographed catalogue previews — Women with 28 studio-cutout photos across Daily Wear, Festive, Ceremonial, and Rajwadi; Men with the Functional and Office Wear galleries plus the 50-photo WhatsApp import across Daily Wear, Festive, Functional, and Office Wear. Individual purchasable product records are still pending verified names, prices, sizes, and availability.
- `/shop`: published product browser; when there are no published products, general and women catalogue views show the women's photographed designs. Men, search, and New Arrivals without matches show an honest empty state.
- `/product/[id]`: published product detail, photo gallery, size options, wishlist, and enquiry when a valid product exists.
- `/size-guide`: measurement instructions, optional profile saving, and contact guidance. No automatic size mapping or fit guarantee is offered.
- `/about`: editorial brand page with photographed collection and historical exhibition imagery.
- `/stores`: published location cards when locations exist; otherwise an online discovery route with a real exhibition photograph.
- `/festive`: catalogue page for published festive products.
- `/faq`, `/contact`: database-backed FAQs and a real contact submission form.
- `/cart`: clear explanation of the current enquiry-led flow. `/checkout` and `/checkout/success` redirect to `/shop`.
- `/login`, `/register`, `/profile`, `/profile/favorites`, `/profile/notifications`, `/profile/preferences`, `/profile/recent`, `/profile/settings`, `/profile/size`: customer account and saved-information routes.
- `/privacy`, `/terms`, `/accessibility`: information and policy pages.
- `/unauthorized`: access error page. `/_not-found` is Next.js's missing-page route.
- `/robots.txt`, `/sitemap.xml`: generated discovery files.
- `/api/auth/[...nextauth]`, `/api/judy`, `/api/search`, `/api/v1/categories`, `/api/v1/collections`, `/api/v1/faqs`, `/api/v1/occasions`, `/api/v1/products`, `/api/v1/products/[id]`, `/api/v1/site`, `/api/v1/stores`: public and customer-facing API routes.

The admin lives in `apps/admin` and is deployed separately at `fashion-feet-admin.vercel.app`. This redesign did not change its security or editor behavior. Published storefront text, images, and ordering continue to come from the shared database. Legacy copy stored in that database may still need editorial review; known unsupported default material and fitting claims are replaced in the public presentation.

## Components and styles changed

- Global: `src/app/globals.css`, `src/lib/themeTokens.ts`, `StorefrontLayout`, `FestivalProvider`, `Navbar`, `Footer`, and Judy launcher.
- Homepage: `Hero`, `FeaturedCollections`, `HeritageArtistrySection`, `InteractiveSizeFinderSection`, `CraftsmanshipScrollStory`, `TrendingProductsClient`, and `src/app/page.tsx`.
- Commerce: `CollectionPage`, `ShopClient`, `StorefrontTiltCard`, `QuickViewModal`, product detail, `/shop`, `/cart`, and the women's preview gallery.
- Information: `/about`, `/stores`, `/size-guide`, customer profile size, and the shared site footer.

## Image and 3D provenance

The hero and catalogue features use the owner's women's footwear photos and their existing normalized studio previews under `public/catalogue/women/`. The close-up feature uses `public/catalogue/women/ceremonial/05.jpeg`. The archive and store discovery surface use the owner's `public/exhibitions/display-shelves.jpg` and `display-tables.jpg`. Preview names describe appearance; they are not verified business SKUs.

No faithful, product-specific 3D asset was found. Generic procedural shoes are no longer presented as real product models in ordinary browsing or quick view. The future interactive display proposal remains in `display.md` and requires real asset production before implementation.

## Verification

- `FF_BUILD_DIR=build npm run build` passed, including TypeScript and route generation. The local OneDrive checkout kept the default `.next` cache open, so the build used Next.js's supported isolated `distDir`; Vercel continues to use `.next` by default.
- The browser sweep visited 11 public routes at 375, 390, 768, 1024, 1440, and 1920 px: 66 route/viewport checks. Every page returned HTTP 200, with no page errors, broken loaded images, or horizontal overflow. Desktop and mobile screenshots were inspected.
- Automated axe-core WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA checks passed with zero reported violations on `/`, `/women`, `/shop`, `/size-guide`, `/about`, `/stores`, `/faq`, and `/contact` at 375 and 1440 px, after page transitions settled. This does not replace manual keyboard and assistive-technology review.
- The existing production homepage had nine canvases in a sampled browser session. The updated local homepage had zero. A sampled local and remote navigation timing is not a valid speed comparison because the servers and network paths differ. Image bytes can increase when genuine photographs are shown; continued image delivery monitoring is warranted.
- Product price, size, enquiry, and wishlist UI builds, but end-to-end purchase or product-detail verification requires a published product record. The current public API returned no published products or stores during the audit.

## Remaining business inputs

- Verified men's product records with names, prices, available sizes, and inventory. Owner-supplied men's photographs arrived on 1, 2, and 7 November 2026 and are live as previews; the women's previews are likewise not yet purchasable products.
- A verified Fashion Feet size chart before automatic size recommendations or conversion tables return.
- Verified workshop/process photographs and reviewed manufacturing claims before presenting a four-stage craft process as fact.
- Store addresses and opening details before an in-person store experience is promoted.
- At the time of this audit, domain DNS at GoDaddy and Resend DNS/API verification were pending. Formspree outbound contact notifications were later configured and delivered to the Microsoft 365 inbox on 6 November 2026. The domain work completed on 10 November 2026: authoritative queries returned the apex A record `76.76.21.21`, the Microsoft 365 MX and TXT records measured unchanged, and `https://fashionfeet.co.in` served the storefront with a Vercel-issued certificate; Resend verification remains unnecessary because the Formspree route is active. The public `/api/v1` catalogue measured zero products, stores, and collections on 9 November, matching the preview-only gallery state described above. Measured again on 10 November after the production redeploy, that zero state no longer holds: `/api/v1/products` reported `pagination.total: 85` with prices in the ₹1599–₹3499 range, `/api/v1/collections` returned four published collections, `/api/v1/stores` stayed empty, and `/men` server-rendered 58 distinct `/product/…` links. The photographs in the preview galleries remain static media, but the storefront now also publishes purchasable-looking product records whose names, prices, sizes, and availability have not been confirmed by the business owner and whose input data is not in this checkout.
