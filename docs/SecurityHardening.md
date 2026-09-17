# Task 10 — Final Security Hardening

**Deployment level: LOCALHOST / PRE-DEPLOYMENT.**
Nothing has been deployed. `fashionfeet.co.in` and `admin.fashionfeet.co.in` do not exist yet. Everything
below was verified against a production build (`npm run build` + `npm start`) running on
`http://localhost:3000`. Items that can only be validated against the real domains are listed separately in
section 5 and are **not** claimed as verified.

Intended production model (as specified):

```text
https://fashionfeet.co.in          -> public storefront (customer system)
https://admin.fashionfeet.co.in    -> isolated administrative system
```

---

## 1. Exact verification results

| Command | Result | Exit |
|---|---|---|
| `npm run lint` | `✖ 1 problem (0 errors, 1 warning)` — pre-existing `ProductClient.tsx:72 react-hooks/exhaustive-deps` only | 0 |
| `npx tsc --noEmit` | no output (clean) | 0 |
| `npm run build` | `✓ Compiled successfully` · `Finished TypeScript` | 0 |
| `npm run test:acceptance` | `🎉 WHOLE-PROJECT MASTER ENGINEERING ACCEPTANCE PASSED CLEANLY!` | 0 |
| `npm run test:gate2` | `Total Assertions: 72 \| Passed: 72 \| Failed: 0` | 0 |

`npm test` does not exist in `package.json` and was **not** invented. The lint warning count did not increase.

`npm run build` intermittently fails on this checkout with `EPERM: operation not permitted, unlink '.next\...'`
(OneDrive file lock). Clearing `.next` and rebuilding resolves it; it is not a code fault.

### Additional security evidence produced by this task

**Admin boundary probe** (26 server-boundary cases, production build, explicit cookie headers):

| Scenario | `/admin*` pages | `/api/admin/audit` | `/api/admin/health` |
|---|---|---|---|
| No cookie | `302` redirect to login | `403` | `401` |
| Forged session cookie | `307` rejected | `403` | `401` |
| Forged NextAuth JWT (+ MFA cookie) | `302` rejected | — | — |
| Expired session | `307` rejected | `403` | — |
| Revoked session | `307` rejected | `403` | — |
| Valid `SUPER_ADMIN` | `200` | `200` | `200` |
| Valid `CONTENT_MANAGER` | `/admin/audit-log` `307`, `/admin/administrators` `307`, `/admin/editor` `200` | `403` | `200` |

No admin content was returned in any rejected case.

**Cookie-scope probe** (real browser, production build): with the app's original `path: "/admin"`, the admin
session cookie is never sent to `/api/admin/audit` (`403`) or `/api/admin/health` (`401`); with `path: "/"` both
return `200`.

**MFA standards compliance**: RFC 6238 Appendix B SHA-1 test vectors — 5/5 pass
(`T=59→287082`, `T=1111111109→081804`, `T=1111111111→050471`, `T=1234567890→005924`, `T=2000000000→279037`),
plus enrollment-payload checks (valid `otpauth://` URI, SHA1/6-digit/30s, base32 secret of 32 chars = 160 bits)
and recovery-code checks (unique, deterministic hashing, no plaintext stored).

---

## 2. Security issues found

Severity reflects exploitability at the current (localhost, single-origin) deployment level.

### Critical

1. **Unauthenticated admin server actions (CWE-306).** Server actions are HTTP endpoints reachable by anyone
   who extracts the action id from the client bundle; `Origin` checking in Next.js only blocks cross-site
   invocation, not direct invocation. These had **no** authentication check at all:
   - `src/app/actions/mediaActions.ts` — all 6 exports (create/update/publish/replace/delete/favourite media)
   - `src/app/actions/settings.ts` — `saveSiteSettings` (overwrite storefront settings)
   - `src/app/actions/discounts.ts` — `createDiscount`, `deleteDiscount`
   - `src/app/actions/faq.ts` — `createFaq`, `updateFaq`, `togglePinFaq`, `deleteFaq`
   - `src/app/actions/company.ts` — `updateCompanyContent`
   - `src/app/actions/users.ts` — `toggleUserActive` (activate/deactivate any customer account)
