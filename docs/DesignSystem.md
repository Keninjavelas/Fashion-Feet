# Design system

The storefront uses Tailwind CSS 4, CSS custom properties, and seasonal theme presets. The main token definitions are in `src/lib/themeTokens.ts`, `src/lib/seasonalConstants.ts`, and `src/app/globals.css`. Components should use theme variables instead of hard-coded seasonal colours where the design is meant to change with the active festival.

The default storefront follows the **Heritage Atelier** direction: product photography first, editorial serif headings, readable sans-serif information, and restrained motion. Core colors are warm ivory `#F7F2EA`, oxblood `#861638`, espresso `#281C1B`, blush stone `#E6D6CE`, and antique gold. For small text on ivory, use the darker accessible accent `#805D2A`; reserve brighter gold for decoration on dark surfaces. Seasonal presets can alter backgrounds and accents, but they should not obscure product images or text.

The global particles, hanging footwear ornaments, curved overlays, custom cursor, and card tilt were removed from ordinary storefront browsing. The default announcement marquee is disabled because its promotional promises were not verified. Keep focus indicators visible and respect `prefers-reduced-motion` when changing motion.

Use `object-contain` on a neutral frame for product photographs so no footwear is cropped. Reserve `object-cover` for documentary and editorial images. Product-specific 3D can return only when faithful assets exist; the current generated shoe geometry is not a product representation. Photo previews in the women's gallery are discovery content, not purchasable listings.

The admin interface is **dark mode only**, styled by `apps/admin/src/app/admin-theme.css`. It should not inherit the public site's seasonal or light-mode palette.

Brand assets are deliberate: `BRAND_TAGLINE` in `src/lib/branding.ts` is **Designer Punjabi Jutties**, and `BrandLogo` renders the user-supplied official footprint logo. Do not replace it with a generated mark or an unrelated wordmark. The past-exhibition photos in `public/exhibitions/` are real historical display images, not product catalogue images.
