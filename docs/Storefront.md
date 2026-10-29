# Storefront

The public site is deployed at `https://fashion-feet-storefront.vercel.app`. `fashionfeet.co.in` is the intended primary domain but is awaiting a GoDaddy A record. The public build does not contain the separate admin pages or upload API.

## Pages

- `/`: homepage with live storefront sections, large footwear photography, official brand logo, and two photos from past exhibitions. Admin-managed content and media still take priority when published.
- `/men`, `/women`, `/shop`, `/product/[id]`: catalogue browsing, product detail, favourites, and product enquiry.

Products use two independent browsing dimensions: the business catalogue (**Daily Wear**, **Festive**, or **Ceremonial**) and fit (**Men**, **Women**, or **Unisex**). `/shop?catalogue=daily-wear&gender=Men` is one of the six Men/Women catalogue views; Unisex items appear in both fit views. `/men` and `/women` link to all three. The product type field remains separate for types such as Jutti or Mojari. The storefront menu and admin product editor use the same three catalogue names.

The women's page and its three catalogue views currently display owner-supplied photo previews while the published product table is empty. These are not individual purchasable listings: no prices, sizes, materials, or stock claims are inferred from photographs. Once product records are published, the standard product cards replace the preview gallery in those views.
- `/size-guide`, `/about`, `/festive`, `/stores`: fit guidance, brand content, seasonal content, and store status.
- `/contact`, `/faq`: contact form and database-backed FAQs. The FAQ page and `/api/v1/faqs` read the same PostgreSQL table.
- `/login`, `/register`, `/profile/*`: customer account pages.
- `/privacy`, `/terms`, `/accessibility`: customer information pages.

`/cart` now explains the enquiry-led flow. `/checkout` redirects to `/shop`; the current site does not accept an online order. The previously non-persistent store notification and footer newsletter controls were removed from public pages. The common navigation's contact action opens the real contact page. The Size Studio records a measured foot length for signed-in customers but does not provide a brand-specific size recommendation until a verified chart exists.

## Live data and customer contact

Product, collection, FAQ, store, festival, and published Studio content are read from shared PostgreSQL data. An admin change appears on a new request or refresh; Studio drafts need publication first.

Contact and product enquiry forms write `Enquiry` rows for the admin dashboard. They attempt an outbound notification to `aryan.kapoor@fashionfeet.co.in`; email delivery is pending Resend DNS verification and a production key. The on-screen response distinguishes a saved enquiry from accepted email delivery.

See [Architecture.md](Architecture.md), [API.md](API.md), and [AdminDeployment.md](AdminDeployment.md).

The site-wide visual audit, route inventory, screenshots, verification, and remaining content gaps are in [HeritageAtelierAudit.md](HeritageAtelierAudit.md).