2. **Plaintext credentials accepted and stored.** `verifyPassword()` fell back to `storedHash === password`,
   accepting a plaintext password as valid. Five customer rows in `User` did in fact store plaintext passwords
   — four of them `active=1`, so they were live credentials at rest.
3. **Sensitive account fields returned by an API.** `/api/admin/audit` used `include: { admin: true }`, which
   serialised the **entire** `AdminUser` row to the browser — including `passwordHash` and `mfaSecret` — for
   up to 20 records per request. The sanitizer only cleaned `metadata`, not the nested actor.
4. **Publicly known session-signing key baked into source.** `AUTH_SECRET || NEXTAUTH_SECRET ||
   "fashion-feet-very-secret-key-..."` meant any deployment missing the env var signed sessions with a key
   anyone can read from the repository, allowing forged session tokens.
5. **Broken account-security checks.** `verifyUserPassword()` and `deleteUserAccount()` compared the submitted
   password directly to the stored **hash** (`user.password !== password`). This could never succeed for an
   Argon2id account (so account deletion was impossible for real users) and acted as a plaintext oracle for the
   accounts that did store plaintext.

### High

6. **Forgeable pre-MFA cookie.** `ff_admin_premfa` stored the raw admin id, unsigned. Anyone able to set that
   cookie (e.g. via a compromised/attacker-controlled sibling subdomain performing cookie tossing) skipped the
   password factor entirely, leaving only MFA.
7. **Admin session cookie scoped to `/admin`, silently breaking the admin APIs and audit UI.**
   `createAdminSession()` set `path: "/admin"`, so browsers never sent the cookie to `/api/upload`,
   `/api/admin/audit` or `/api/admin/health`. `AuditTimeline` fetches `/api/admin/audit` from the browser, so
   the audit log rendered empty for real admins; uploads and both admin APIs were unreachable. This also
   explains why `/api/admin/health` looked functional before it was protected — it had been answering anonymous
   callers.

### Medium

8. **`/api/admin/health` was entirely unauthenticated**, exposing DB size, migration state, backup filenames
   and audit actor ids to anonymous callers (fixed during the Task 9 pass, re-verified here). It also contained
   a second, diverging copy of the health thresholds.
9. **`revokeSessionAction` allowed any admin to revoke any session**, including a Super Admin's — a privilege
   boundary violation usable for targeted denial of service.
10. **`inviteAdminUser` echoed the new admin's `passwordHash` back to the client**, and enforced no minimum
    length on the initial password.
11. **Upload extension taken from the client filename while only `file.type` was validated.** A POST with
    `Content-Type: image/png` and filename `evil.html` was written to the publicly served `/uploads` directory
    as `.html`, a stored-XSS vector on the application origin.
12. **SVG uploads can execute script when served from the app origin.**
13. **No CSP and no clickjacking protection.** `next.config.ts` shipped HSTS, `X-Content-Type-Options`,
    `Referrer-Policy` and `Permissions-Policy` only — despite the acceptance manifest claiming CSP coverage.
    There was no `X-Frame-Options` and no `frame-ancestors`.
14. **Internal error detail leaked to clients** — upload 500 returned `error.message`; `/api/search` 500
    returned `details: error.message`.

### Low / informational

15. **Proxy is a coarse gate.** `src/proxy.ts` treats *any* non-empty `ff_admin_session` cookie as an
    authorised `SUPER_ADMIN`. This is **not** a bypass — every admin page and action performs a DB-backed
    check, which the forged-cookie probe confirms. It is degraded defence-in-depth only.
16. **`/admin/editor/preview` is statically served with no auth check.** It is client-only and fetches no
    server data, so no information is exposed, but its `postMessage` handler does not validate
    `event.origin`.
17. ~~**No TOTP replay protection.**~~ **FIXED — see [MfaFlow.md](MfaFlow.md).** A code was accepted anywhere in
    the ±1 step window (~90 s) and could be replayed within it. A `mfaLastUsedStep` column now rejects a reused
    time step. The same task found and fixed four further MFA defects, including a **critical bypass** where
    `setupMfaSecret()` could rotate an already-enrolled secret, and the fact that `/admin/mfa` was unreachable
    through the proxy — so the TOTP flow could not previously be completed in a browser at all.
