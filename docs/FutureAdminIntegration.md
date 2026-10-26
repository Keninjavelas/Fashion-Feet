# Admin integration status and future work

The earlier roadmap in this file has been implemented as a separate Next.js application in `apps/admin`, deployed at `https://fashion-feet-admin.vercel.app`. It shares Neon PostgreSQL with the public storefront. The admin has its own login, TOTP MFA, roles, audit views, product/collection/category/store/FAQ managers, media library, seasonal controls, and Storefront Studio. See [AdminDeployment.md](AdminDeployment.md) for security and deployment details.

Storefront content is updated through the shared database. Draft Studio changes require publication, and open storefront tabs need a refresh. The FAQ manager edits the same rows rendered by `/faq` and `/api/v1/faqs`.

Remaining integration work is operational: configure `fashionfeet.co.in` DNS, verify the Resend sending subdomain, create a domain-scoped sending key, and test delivery to `aryan.kapoor@fashionfeet.co.in`. The administrator of the GoDaddy DNS account must make or authorize those DNS changes. The native mobile app also needs a release pipeline and store distribution before it can be treated as a shipped client.
