# Fashion Feet Design System Specification

## Color System & CSS Custom Properties

The design system uses CSS Custom Properties to seamlessly adapt themes across the entire storefront:

```css
:root, [data-theme="default"] {
  --theme-color-bg: #FAF6F0;       /* Pristine Warm Ivory */
  --theme-color-surface: #FFFFFF;  /* Clean Surface Card */
  --theme-color-text: #1F1A17;     /* Dark Walnut */
  --theme-color-text-muted: #6B6560; /* Muted Charcoal */
  --theme-color-accent: #C5A059;   /* Antique Gold */
  --theme-color-jewel: #8A1538;    /* Royal Crimson/Burgundy */
  --theme-color-border: #E5E0D8;   /* Soft Ivory Border */
  --theme-color-shadow: rgba(31, 26, 23, 0.06);
}
```

## Typography Hierarchy

- **Header / Titles**: Playfair Display / Cinzel (`font-serif`)
- **Body / Interface**: Inter (`font-sans`)
- **SKUs / Prices / Sizes**: Mono font family (`font-mono`)

## Component Elevation & Surfaces

- **Surface Card**:
  - Class: `.surface-card`
  - Border: `1px solid var(--theme-color-border)`
  - Shadow: Multi-stop layered soft shadow
  - Hover: `-4px` translateY translation with expanded ambient glow
- **Subtle Background Mesh**:
  - Class: `.subtle-grain-bg`
  - Uses fine radial gold weave grid pattern

## Progressive Enhancement & Motion Rules

- Content is 100% visible by default (`html:not(.animations-ready) .scroll-reveal { opacity: 1; }`).
- JavaScript adds `.animations-ready` on hydration to enable scroll transitions.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all nonessential scroll transforms.
- Visible Focus Rings: `*:focus-visible { outline: 2px solid var(--theme-color-accent); outline-offset: 2px; }`.