18. **Recovery codes use unsalted SHA-256 over 40 bits** of entropy, weaker than the Argon2id used for
    passwords.
19. **Rate limiting is per-process, in-memory.** Limits reset on restart, are not shared across instances, and
    there is no IP-level throttle; admin lockout is keyed on email only.
20. **`updateMediaAssetAction` spreads the caller-supplied object into a Prisma update.** Prisma rejects
    unknown fields so it is not exploitable mass assignment, but the pattern is fragile.
21. **No CORS policy is configured** (defaults to same-origin). Fine for a monolith; it must be revisited if
    the admin APIs are split onto a different host than the pages that call them.
22. **`.env` contains a plaintext `ADMIN_PASSWORD`.** It is gitignored, but it is still credential material in
    a file rather than a secret store.
23. **No git repository exists.** There is therefore no baseline to diff against and no audit trail for code
    changes; this was also noted during Task 9.
24. **`getActiveFestival` performs a database write on an unauthenticated public read path.** It calls
    `prisma.festival.update(...)` to mark an expired campaign `COMPLETED`/disabled. The write is
    self-limiting — it only applies the same transition the scheduler would apply, and only once a campaign's
    `endDate` has already passed — so it is not usable to change arbitrary state. **Deliberately not fixed:**
    the public storefront must be able to call this to render the correct active campaign, and gating it would
    break the storefront; making it non-mutating would change intended behaviour. Recorded here so the
    "no unauthenticated mutations remain" claim is read precisely.
25. **Residual from independent verification:** two further instances of the leaked-full-row defect class were
    found in code I had not swept — `updateUserProfile` returning the whole `User` row (including the Argon2id
    `password` and `mfaSecret`) and `admin/page.tsx` using `include: { admin: true }` for the recent-audit
    widget. Both are now fixed (see §3, rows 15–16); the second was latent (server-rendered only) but was the
    same pattern as fixed defect #3.

---

## 3. Security issues fixed

Every fix below was applied and re-verified through the gate (lint, `tsc`, build, acceptance, browser gate).

| # | Fix | File(s) |
|---|---|---|
| 1 | Server-side authorization added to all 15 previously unauthenticated mutations (`getAuthenticatedAdmin()` guard, early `Unauthorized.` return) | `mediaActions.ts`, `settings.ts`, `discounts.ts`, `faq.ts`, `company.ts`, `users.ts` |
| 2 | Plaintext acceptance removed from `verifyPassword()`; existing plaintext rows migrated in place to Argon2id (same passwords, so no lockout) | `lib/password.ts` + data migration |
| 3 | Actor fields narrowed to `{ id, name, email, role }` — `passwordHash`/`mfaSecret` can no longer be returned | `api/admin/audit/route.ts` |
| 4 | Hardcoded signing-key fallback removed; production now fails closed with an actionable error, dev keeps a clearly-labelled insecure default | `lib/authSecret.ts` (new), `auth.ts`, `auth.config.ts` |
| 5 | Account verification and deletion now use `verifyPassword()` | `actions/userAccount.ts` |
| 6 | Pre-MFA cookie is an HMAC-SHA256-signed handle (`adminId.issuedAt.signature`) with a 5-minute TTL, verified in constant time — forging it no longer skips the password factor | `actions/admin.ts` |
| 7 | Session cookie path corrected to `/`; admin APIs and the audit-log UI now authenticate | `lib/adminAuth.ts` |
| 8 | `/api/admin/health` authentication guard retained and re-verified; its duplicate rule engine removed in favour of the shared engine | `api/admin/health/route.ts` |
| 9 | Session revocation restricted to the session owner or a `SUPER_ADMIN`, and now emits an `ADMIN_SESSION_REVOKED` audit entry | `actions/admin.ts` |
| 10 | `inviteAdminUser` returns only non-sensitive fields; initial password must be ≥ 12 characters | `actions/admin.ts` |
| 11 | Upload extension derived from the validated MIME type, never the filename | `api/upload/route.ts` |
| 12 | `/uploads/:path*` served with `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` + `nosniff` | `next.config.ts` |
| 13 | Baseline CSP (`frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`), `X-Frame-Options: DENY`, `X-Permitted-Cross-Domain-Policies: none`, `Referrer-Policy` tightened to `strict-origin-when-cross-origin` | `next.config.ts` |
| 14 | Generic client-facing 500 responses; detail logged server-side only | `api/upload/route.ts`, `api/search/route.ts` |
| 15 | `updateUserProfile` returns only non-sensitive profile fields — no `password`/`mfaSecret` crosses the boundary | `actions/users.ts` |
| 16 | Recent-audit widget narrowed to `{ id, name, role }` so the fixed defect-#3 pattern cannot re-leak on refactor | `admin/page.tsx` |

