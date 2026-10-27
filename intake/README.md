# Real business content intake

The owner has already supplied the official logo, the **Designer Punjabi Jutties** tagline, two real past-exhibition photographs, and the contact address `aryan.kapoor@fashionfeet.co.in`. Those assets are checked into `public/branding/` and `public/exhibitions/`; they do not need to be supplied again.

The owner has also supplied 21 labelled women's footwear photographs from the Desktop. Byte-for-byte verified copies are in `products/women/{daily-wear,festive,ceremonial}/` and published as photo previews from `public/catalogue/women/`. After verifying both project copies, the 21 Desktop source files were deleted at the owner's request. Festive photos 5 and 7 are identical; Festive photo 1 is also Ceremonial photo 1. Product facts and prices are still missing, so no individual product listing has been created from those images.

This folder is for additional verified product, store, policy, and campaign information. Its templates are tracked in Git. Actual files placed in the designated intake asset folders are ignored by Git until they are reviewed and deliberately added through the admin Media Library or checked into a public asset directory.

- `catalogue-template.csv`: duplicate it as `catalogue.csv`, with one row per product. At minimum fill in `title`, `category` (product type), `gender`, `catalogue`, `price`, and `imageFiles`. Use the real SKU in `sku` if one exists; otherwise leave it blank for an internally generated code. Keep optional details blank when they are not verified.
  Set `catalogue` to **Daily Wear**, **Festive**, or **Ceremonial**. Set `gender` to **Men**, **Women**, or **Unisex**. A Unisex item appears in both gender views.
- `brand-template.md`: use for facts and copy still needing owner confirmation.
- `stores-template.md`: use only for confirmed physical locations.
- `products/`: place original product photographs here, ideally in one subfolder per product. List each image's path relative to `products/` in the matching CSV row's `imageFiles` cell; separate multiple paths with semicolons, with the primary photo first. For example, `blue-jutti/front.jpg;blue-jutti/side.jpg`.
- `homepage/`, `collections/`, `stores/`: place other real photographs in the relevant folder and identify what each depicts.

Product photos alone cannot establish a reliable price, size range, material, or name. The catalogue rows supply those facts. If a product has no verified price yet, leave the row in the intake sheet for review; it will not be published until the price is confirmed. These intake assets stay outside Git; approved photos are uploaded through the admin Media Library before product listings are published.

Do not invent stores, launch dates, materials, discounts, shipping terms, or product photos. The 12 restored FAQs are editable in the admin dashboard but still need a business-fact review. Historical local inventory details are retained in [docs/ContentIntake.md](../docs/ContentIntake.md); use [docs/ProductionReadiness.md](../docs/ProductionReadiness.md) for current deployment status.
