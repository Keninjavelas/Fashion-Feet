# Production operations and remaining work

Status checked on **26 October 2026**, operationally rechecked on **8 and 9 November 2026**, and rechecked after the domain connection on **10 November 2026** (see below). The storefront and isolated admin dashboard are deployed on Vercel and share Neon PostgreSQL. The storefront is reachable at `https://fashionfeet.co.in` (and still at `https://fashion-feet-storefront.vercel.app`); the admin is at `https://fashion-feet-admin.vercel.app`. This is a live deployment, not the earlier single-process SQLite prototype.

**27 October content update:** The three catalogues (Daily Wear, Festive, Ceremonial) are live for Men and Women. The owner supplied 21 women's footwear photographs for preview galleries. The individual product table remains empty pending verified names, prices, sizes, and availability; gallery photographs must not be described as purchasable listings.

**1 November content update:** Seven more owner-supplied photographs were moved into a women-only Rajwadi gallery, named from the separate `f unique` reference. The 28 photos remain previews, not purchasable product records. The Rajwadi reference carries other branding and is kept in project documentation rather than displayed publicly.

**1 November men's content update:** The owner supplied `mens.jpeg`, showing five individual juttis in one photograph. Five cutouts now form the men-only Functional gallery. The source photo's `320` label has not been used as a selling price. These are previews pending verified product information.

**2 November men's content update:** Three owner-supplied `m o` photographs show black, brown, and tan matched pairs. The men-only Office Wear gallery presents each pair in a consistent frame. These are previews pending verified product information.

**7 November men's content update:** Fifty distinct men's footwear photos from the owner's WhatsApp chat were added to the Daily Wear, Festive, Functional, and Office Wear preview galleries. The first three chat photos matched existing Office Wear designs and were not added again. Two photos of open-back, decorated footwear remain in local intake because their fit/category is uncertain. See [MensWhatsAppImport.md](MensWhatsAppImport.md) for the import audit. The new photos are displayed in uniform frames with their original backgrounds; they have not yet received the studio-cutout treatment used by earlier galleries. Ceremonial has no verified men's photos yet. Prices, sizes, and stock remain unverified, so these are not purchasable product records.

**8 November operational recheck:** Measured today over public HTTPS: the storefront alias returned `200`, and the admin alias returned its configured Vercel Authentication redirect. An authoritative query of the domain's GoDaddy nameservers (`ns67`/`ns68.domaincontrol.com`) still returned no apex A record for `fashionfeet.co.in`, and `www.fashionfeet.co.in` is NXDOMAIN. Open work item 1 therefore remains open. Enquiry notification remains on the verified Formspree route; no Resend DNS work is required while it stays active.

**9 November status recheck:** Nothing changed. The authoritative GoDaddy nameservers again returned no apex A record (serial `2026060713`) and `www` is still NXDOMAIN. The storefront alias served `200`, including the public read API (`/api/v1/site`). Measured the same day: `/api/v1/products` reports `total: 0`, and `/api/v1/stores` and `/api/v1/collections` return empty arrays — consistent with the November galleries being photographed previews rather than published product records.

**10 November domain connection:** The apex A record was added in the GoDaddy DNS console while the Microsoft 365 records were kept. Measured the same day: Google and Cloudflare DNS-over-HTTPS both resolve `fashionfeet.co.in` to `76.76.21.21` from the GoDaddy nameservers, the MX record still returns `0 fashionfeet-co-in.mail.protection.outlook.com.`, and both TXT records (`MS=ms56660859` and the Outlook SPF) are unchanged. The zone serial advanced to `2026111000`. Vercel reports the hostname as verified on `fashion-feet-storefront`, moved through `Generating SSL Certificate`, and now serves `https://fashionfeet.co.in/` and `/faq` with `200`; `/api/v1/site` and `/api/v1/products` return `200` with `Cache-Control: no-store` and the same headers as the Vercel alias. `/admin` on the custom hostname returns `307` to `https://fashion-feet-admin.vercel.app/admin`, and `npm run test:isolation` still reports 43 storefront routes, 23 admin routes, and no shared Server Actions. `www.fashionfeet.co.in` remains NXDOMAIN by choice until a redirect target is selected.

