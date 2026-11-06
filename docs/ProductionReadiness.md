# Production operations and remaining work

Status checked on **26 October 2026**. The storefront and isolated admin dashboard are deployed on Vercel and share Neon PostgreSQL. The storefront is reachable at `https://fashion-feet-storefront.vercel.app`; the admin is at `https://fashion-feet-admin.vercel.app`. This is a live deployment, not the earlier single-process SQLite prototype.

**27 October content update:** The three catalogues (Daily Wear, Festive, Ceremonial) are live for Men and Women. The owner supplied 21 women's footwear photographs for preview galleries. The individual product table remains empty pending verified names, prices, sizes, and availability; gallery photographs must not be described as purchasable listings.

**1 November content update:** Seven more owner-supplied photographs were moved into a women-only Rajwadi gallery, named from the separate `f unique` reference. The 28 photos remain previews, not purchasable product records. The Rajwadi reference carries other branding and is kept in project documentation rather than displayed publicly.

**1 November men's content update:** The owner supplied `mens.jpeg`, showing five individual juttis in one photograph. Five cutouts now form the men-only Functional gallery. The source photo's `320` label has not been used as a selling price. These are previews pending verified product information.

**2 November men's content update:** Three owner-supplied `m o` photographs show black, brown, and tan matched pairs. The men-only Office Wear gallery presents each pair in a consistent frame. These are previews pending verified product information.

## Checks already completed

- Both Next.js 16 production builds completed successfully during the separate-deployment work.
- `npm run test:isolation` verified that the storefront build excludes admin routes and admin Server Actions.
- The public contact page renders `aryan.kapoor@fashionfeet.co.in`; contact and product enquiries use one Server Action that saves an `Enquiry` row before attempting notification.
- The FAQ page and `/api/v1/faqs` read the same shared PostgreSQL FAQ rows. Historical FAQs were restored, and the requested “Launch special festive collections” entry was removed.
- The admin project has its own password/TOTP flow, database-backed sessions, role checks, and Vercel Authentication gate. Its production environment includes the shared database URL and Vercel Blob token.

These checks do not certify every administrator workflow or inbox delivery. Re-run the builds and isolation check when preparing a new release, and exercise changed workflows against the deployed projects.

## Open production work

1. **Custom domain:** `fashionfeet.co.in` is attached to the storefront Vercel project, but GoDaddy has no apex A record for it. A DNS administrator must add `A @ 76.76.21.21`, preserving the Microsoft 365 MX records. Verify HTTPS after propagation. Then update storefront `AUTH_URL` and `NEXTAUTH_URL` and admin `NEXT_PUBLIC_STOREFRONT_URL` to `https://fashionfeet.co.in`, redeploy, and test customer sign-in and admin links.
2. **Outbound enquiry email:** Formspree is the selected DNS-free route while GoDaddy access is unavailable. Its form targets the verified `aryan.kapoor@fashionfeet.co.in` address, and `FORMSPREE_FORM_ID` is set on the storefront Vercel Production environment. A live test enquiry was saved by the storefront and appeared in Formspree's Inbox on 6 November. Confirm actual delivery into the Microsoft 365 mailbox before considering this complete. The code uses Formspree when its ID is set; the prior Resend route remains available when it is not. The Resend subdomain `mail.fashionfeet.co.in` is still unverified and has no production sending key.
3. **Business content review:** Revisit restored FAQ answers, material/fit claims, shipping or offer language, store information, and seasonal copy with the business owner. The historical intake report in [ContentIntake.md](ContentIntake.md) is evidence of earlier findings, not a current inventory.
4. **Signup placeholders:** The store-launch “Notify Me” and footer newsletter forms do not persist subscriptions yet. Connect them to an approved subscription process or change their UI before treating them as live signup channels.
5. **Mobile release:** `mobile/` is Expo source only. It still needs its own build/signing, store submission, and live client verification. Public API compatibility matters once an app is distributed.

## Routine release sequence

1. Review code and content changes; keep `.env`, credentials, local database files, and recovery codes out of Git.
2. Apply pending PostgreSQL migrations with `npm run db:deploy:postgres` using the direct database URL.
3. Run `npm run build`, `npm run build:admin`, and `npm run test:isolation`.
4. Deploy the storefront and admin projects independently. Verify public routes, admin authentication, a published content change, and any workflow touched by the release.
5. For email or DNS changes, test the custom hostname, provider acceptance, and actual arrival in the Microsoft 365 inbox. A provider success response alone does not prove inbox delivery.

## Recovery and limitations

Managed PostgreSQL backups and restores are operated through Neon; the local SQLite backup/restore controls are disabled in production. Confirm the provider's retention and practice a restore before relying on it. Admin login and public API rate limits use application-process state, so they are best-effort across serverless instances; do not treat them as a global abuse control. See [AdminDeployment.md](AdminDeployment.md) and [SecurityHardening.md](SecurityHardening.md) for boundary and historical test details.
