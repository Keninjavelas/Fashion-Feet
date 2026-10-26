# Design system

The storefront uses Tailwind CSS 4, CSS custom properties, and seasonal theme presets. The main token definitions are in `src/lib/themeTokens.ts`, `src/lib/seasonalConstants.ts`, and `src/app/globals.css`. Components should use theme variables instead of hard-coded seasonal colours where the design is meant to change with the active festival.

The default storefront palette is warm ivory, burgundy, and gold. Seasonal presets can alter backgrounds, accent colours, decoration, and motion. Respect `prefers-reduced-motion` and keep focus indicators visible when changing components.

The admin interface is **dark mode only**, styled by `apps/admin/src/app/admin-theme.css`. It should not inherit the public site's seasonal or light-mode palette.

Brand assets are deliberate: `BRAND_TAGLINE` in `src/lib/branding.ts` is **Designer Punjabi Jutties**, and `BrandLogo` renders the user-supplied official footprint logo. Do not replace it with a generated mark or an unrelated wordmark. The past-exhibition photos in `public/exhibitions/` are real historical display images, not product catalogue images.
