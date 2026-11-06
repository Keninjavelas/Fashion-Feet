# Public API and server actions

The storefront serves a read-only, unauthenticated `/api/v1` JSON API for its Expo client. Routes exist for `products`, `products/[id]`, `categories`, `collections`, `occasions`, `stores`, `faqs`, and `site`. Product lookups accept a product ID or SKU. List endpoints filter to public/published data and return fields shaped by `src/lib/publicSerializers.ts`; do not expose raw Prisma models.

`GET /api/v1/occasions` keeps its historical endpoint name but returns six canonical catalogues: Daily Wear, Festive, Ceremonial, women-only Rajwadi, and men-only Functional and Office Wear. Its `genders` field identifies valid fits for each. `GET /api/v1/products?occasion=daily-wear&gender=Men` (or the display name) combines a catalogue with a fit; Unisex products appear in either Men or Women results for the shared catalogues. Rajwadi, Functional, and Office Wear photos are gallery previews, so this product endpoint will list them only after verified product records are published.

`src/lib/publicApi.ts` handles CORS, errors, and a best-effort per-instance rate limit. Responses are currently `Cache-Control: no-store` so admin publications appear on the next request. The mobile contract and response shapes are detailed in [MobileApp.md](MobileApp.md).

Other storefront endpoints include `/api/search`, `/api/judy`, and the customer Auth.js route `/api/auth/[...nextauth]`. Admin audit/health and upload endpoints live only in the separate `apps/admin` deployment.

Contact and product enquiry forms call the `createEnquiry` Server Action in `src/app/actions/createEnquiry.ts`. It validates input, writes an `Enquiry`, then submits a notification to Formspree when `FORMSPREE_FORM_ID` is set; otherwise it uses the legacy Resend path when `RESEND_API_KEY` is set. The Formspree form must target the verified `aryan.kapoor@fashionfeet.co.in` address. The action reports provider acceptance; the dashboard row remains available if notification fails. Provider acceptance does not prove mailbox delivery. Other admin actions reside in shared source files but are imported only by the admin application; verify with `npm run test:isolation`.
