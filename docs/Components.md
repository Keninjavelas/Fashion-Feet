# Component guide

The source files are the detailed reference. These are the main UI entry points in the current codebase.

- `src/components/layout/StorefrontLayout.tsx` loads public settings, active festival, navigation data, and the published footer on each request.
- `src/components/layout/BrandLogo.tsx` uses the official logo in `public/branding/fashion-feet-official.png`.
- `src/components/layout/Navbar.tsx`, `Footer.tsx`, `CollectionsMegaMenu.tsx`, and `SearchModal.tsx` provide global navigation and contact links.
- `src/components/home/Hero.tsx`, `PastExhibitions.tsx`, and other `src/components/home/` modules render homepage sections and seasonal effects.
- `src/components/shop/EnquiryModal.tsx` submits product enquiries; `src/app/contact/ContactClient.tsx` submits general contact requests through the same Server Action.
- `src/app/faq/FaqClient.tsx` renders FAQ rows passed by the server page from PostgreSQL.
- `src/components/admin/AdminShell.tsx`, `AdminWorkspace.tsx`, and `AdminSidebar.tsx` frame the separate dashboard; managers under `src/components/admin/` handle products, collections, stores, FAQs, media, festivals, and Studio.

The admin app imports shared components from `src/`, but its routes and Server Actions are built only in `apps/admin`. Run `npm run test:isolation` after changes to these boundaries.
