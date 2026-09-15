# Admin Application Integration Roadmap & Contract

## Architecture Boundary
The Admin Application is a separate internal dashboard connecting to the same backend database API.

## Implementation Phases

### Phase A: Foundation
- Admin Authentication & Separate Login (`/admin/login`)
- Authenticator App MFA (TOTP 6-digit verification & QR enrollment)
- RBAC Permission Enforcement (`SUPER_ADMIN`, `CONTENT_MANAGER`)
- Admin Analytics Dashboard
- Media Library Hub (Shared asset manager for `MediaAsset`)

### Phase B: Business Management
- Products Catalog Manager (Draft/Publish status, productCode SKU generator, image uploaders)
- Collections & Occasions Manager
- Category & Taxonomies
- Store Locations Manager (Register real boutiques once available)
- Customer Management & Activity Logs
- Product Fitting Enquiries Inbox (`status: PENDING | CONTACTED | COMPLETED | CLOSED`)

### Phase C: Storefront Visual Content Management
- Live Storefront Visual Editor (WYSIWYG layout preview)
- Sandbox Environment
- Component Parameter Editor
- Asset Slot Replacer (`SiteSetting` keys)
- Draft / Publish Release Engine

### Phase D: Marketing & Festival Control Studio
- Seasonal Experience Studio (1-Click Festival Theme Switcher for Normal, Diwali, Holi, Eid, Christmas, Lohri, Baisakhi)
- Campaign Date Scheduler & Automatic Expire/Restore
- Festival Offer Configurator
- Live Storefront Preview Mode

### Phase E: Enterprise Features
- Audit Logs & Action Timeline
- Version History & Rollback
- Database Backup Manager
- AI Assistant Integration for catalog copy & image tag generation
