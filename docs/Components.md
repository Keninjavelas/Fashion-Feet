# Storefront Component Inventory

## Key Components

1. **`Navbar` (`src/components/layout/Navbar.tsx`)**:
   - Fixed header with brand logo, top links, active seasonal campaign badge, search trigger, profile link, wishlist counter, and Boutique Enquiry button.

2. **`CollectionsMegaMenu` (`src/components/layout/CollectionsMegaMenu.tsx`)**:
   - Dropdown panel for `Wedding`, `Festive`, `Casual`, `Office`, `Luxury`, `Heritage`, `Best Sellers`.

3. **`SearchModal` (`src/components/layout/SearchModal.tsx`)**:
   - Search modal overlay querying `/api/search` with 500ms debouncing across title, SKU, gender, color, material, category, occasion, description.

4. **`EnquiryModal` (`src/components/shop/EnquiryModal.tsx`)**:
   - Fitting & product enquiry modal pre-populating dynamic product title, SKU, size, color, thumbnail, and enquiry subject options (*General Enquiry*, *Store Launch Updates*, *Virtual Assistance*).

5. **`InteractiveSizeFinderSection` (`src/components/home/InteractiveSizeFinderSection.tsx`)**:
   - Size Studio widget with Women/Men toggle, UK/US/EU/India size matrix, foot length cm slider, save to profile action, and handmade fit disclaimer.

6. **`SeasonalAmbientOverlays` (`src/components/home/SeasonalAmbientOverlays.tsx`)**:
   - HTML5 Canvas particle system rendering themed effects: `diyas`, `gulal`, `lanterns`, `snowfall`, `embers`, `wheat`.

7. **`StorefrontTiltCard` (`src/components/storefront/StorefrontTiltCard.tsx`)**:
   - 3D tilt card wrapper for product cards & feature showcases.
