# Centralized Media System Specification

## Single Source of Truth Architecture

Media assets across Fashion Feet are managed dynamically through the `MediaAsset` model and `SiteSetting` key-value pairs instead of hardcoding raw image paths.

## Key Modules (`src/lib/media.ts`)

1. **`getPublishedAsset(keyOrFolder, fallbackUrl)`**:
   - Resolves asset URL dynamically.
   - 1st precedence: `SiteSetting` key (e.g. `branding.primaryLogo`).
   - 2nd precedence: Published `MediaAsset` matching name or folder.
   - 3rd precedence: Supplied `fallbackUrl`.

2. **`calculateUsedInLocations(url, folder)`**:
   - Calculates dependent storefront locations for any asset before deletion or replacement (e.g. "Header Logo", "Homepage Hero Canvas", "Product Gallery").

## Standard Folders

- `branding`: Primary, dark & light logos, favicons
- `homepage`: Hero banners, scroll story visuals
- `products`: Product galleries & 360° frames
- `collections`: Curated collection banners
- `festivals`: Festive campaign graphics
- `stores`: Showroom photos
- `backgrounds`: Zari patterns & texture overlays
- `icons`: Badges & seals
