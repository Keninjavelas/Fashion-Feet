# API & Server Actions Contract

## Endpoints

1. **`GET /api/search?q={query}`**:
   - Case-insensitive search across published products.
   - Filters `title`, `productCode`, `gender`, `colors`, `material`, `category`, `occasion`, `description`.

2. **`POST /api/auth/[...nextauth]`**:
   - Handles customer sign-in, session validation, and sign-out.

## Server Actions (`src/app/actions/`)

- **`createEnquiry(formData)`**: Validates customer session, parses product details & messages, creates `Enquiry` record.
- **`toggleWishlist(productId)`**: Toggles item in customer's wishlist.
- **`updateUserProfile(data)`**: Updates user `name`, `phone`, and saved `size` preference.
- **`getSiteSettingsMap()`**: Returns key-value map of site branding & global settings.
