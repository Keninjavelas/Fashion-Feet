# Historical acceptance manifest — Fashion Feet

> **Historical test record.** The phase results below were recorded for an earlier single-application/local build. They are not an assertion that the current two-project Vercel deployment passed every scenario. Admin routes have since moved to `apps/admin`, production uses PostgreSQL, and the custom domain remains pending DNS. Formspree outbound email was verified later. For current release status and repeatable checks, use [ProductionReadiness.md](ProductionReadiness.md) and [AdminDeployment.md](AdminDeployment.md).

This manifest maps the requirements and verification results from the original acceptance pass. Re-run relevant cases against the current deployments before treating them as production evidence.

---

## Status Key
- **`VERIFIED_AUTOMATICALLY`**: Automated unit, integration, type-check, or build assertion passed cleanly without opening a browser.
- **`VERIFIED_IN_BROWSER`**: Verified via real headless browser rendered execution across viewports (1440, 768, 375), visual editor canvas, 7 seasons, draft isolation, layer reordering, visibility toggles, undo/redo, and live publish.
- **`NOT_IMPLEMENTED`**: Deferred to Phase D (Festivals) or Phase E (Analytics/Rollback).

---

## 1. Phase A — Security, Auth & RBAC
| Requirement | Status | Evidence / Location |
| :--- | :--- | :--- |
| Admin Password Hashing with Argon2id | `VERIFIED_AUTOMATICALLY` | `src/lib/adminAuth.ts` (`hashPassword`, `verifyPassword`), `src/scripts/test-all-acceptance.ts` |
| MFA Setup & TOTP Validation | `VERIFIED_AUTOMATICALLY` | `src/lib/mfa.ts`, `src/app/actions/admin.ts` |
| Single-Use Hashed Recovery Codes | `VERIFIED_AUTOMATICALLY` | `src/lib/mfa.ts` (`AdminRecoveryCode` model) |
| Rate-Limiting & Account Lockout | `VERIFIED_AUTOMATICALLY` | `src/app/actions/admin.ts` (`checkRateLimit`) |
| Session Token Revocation | `VERIFIED_AUTOMATICALLY` | `src/lib/adminAuth.ts` (`revokeAdminSession`) |
| Strict Server-Side RBAC Enforcement | `VERIFIED_AUTOMATICALLY` | `src/app/actions/editor.ts`, `src/app/actions/products.ts`, `src/scripts/test-all-acceptance.ts` |

---

## 2. Phase B — Business Management
| Requirement | Status | Evidence / Location |
| :--- | :--- | :--- |
| Dynamic SKU Generation & Uniqueness | `VERIFIED_AUTOMATICALLY` | `src/lib/sku.ts`, `prisma/schema.prisma` (`@unique`), `src/scripts/test-all-acceptance.ts` |
| Category & Occasion Deletion Protection | `VERIFIED_AUTOMATICALLY` | `src/app/actions/products.ts` (`deleteCategoryAction`) |
| Store Locator Fallback ("Coming Soon") | `VERIFIED_AUTOMATICALLY` | `src/app/stores/page.tsx`, `src/app/actions/stores.ts` |
| Enquiry Submission (No E-Commerce Orders) | `VERIFIED_AUTOMATICALLY` | `src/app/actions/enquiries.ts`, `src/scripts/test-all-acceptance.ts` |
| Search API (Title, SKU, Colour, Gender) | `VERIFIED_AUTOMATICALLY` | `src/app/api/search/route.ts` |

---

## 3. Phase C — Storefront Visual Content Management (FROZEN ✅)
| Requirement | Status | Evidence / Location |
| :--- | :--- | :--- |
| Centralized 7 Seasonal Atmospheres | `VERIFIED_IN_BROWSER` | `src/lib/seasonalConstants.ts`, `src/scripts/run-gate-2-acceptance.js` |
| Draft Sandbox Isolation (`StorefrontConfig`) | `VERIFIED_IN_BROWSER` | `src/lib/storefrontConfig.ts`, `src/scripts/run-gate-2-acceptance.js` |
| Atomic Promotion (`DRAFT` → `PUBLISHED`) | `VERIFIED_IN_BROWSER` | `src/lib/storefrontConfig.ts`, `src/scripts/run-gate-2-acceptance.js` |
| Failed Publish Rollback & Audit Log | `VERIFIED_AUTOMATICALLY` | `src/app/actions/editor.ts` (`PAGE_PUBLISH_FAILED`), `src/scripts/test-all-acceptance.ts` |
| Input Sanitization & Preset Allow-Listing | `VERIFIED_AUTOMATICALLY` | `src/app/actions/editor.ts` (`sanitizeText`, `ALLOWED_STYLE_PRESETS`) |
| TypeScript Strict Type Check | `VERIFIED_AUTOMATICALLY` | `npx tsc --noEmit` (0 errors) |
| Next.js Production Build | `VERIFIED_AUTOMATICALLY` | `npm run build` (44 static & dynamic routes compiled cleanly) |
| Unified Test Commands | `VERIFIED_AUTOMATICALLY` | `npm run test:acceptance`, `npm run test:gate2` |
| Live Visual Canvas & Iframe Interaction | `VERIFIED_IN_BROWSER` | `src/scripts/run-gate-2-acceptance.js`, `/admin/editor`, `/admin/editor/preview` |
| Viewport Responsiveness (1440px / 768px / 375px) | `VERIFIED_IN_BROWSER` | `src/scripts/run-gate-2-acceptance.js`, `artifacts/gate-2-visuals/` |

