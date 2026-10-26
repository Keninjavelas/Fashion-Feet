# Storefront

The public site is deployed at `https://fashion-feet-storefront.vercel.app`. `fashionfeet.co.in` is the intended primary domain but is awaiting a GoDaddy A record. The public build does not contain the separate admin pages or upload API.

## Pages

- `/`: homepage with live storefront sections, official brand logo, and two photos from past exhibitions.
- `/men`, `/women`, `/shop`, `/product/[id]`: catalogue browsing, product detail, favourites, and product enquiry.
- `/size-guide`, `/about`, `/festive`, `/stores`: fit guidance, brand content, seasonal content, and store status.
- `/contact`, `/faq`: contact form and database-backed FAQs. The FAQ page and `/api/v1/faqs` read the same PostgreSQL table.
- `/login`, `/register`, `/profile/*`: customer account pages.
- `/privacy`, `/terms`, `/accessibility`: customer information pages.

`/cart` and `/checkout` exist as routes, but the current business flow is enquiry-led; do not describe them as a complete online purchase service. The store-launch notification form and footer newsletter form currently show UI without a persistent subscription backend and need separate implementation before being promoted as signup channels.

## Live data and customer contact

Product, collection, FAQ, store, festival, and published Studio content are read from shared PostgreSQL data. An admin change appears on a new request or refresh; Studio drafts need publication first.

Contact and product enquiry forms write `Enquiry` rows for the admin dashboard. They attempt an outbound notification to `aryan.kapoor@fashionfeet.co.in`; email delivery is pending Resend DNS verification and a production key. The on-screen response distinguishes a saved enquiry from accepted email delivery.

See [Architecture.md](Architecture.md), [API.md](API.md), and [AdminDeployment.md](AdminDeployment.md).
