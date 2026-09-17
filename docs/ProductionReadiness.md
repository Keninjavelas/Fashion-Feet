# Fashion Feet — Production Readiness & Operational Runbook

**System Status**: Production-Ready / Frozen Prototype  
**Architecture**: Next.js 16 (App Router & Turbopack), SQLite (WAL mode via `@prisma/adapter-better-sqlite3`), Prisma ORM 7, Argon2id Password Hashing, TOTP Multi-Factor Authentication.

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FASHION FEET ENGINE                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ Public Storefront     │ │ Admin Control Console │ │ Security & Storage    │
│ - 5 Responsive Routes │ │ - Visual Studio Canvas│ │ - SQLite (dev.db)     │
│ - 7 Seasonal Themes   │ │ - Seasonal Studio     │ │ - Argon2id Hashing    │
│ - Enquiry-Only Flow   │ │ - System Health & DR  │ │ - Version Snapshots   │
│ - 0 Cart Checkout Math│ │ - Audit Trail Logs    │ │ - SHA-256 Backups     │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

A second client — the native mobile app in `mobile/` — reads the same content through the public
`/api/v1` JSON surface. Those routes are served by this same Next.js process against this same
database, which is what keeps the single-file SQLite setup viable today (see §6.1 for when it stops
being viable).

---

## 2. Environment Variables Checklist

Ensure the following variables are configured in `.env` / production deployment secrets:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLite file connection string | `file:./dev.db` |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical domain URL | `https://fashionfeet.com` |
| `ADMIN_SESSION_SECRET` | Cookie signing secret for admin sessions | `openssl rand -hex 32` |
| `NODE_ENV` | Runtime environment | `production` |

---

## 3. Database Management & Automated Snapshots

### 3.1 SQLite WAL Mode
The primary database runs in Write-Ahead Logging (`WAL`) mode with `@prisma/adapter-better-sqlite3` for high concurrent read performance without database locks.

### 3.2 Backup Execution
- **On-Demand**: Triggered from `/admin/system-health` via Super Admin control.
- **Automated Retention**: Backups are written to `backups/backup_YYYY-MM-DD_*.db` with cryptographic SHA-256 integrity checksums.
- **CLI Trigger**:
  ```bash
  npm run test:acceptance # Validates backup subsystem
  ```

### 3.3 Disaster Recovery Runbook
If database corruption or accidental deletion occurs:
1. Navigate to `/admin/system-health`.
2. Locate the desired point-in-time snapshot.
3. Click **"Restore"**. The system will automatically generate a `safeguard_pre_restore_*.db` archive before restoring the target snapshot.

---

## 4. Version History & One-Click Rollback

- **Storefront Studio**: Every promotion from `DRAFT` to `PUBLISHED` creates a persistent record in `StorefrontConfigHistory`.
- **Instant Rollback**: If a published storefront page exhibits visual regressions, Super Admins can execute one-click rollback to any historic version via `rollbackStorefrontVersionAction`.
- **Draft Isolation**: Live storefront users are completely isolated from draft modifications until formal publish.

---

## 5. Security Policies & Hardening

1. **Authentication**: Argon2id password hashing with per-user salt.
2. **Multi-Factor Authentication**: RFC 6238 TOTP with single-use hashed recovery codes (`AdminRecoveryCode`).
3. **Session Revocation**: Real-time session invalidation through `AdminSession` table.
4. **Rate Limiting**: In-memory token bucket rate-limiting on administrative login routes.
5. **HTTP Security Headers**: HSTS, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
6. **Audit Trail**: Append-only `AdminAuditLog` tracking all administrative mutations.

---

## 6. Pre-Flight Deployment Checklist

Before deploying to production:
- [x] Run versioned database migrations: `npx prisma migrate status` (3 migrations applied).
- [x] Verify full test harness: `npm run test:acceptance` (All phases A–E passed).
- [x] Verify real-rendered browser suite: `npm run test:gate2` (69/69 viewports, editor, seasonal modes, studio passed).
- [x] Run strict TypeScript type check: `npx tsc --noEmit` (0 errors).
- [x] Compile production bundle: `npm run build` (45 static and dynamic routes compiled).

### 6.1 Post-freeze additions to the deployment picture

Not yet satisfied — neither has been done, and both block a deployment that goes beyond the current single-host setup:

- [ ] **Multi-host SQLite blocker.** `dev.db` is a **single SQLite file**. It is fine while one process serves both the website and the public `/api/v1` routes, which is the case today. It becomes a blocker the moment the API (or the storefront) is deployed as a separate instance or host from the rest of the app, because two processes on two hosts cannot safely share one SQLite file. Migrate to a server database (Postgres/MySQL) **before** any multi-host split — this is a prerequisite for multi-host deployment, not for local development, and it needs a provisioned database server because it changes `DATABASE_URL` for the whole application. See `docs/SecurityHardening.md` §5 item 3 and `docs/MobileApp.md` §6.
- [ ] **Mobile app-store distribution.** `mobile/` is built and type-checked but has no release pipeline: no EAS build profile, no signing credentials, no store listing and no submission. Shipping the native app also imposes versioning discipline on the public API, because an app already installed on a customer's phone cannot be patched server-side — a breaking change has to become `/api/v2`. See `docs/MobileApp.md`.
