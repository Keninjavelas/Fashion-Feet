# Database Schema & Migration Guide — Fashion Feet

Fashion Feet uses **Prisma ORM** with **SQLite** for development and local prototypes, designed for seamless production migration to PostgreSQL or MySQL.

---

## 1. Core Data Models & Relations

- **`AdminUser`**: Represents internal administrators (`SUPER_ADMIN` vs `CONTENT_MANAGER`). Passwords hashed with **Argon2id**.
- **`AdminSession`**: Authenticated admin cookie sessions with automatic TTL expiration.
- **`AdminRecoveryCode`**: Single-use, high-entropy MFA recovery codes hashed with SHA-256.
- **`AdminAuditLog`**: Append-only system audit trail (`PAGE_PUBLISHED`, `DRAFT_SAVED`, `PAGE_PUBLISH_FAILED`, etc.).
- **`Product`**: Footwear catalogue items (`sku` unique, `status` = `DRAFT | PUBLISHED | ARCHIVED`).
- **`Collection`**: Grouped curated collections.
- **`Category` & `Occasion`**: Product classification taxonomies.
- **`Store`**: Boutiques & showroom locations (`code` unique, `status` = `OPEN | COMING_SOON`).
- **`Enquiry`**: Direct luxury bespoke/showroom customer enquiries (never creates an e-commerce order).
- **`StorefrontConfig`**: Visual Studio layout configurations with compound unique `[page, status]` index (`DRAFT` vs `PUBLISHED`).

---

## 2. Migration Workflow

All schema modifications are tracked via versioned Prisma migrations under `prisma/migrations/`.

### Applying Migrations
```bash
npx prisma migrate dev
```

### Checking Migration Status
```bash
npx prisma migrate status
```

---

## 3. Database Backup & Restore Procedure

### Manual Backup (SQLite)
To back up the database before a major deployment or schema change:
```bash
# Windows PowerShell
Copy-Item ./prisma/dev.db ./prisma/backups/dev_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").db
```

### Restore Procedure
1. Stop the application server (`npm run dev` or production instance).
2. Replace `prisma/dev.db` with the designated backup file.
3. Run `npx prisma migrate status` to confirm schema integrity.
4. Restart the application server.