---

## 4. Phase D — Festival & Seasonal Experience Studio (FROZEN ✅)
| Requirement | Status | Evidence / Location |
| :--- | :--- | :--- |
| Versioned Prisma Migration | `VERIFIED_AUTOMATICALLY` | `prisma/migrations/20260902000000_phase_d_festival_studio/migration.sql` |
| Seasonal Experience Portfolio (All 7 Atmospheres) | `VERIFIED_IN_BROWSER` | `src/app/admin/festivals/page.tsx`, `src/components/admin/FestivalStudioClient.tsx`, `src/scripts/run-gate-2-acceptance.js` |
| Automated Campaign Scheduler (Temporal Window Detection) | `VERIFIED_AUTOMATICALLY` | `src/app/actions/festivals.ts` (`getActiveFestival`), `src/scripts/test-all-acceptance.ts` |
| Auto-Expiry & Fallback to Default Theme | `VERIFIED_AUTOMATICALLY` | `src/app/actions/festivals.ts` (`autoDisable`), `src/scripts/test-all-acceptance.ts` |
| Single Active Festival Constraint | `VERIFIED_AUTOMATICALLY` | `src/app/actions/festivals.ts` (`activateFestivalNowAction`), `src/scripts/test-all-acceptance.ts` |
| Super Admin One-Click Live Activation / Deactivation | `VERIFIED_IN_BROWSER` | `src/components/admin/FestivalStudioClient.tsx`, `src/app/actions/festivals.ts` |
| MediaAsset Library Isolation (Strictly No Raw URL Paste) | `VERIFIED_IN_BROWSER` | `src/components/admin/FestivalStudioClient.tsx` (Media picker modal binding to `mediaAssetId`) |
| Physical-Store Boutique Promotional Offer Engine | `VERIFIED_AUTOMATICALLY` | `src/app/actions/festivals.ts` (`offerHeading`, `offerDescription`), `src/scripts/test-all-acceptance.ts` |
| Strict Enquiry-Only Fidelity (Zero Checkout / Cart Contamination) | `VERIFIED_AUTOMATICALLY` | `src/app/actions/enquiries.ts`, `src/components/home/FestivalOverlay.tsx`, `src/scripts/test-all-acceptance.ts` |
| Atmospheric Effect Controls & Intensity Slider | `VERIFIED_IN_BROWSER` | `src/components/admin/FestivalStudioClient.tsx` (`SUBTLE`, `BALANCED`, `VIBRANT`) |
| Admin Navigation Integration | `VERIFIED_IN_BROWSER` | `src/components/admin/AdminSidebar.tsx` (Seasonal Experiences link with `Sparkles`) |

---

## 5. Phase E — Enterprise Polish & Disaster Recovery (FROZEN ✅)
| Requirement | Status | Evidence / Location |
| :--- | :--- | :--- |
| Versioned Prisma Migration | `VERIFIED_AUTOMATICALLY` | `prisma/migrations/20260902120000_phase_e_enterprise_polish/migration.sql` |
| Storefront Historical Snapshot Archiving (`StorefrontConfigHistory`) | `VERIFIED_AUTOMATICALLY` | `src/lib/storefrontConfig.ts`, `src/scripts/test-all-acceptance.ts` |
| One-Click Instant Storefront Version Rollback | `VERIFIED_AUTOMATICALLY` | `src/lib/storefrontConfig.ts` (`rollbackStorefrontVersion`), `src/scripts/test-all-acceptance.ts` |
| Atomic Point-in-Time SQLite Backup Engine | `VERIFIED_AUTOMATICALLY` | `src/lib/backup.ts` (`createDatabaseBackup`), `src/scripts/test-all-acceptance.ts` |
| Cryptographic SHA-256 Checksum Integrity Verification | `VERIFIED_AUTOMATICALLY` | `src/lib/backup.ts` (`computeFileSha256`), `src/scripts/test-all-acceptance.ts` |
| Safe Restore Engine with Pre-Restore Safeguard Snapshots | `VERIFIED_AUTOMATICALLY` | `src/lib/backup.ts` (`restoreDatabaseBackup`), `src/app/actions/backup.ts` |
| System Health & Operations Console | `VERIFIED_IN_BROWSER` | `src/app/admin/system-health/page.tsx`, `src/components/admin/SystemHealthClient.tsx` |
| Filterable Security & Administrative Audit Timeline | `VERIFIED_IN_BROWSER` | `src/components/admin/AuditLogTable.tsx`, `src/scripts/run-gate-2-acceptance.js` |
| Enterprise HTTP Security Headers (HSTS, CSP, X-Content-Type) | `VERIFIED_AUTOMATICALLY` | `next.config.ts` |
| Production-Readiness Runbook & Deployment Guide | `VERIFIED_AUTOMATICALLY` | `docs/ProductionReadiness.md` |

