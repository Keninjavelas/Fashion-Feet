# Separate admin deployment

The repository contains two Next.js projects:

- Storefront: repository root, Vercel project `fashion-feet-storefront`, with primary domain `https://fashionfeet.co.in` (the Vercel alias is `https://fashion-feet-storefront.vercel.app`).
- Admin: `apps/admin`, Vercel project `fashion-feet-admin`, at `https://fashion-feet-admin.vercel.app`.

**Live status, 6 November 2026:** both Vercel aliases are deployed. The custom storefront hostname is attached to Vercel but does not resolve to the site yet because the GoDaddy apex A record is missing. The storefront has no production Resend key. A Formspree form, verified `aryan.kapoor@fashionfeet.co.in` target, and storefront Production form ID are configured. The live test was accepted and appears in Formspree's Inbox; delivery into Microsoft 365 is awaiting mailbox confirmation.

The storefront build contains no `/admin`, `/api/admin`, or `/api/upload` routes or admin Server Actions. The admin build contains those routes on its own origin. The storefront proxy redirects `/admin/*` to `ADMIN_ORIGIN` and returns 404 for admin APIs. Every admin page, action, and API checks its database backed session; the admin proxy cookie check is only an early rejection. Both projects connect to the same managed PostgreSQL database.

## How content reaches the storefront

The storefront renders public pages from the shared PostgreSQL database on each request. Publishing a Storefront Studio draft makes its section order, visibility, copy, and imagery live on the next visit or refresh. The homepage, Men, Women, About, and global footer use their respective published configurations. Product, collection, category, store, and seasonal changes are read from the same database. Public read APIs send `Cache-Control: no-store` so edge caches do not hold old catalogue or appearance data.

Saving a Studio draft does not publish it. Media Library assets become visible when a published page, product, collection, or festival references them; uploading an asset alone does not place it on the site. Tabs already open on the storefront need a refresh to fetch newer server-rendered content. Admin password, MFA, sessions, and audit settings remain inside the admin deployment.

## Production setup

1. Connect the same Neon PostgreSQL resource to both Vercel projects for Production. Its pooled connection string is `DATABASE_URL`; Prisma migrations use `DATABASE_URL_UNPOOLED` (or `DIRECT_URL`).
2. Connect a public Vercel Blob store to the admin project. Admin uploads use Blob in production and persist full URLs in `MediaAsset` records. Public Blob URLs are permitted by each project's Next image configuration.
3. Set a distinct random `AUTH_SECRET` on each project. Set `ADMIN_ORIGIN` on the storefront and `NEXT_PUBLIC_STOREFRONT_URL` on the admin project to their actual HTTPS origins. Set `AUTH_URL` and `NEXTAUTH_URL` on the storefront to its HTTPS origin.
4. Generate the PostgreSQL Prisma Client and run `npm run db:deploy:postgres` against the direct URL. Apply migrations before serving traffic.
5. On an empty PostgreSQL database, set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 16 characters in the local process, then run `npm run db:bootstrap-admin`. Do not put either value in a committed file or permanent deployment environment. Enroll TOTP MFA at the first login and store recovery codes securely.
6. Deploy both projects and verify that the storefront has no admin routes and that the admin APIs return 401 without a valid session. Run `npm run test:isolation` after both builds.

## Storefront domain and enquiry email

Keep the domain's Microsoft 365 MX records in place. At GoDaddy, add an A record for the apex (`@`) pointing to `76.76.21.21`, then verify `fashionfeet.co.in` in the storefront Vercel project's Domains settings. Once HTTPS works on the custom domain, update the storefront's `AUTH_URL` and `NEXTAUTH_URL`, and the admin project's `NEXT_PUBLIC_STOREFRONT_URL`, to `https://fashionfeet.co.in`, then redeploy both projects. Update or add `www` only after choosing its redirect target in Vercel.

Both the contact form and product enquiry form save an `Enquiry` row in PostgreSQL before attempting an email notification. A provider failure leaves the row available in the admin dashboard and the customer sees an email-delivery warning. For the selected Formspree setup, create a form in a Formspree account, add `aryan.kapoor@fashionfeet.co.in` as a linked and verified email, and select it as the form's target. Set the form ID (the suffix of `https://formspree.io/f/FORM_ID`) as `FORMSPREE_FORM_ID` in the storefront Vercel Production environment and redeploy. The server action posts the saved enquiry's name, email, subject, message, and reference to that form. Check that the notification arrives in the Microsoft 365 inbox; a successful Formspree response only means the submission was accepted. Formspree's default sender uses its own domain, so this route requires no Fashion Feet DNS changes.

The direct Resend account remains an optional alternative. To use it instead, leave `FORMSPREE_FORM_ID` unset. The Vercel Marketplace installation offered only paid plans. Verify the dedicated sending subdomain `mail.fashionfeet.co.in` with these GoDaddy records:

- TXT `resend._domainkey.mail`: copy the full DKIM value from the [Resend domain page](https://resend.com/domains/19e61aeb-ca77-48aa-8150-1a0efbb65369).
- CNAME `rsend.mail` → `rsend-apne1.forge.rmta.net`.
- CNAME `send.mail` → `send.forge.rmta.net`.

The optional DMARC record shown by Resend should be reviewed against any existing Microsoft 365 DMARC policy before changing it. Leave Resend receiving off and keep the apex Microsoft 365 MX records untouched. Once Resend verifies the domain, create a **sending-only, domain-scoped** API key and set it as `RESEND_API_KEY` in the storefront Vercel project's Production environment. The default sender is `Fashion Feet <enquiries@mail.fashionfeet.co.in>`; `CONTACT_FROM_EMAIL` can override it with another verified sender. Redeploy the storefront after adding the key, submit a test enquiry, and verify both provider acceptance and actual inbox delivery. Do not put the key in Git or send it in a chat message.

Do not import the local SQLite `dev.db` into production. It contains legacy administrator accounts with previously published seed passwords. The PostgreSQL database starts empty and must be bootstrapped with a new credential.

The SQLite backup and restore controls are disabled on managed PostgreSQL. Manage snapshots and recovery in Neon and verify its backup policy there. The admin system health screen cannot attest to provider backup freshness.

Vercel Authentication is set to **All Deployments** on the admin project, including its production alias. An authorized Vercel team member must pass that gate before reaching the app login. The app also requires its own password, TOTP MFA, a short lived pre-MFA handle, database backed session, and server side role checks. Keep the storefront project public.

At first admin login, sign in to Vercel, enter the Super Admin email and password, scan the authenticator QR code, verify a six digit code, and save the one time recovery codes in a password manager. The bootstrap password is not stored in Vercel environment variables. If rotating it, use `scripts/rotate-admin-password.ts` against the production PostgreSQL database and revoke existing sessions.

After MFA enrollment, administrators can change their own password in **Admin > Settings**. The form requires the current password and signs out every admin session after a successful change. The login and Settings forms can reveal only the text currently being entered; stored password hashes cannot be displayed.
