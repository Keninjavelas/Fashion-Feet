# Data model

The authoritative production schema is `prisma/postgres/schema.prisma`. This page summarizes the main relationships; read the schema and migrations for field-level detail.

- `User`, `Wishlist`: customer accounts, preferences, and saved products.
- `AdminUser`, `AdminSession`, `AdminRecoveryCode`, `AdminAuditLog`: separate administrators, database-backed sessions, MFA recovery codes, and audit history.
- `Product`, `ProductImage`, `Collection`, `Category`, `Occasion`, `Discount`: catalogue and merchandising data. Products have a unique optional `sku` and draft/published/archive state.

For the current business taxonomy, `Product.occasion` stores **Daily Wear**, **Festive**, **Ceremonial**, or **Rajwadi**; the field name is retained for compatibility. `Product.gender` stores Men, Women, or Unisex. The first three catalogues have Men and Women views, while Rajwadi accepts Women only. `Category` is the product type, while `Collection` remains a separate optional merchandising grouping. The four catalogues are canonical application values and do not depend on rows in the older `Occasion` table.
- `Store`, `Festival`: physical-location and seasonal experience settings.
- `Faq`: question, answer, category, pinned flag, and display order. The storefront FAQ page and `/api/v1/faqs` read the same rows.
- `SiteSetting`, `CompanyContent`, `StorefrontConfig`, `StorefrontConfigHistory`: public appearance/copy and draft/published page compositions with version history.
- `MediaAsset`: uploaded asset metadata and URLs. Production upload files live in Vercel Blob.
- `Enquiry`: contact and product requests, including subject, message, product details, status, assigned administrator, and internal notes. A successful database write is independent of email notification delivery.
- `SystemBackup`: metadata for local SQLite backup operations; it does not represent Neon backups.

The public API serializes only an allowlisted subset of these entities through `src/lib/publicSerializers.ts`. The admin application uses server-side role and session checks before mutations. See [Architecture.md](Architecture.md) and [API.md](API.md).