Deliberately **not** changed, because the fixes would be redesigns or require broader changes: recovery-code
hashing strength (#18), rate-limit storage (#19), proxy defence-in-depth (#15), `postMessage` origin (#16),
CORS (#21). These are documented as follow-ups instead of being silently weakened or half-fixed.

**Since this report:** TOTP replay protection (#17) has been fixed, along with four further MFA defects —
see [MfaFlow.md](MfaFlow.md). A **30-minute admin session idle timeout** has also been added
(`ADMIN_IDLE_TIMEOUT_MINUTES`), so a session no longer stays valid for the full 12 hours on an unattended
machine — see §6. `getActiveFestival` (#24) is unchanged and remains a documented design finding.

---

## 4. Issues that cannot be verified locally

Nothing was deployed, so the following are **unverified at this level** and must not be treated as confirmed:

- Real HTTPS/TLS behaviour: `Secure` cookie enforcement over `https://`, HSTS and HSTS-preload semantics
  (browsers ignore HSTS over `http://localhost`).
- The `Secure` flag itself: `createAdminSession()` and the pre-MFA cookie set `secure` only when
  `NODE_ENV === "production"`. Verified by inspection, not by a real TLS request.
- Cookie domain behaviour across `fashionfeet.co.in` and `admin.fashionfeet.co.in`, including cookie-tossing
  exposure from any other subdomain. The code never sets an explicit `Domain`, so cookies are host-only —
  which is the desired behaviour, but the real DNS/reverse-proxy layout could not be exercised.
- Actual physical isolation of the admin system. **The codebase is currently a single monolithic Next.js
  application**; there is no separate admin deployment, origin, process or database. Isolation today is
  *logical* (route prefix `/admin`, separate cookie, DB-backed admin session table) and not physical. Nothing
  here should be read as claiming otherwise.
- Reverse-proxy / CDN / WAF behaviour: IP-level rate limiting, bot mitigation, request-size limits, TLS
  termination.
- Real authenticator-app enrollment against a physical device. RFC 6238 vectors and the `otpauth://` payload
  are the substitute evidence.
- The `otplib` interoperability cross-check could not run inside this test harness (module interop failure in
  the runner, not an application defect). RFC vectors cover the same compliance claim.
- Multi-instance rate limiting and session behaviour.
- Whether `fashionfeet.co.in` and `admin.fashionfeet.co.in` share a registrable domain in practice.

---

## 5. Required before/at deployment of fashionfeet.co.in and admin.fashionfeet.co.in

**Blocking**

1. **Set `AUTH_SECRET` (or `NEXTAUTH_SECRET`) per environment.** Production now refuses to start without it.
   Generate with 32+ random bytes. Set `AUTH_URL`/`NEXTAUTH_URL` for each host.
2. **Decide the separation topology and implement it.** Today it is one app. Realistic options:
   - *Recommended:* deploy the same artifact twice behind a reverse proxy that routes by hostname, and keep
     **all** admin traffic (pages *and* `/api/admin/*`, `/api/upload`) on the admin host. The current
     `api/upload` path is shared with the storefront, so either route it to the admin host or split it.
   - *One app, two hostnames:* acceptable as a first step, but admin and storefront then share an origin's
     cookie space; keep admin cookies host-only and never set `Domain=.fashionfeet.co.in`.
3. **SQLite is not viable for two independently deployed instances.** `dev.db` is a single file. If the admin
   and storefront run as separate processes on separate hosts, migrate to a server database (Postgres/MySQL)
   first. If both run in one process on one host, document that constraint explicitly.
4. **Do not share admin cookies with the apex.** Leave the admin session cookie host-only (no `Domain`
   attribute). Storefront cookies must not grant any admin capability.
5. **Remove `ADMIN_PASSWORD` from `.env`**; provision the initial Super Admin password through a secret store
   and rotate it. Minimum length is now enforced at 12 characters for invites.
6. **Verify the `prisma/migrations` directory ships in the deployment artifact.** The health dashboard reports
   `UNKNOWN` for migration state if it is missing (this is intentional fail-visible behaviour).
7. **Keep `/backups` and `*.db` outside the web root.** They are gitignored and are not served by Next today;
   confirm the production file layout preserves that.

**Hardening**

8. Add a nonce-based `script-src` CSP once a nonce pipeline exists; the current CSP intentionally does not
   restrict script/style loading.
9. Enable HSTS preload only after every subdomain serves valid HTTPS.
10. Move rate limiting to a shared store (Redis) or terminate it at the edge/WAF, and add an IP-based limit
    alongside the existing per-email admin lockout.
11. Configure an explicit CORS allowlist **only** if admin APIs must be called from a different origin than
    the pages; otherwise keep same-origin. Note that cross-site admin cookies would need
    `SameSite=None; Secure`, which is weaker than the current `Lax`.
12. Alert on the `ADMIN_LOGIN_FAILED`, `ADMIN_LOGIN_BLOCKED_SUSPENDED`, `MFA_VERIFICATION_FAILED` and
    `ADMIN_SESSION_REVOKED` audit events.
13. Reconsider allowing SVG uploads if the media library does not need them; the per-path sandbox CSP is a
    mitigation, not an elimination, of the stored-XSS class.
14. Initialise git and commit a baseline before further work, so future security changes are reviewable.

---

## 6. Admin session model — scope, lifetime and device binding

Answers the question "if I sign in, does anyone else get the admin console?" against the code as it stands.

**The session is a bearer token in a per-browser cookie, not shared server state.** Signing in writes an
`ff_admin_session` cookie into that one browser and creates an `AdminSession` row keyed by the token
(`crypto.randomBytes(32)` → 64 hex chars; the `token` column is `@unique`). Every later request is
authenticated by reading the cookie the *requesting* browser sent and looking that token up. There is no
global "an admin is signed in" flag anywhere in the application, so signing in on one device cannot
authenticate another.

| Property | Value | Source |
|---|---|---|
| Cookie name | `ff_admin_session` | `lib/adminAuth.ts` |
| Token | 32 random bytes, hex, unique index | `createAdminSession()` |
| Absolute lifetime | 12h from issue | `SESSION_EXPIRY_HOURS = 12` |
| Idle timeout | 30 min, override via `ADMIN_IDLE_TIMEOUT_MINUTES` | `getAuthenticatedAdmin()` |
| `httpOnly` | `true` | `createAdminSession()` |
| `secure` | only when `NODE_ENV === "production"` | `createAdminSession()` |
| `sameSite` | `lax` | `createAdminSession()` |
| `path` | `/` (deliberate — see defect #7) | `createAdminSession()` |
| `Domain` | never set → host-only | `createAdminSession()` |

### What each client sees

| Client | Cookie present | Result on `/admin/*` |
|---|---|---|
| The browser that signed in | yes | admin console |
| A different browser / OS user / private window | no | `302` to `/admin/login` |
| A second tab in the signed-in browser | yes (shared jar) | admin console |
| Any client that never receives the cookie | no | `302` to `/admin/login` |

The third row is the one that matters operationally: **a new device is refused, but a new person at the same
browser profile is not.** The cookie jar is per browser profile, not per human, so an admin console left open
on a shared machine is already authenticated for whoever sits down next. The idle timeout below bounds that
exposure; previously it was unbounded for the full 12 hours.

### The token is not bound to a device

`createAdminSession()` *records* `ipAddress` and `userAgent`, but `getAuthenticatedAdmin()` never compares
either. It validates only that the token exists, that `expiresAt` has not passed, that the idle bound has not
been exceeded, and that the admin is not suspended. The cookie is therefore a pure bearer credential: whoever
holds the string can present it from anywhere until it expires. `httpOnly` is what stops script reading it,
and `secure` (in production) is what stops it crossing plaintext HTTP.

### Which layer enforces it

Two layers, only the second of which is authoritative:

1. **Middleware (`src/proxy.ts`) — coarse.** It treats *any* non-empty `ff_admin_session` value as an
   authorised `SUPER_ADMIN` (documented as defect #15). A forged cookie value passes this layer.
2. **Server-side `getAuthenticatedAdmin()` — authoritative.** Called by `AdminShell`
   (`components/admin/AdminShell.tsx`), which `redirect()`s to `/admin/login` when it returns null, and by
   every privileged server action and admin API route.

Coverage across the 16 `src/app/admin/**/page.tsx` files — **12 wrap in `AdminShell`**, **2 guard themselves
directly without it** (`/admin/editor`, `/admin/mfa`), and **2 make no auth call at all**: `/admin/login`, which
is a pre-session page by design, and `/admin/editor/preview`, which is client-only and reads no server data
(defect #16). Those three buckets are a partition: 12 + 2 + 2 = 16, with no file counted twice. The
forged-cookie probe in §1 confirms the authoritative layer rejects a bad value with no admin content returned,
so layer 1 being weak is degraded defence-in-depth rather than a bypass.

### Consequences

- Every device signs in separately. Signing out of one does not sign out another, because each sign-in is its
  own `AdminSession` row.
- Suspending an admin (`toggleSuspendAdmin`) or resetting their MFA (`resetAdminMfa`) deletes **all** of that
  admin's session rows at once — that is the available kill switch.
- Individual sessions are visible and revocable at `/admin/settings`; a non-`SUPER_ADMIN` may only revoke
  their own (defect #9, fixed).
- `sameSite: "lax"` blocks most cross-site POST CSRF. `path: "/"` also sends the cookie on storefront routes,
  which `httpOnly` keeps from becoming a read primitive; the separated production topology in §5 fixes the
  scope properly by moving the admin host out of the storefront's cookie space.

---

## 7. Public `/api/v1` surface — unauthenticated by design

Added after Task 10 for the native mobile client (`mobile/`): a public read surface at
`src/app/api/v1/**`. It is a deliberate expansion of public, unauthenticated attack surface, and it is
constrained rather than defended by authentication.

- **Unauthenticated by design.** There is no customer login in this product, so there is nothing to
  authenticate against. The surface reads no session and accepts no credential.
- **Strictly read-only.** No `POST`/`PUT`/`PATCH`/`DELETE` handler exists anywhere on it, so a write
  method is answered with `405`.
- **Whitelisted, never rows.** `src/lib/publicSerializers.ts` builds every response object field by
  field; nothing is spread from a Prisma row. Adding a column to the schema cannot widen a public
  response by accident — a field becomes public only when that file is edited on purpose. `Store.managerName`
  (a named individual's contact) and `StorefrontConfig.lastEditedById` (an `AdminUser` id) are
  explicitly excluded, and only an allowlist of `appearance.*` settings keys may leave the server.
- **No credentials on the wire.** The CORS headers never set `Access-Control-Allow-Credentials`, so a
  browser cannot ride an admin cookie onto the surface; `Access-Control-Allow-Origin` is `*` because
  the response contains nothing per-user.
- **Rate-limited.** 120 requests per 60s per client IP, then `429` with `Retry-After`. An
  unauthenticated endpoint with no throttle is a trivial denial-of-service vector.
- **Fail-quiet.** Unhandled errors are logged server-side and returned as a generic
  `Internal server error`, consistent with the defect #14 fix in §3.

**Rule for future work:** this surface must never be extended with admin routes, authenticated routes
or write operations. Administrative functionality stays on `/admin` and `/api/admin/*` under the
session model in §6. The endpoint contract and its field lists are in [MobileApp.md](MobileApp.md).

---

## 8. Task 10 verdict

**PASS — for the locally verifiable scope, with deployment-dependent items explicitly out of scope.**

- All five verification commands pass on the frozen tree.
- 26/26 admin-boundary probes behave correctly, including forged, expired and revoked credentials, and the
  `CONTENT_MANAGER` role boundary is enforced at the server (API `403`), not merely in the UI.
- MFA is RFC 6238 compliant and its enrollment payload is valid for standard authenticator apps.
- Five critical, two high, and seven medium defects were found and fixed.
- Nothing claimed in section 5 was verified, and the codebase remains a **single monolithic application** — it
  is not physically separated today.

Tasks 11 and 12 were not started.