## Checks already completed

- Both Next.js 16 production builds completed successfully during the separate-deployment work.
- `npm run test:isolation` verified that the storefront build excludes admin routes and admin Server Actions.
- The public contact page renders `aryan.kapoor@fashionfeet.co.in`; contact and product enquiries use one Server Action that saves an `Enquiry` row before attempting notification.
- Formspree sends enquiry notifications to the verified contact mailbox without Fashion Feet DNS changes. On 6 November, one live contact submission was saved, appeared in Formspree, and was confirmed delivered to the Microsoft 365 inbox. The Formspree account has two-factor authentication enabled.
- The FAQ page and `/api/v1/faqs` read the same shared PostgreSQL FAQ rows. Historical FAQs were restored, and the requested “Launch special festive collections” entry was removed.
- The admin project has its own password/TOTP flow, database-backed sessions, role checks, and Vercel Authentication gate. Its production environment includes the shared database URL and Vercel Blob token.

These checks do not certify every administrator workflow or inbox delivery. Re-run the builds and isolation check when preparing a new release, and exercise changed workflows against the deployed projects.

## Open production work

1. **Custom domain — connected on 10 November 2026.** `A @ 76.76.21.21` is live at the GoDaddy nameservers with the Microsoft 365 MX, SPF, and verification TXT records unchanged, and `https://fashionfeet.co.in` now serves the storefront with a Vercel-issued certificate (see the 10 November paragraph for the measurements). Remaining verification on the new hostname: submit one live enquiry and confirm inbox arrival, and exercise customer sign-in and any absolute admin links stored in database content. The storefront still also serves `fashion-feet-storefront.vercel.app`; choosing a canonical host or alias redirect in Vercel is a separate decision, and `www` needs its own record only if it should resolve.
2. **Business content review:** Revisit restored FAQ answers, material/fit claims, shipping or offer language, store information, and seasonal copy with the business owner. The historical intake report in [ContentIntake.md](ContentIntake.md) is evidence of earlier findings, not a current inventory.
3. **Newsletter subscription:** The footer newsletter form is live and persists subscriber emails directly to the database via `subscribeNewsletterAction`, protected by rate limiting and an invisible honeypot. Subscribers can be viewed, filtered, and exported directly as a CSV from the Admin Enquiries Inbox.
4. **Mobile release:** `mobile/` is an Expo React Native companion client, fully updated and passing strict typechecking. It seamlessly consumes the public `/api/v1` endpoints (products, categories, occasions, site config) and features pre-filled enquiry handoff. When ready for store deployment, execute EAS build and app store credentials signing.

## Routine release sequence

1. Review code and content changes; keep `.env`, credentials, local database files, and recovery codes out of Git.
2. Apply pending PostgreSQL migrations with `npm run db:deploy:postgres` using the direct database URL.
3. Run `npm run build`, `npm run build:admin`, and `npm run test:isolation`.
4. Deploy the storefront and admin projects independently. Verify public routes, admin authentication, a published content change, and any workflow touched by the release.
5. For email or DNS changes, test the custom hostname, provider acceptance, and actual arrival in the Microsoft 365 inbox. A provider success response alone does not prove inbox delivery.

## Recovery and limitations

Managed PostgreSQL backups and restores are operated through Neon; the local SQLite backup/restore controls are disabled in production. Confirm the provider's retention and practice a restore before relying on it. Admin login and public API rate limits use application-process state, so they are best-effort across serverless instances; do not treat them as a global abuse control. See [AdminDeployment.md](AdminDeployment.md) and [SecurityHardening.md](SecurityHardening.md) for boundary and historical test details.
