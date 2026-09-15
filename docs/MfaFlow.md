# Admin MFA — Real TOTP Authenticator Flow

**Deployment level: LOCALHOST / not deployed** (unchanged). Everything below was verified against a production
build (`npm run build` + `npm start`) on `http://localhost:3000`.

Goal: the admin login genuinely requires a valid authenticator-generated TOTP code — not an MFA-shaped screen.

---

## 1. Flow as implemented

### Enrolment (first login)
```text
/admin/login  email + password
      ↓  server verifies Argon2id password
      ↓  no session created; HMAC-signed pre-MFA handle issued (5 min TTL)
/admin/mfa
      ↓  secret generated (20 random bytes → base32, 160 bits)
      ↓  otpauth:// URI + QR code rendered, manual key shown as fallback
      ↓  administrator scans with Google Authenticator / Authy / 1Password / Microsoft Authenticator
      ↓  6-digit code submitted
      ↓  SERVER verifies TOTP (RFC 6238, ±1 step) — the browser is never trusted
      ↓  only now: mfaEnabled = true, 8 recovery codes generated (stored as SHA-256 digests)
      ↓  pre-MFA handle cleared, full admin session created
      ↓  recovery codes displayed exactly once
/admin
```

### Every subsequent login
```text
email + password → pre-MFA handle → 6-digit TOTP code → server verification → full admin session
```

A successful password **never** yields a session on its own: `createAdminSession()` is called from exactly one
production site, inside `verifyAdminMfa()`, after the code has been verified.

---

## 2. Defects found and fixed

This task found four defects that made the flow either bypassable or impossible to complete. All were fixed and
re-verified.

### 2.1 CRITICAL — MFA bypass by rotating the enrolled secret
`setupMfaSecret()` had no `mfaEnabled` guard. Anyone knowing **only the password** could call it to replace the
enrolled secret, read the replacement straight out of the response, derive a valid code from it, and obtain a
full admin session — defeating the second factor entirely. The UI's `if (!mfaEnabled)` guard was not a security
control, because server actions are directly callable (the same class of bug as Task 10's unauthenticated
actions).

*Fixed:* the action refuses when MFA is already enrolled (with an `MFA_ENROLLMENT_BLOCKED_ALREADY_ENROLLED`
audit entry) and directs the user to the Super Admin `resetAdminMfa` action. It also **reuses** an existing
pending secret so reloading the page no longer invalidates a QR code the administrator has already scanned.

### 2.2 CRITICAL — the MFA page was unreachable
`src/proxy.ts` required `ff_admin_session` (or a NextAuth session) for every `/admin` path except
`/admin/login`. An administrator on `/admin/mfa` holds only a pre-MFA handle by definition, so the proxy
bounced every request straight back to the login form. **The TOTP flow could not be completed in a browser at
all.** The browser gate never caught this because it sets its session cookie directly instead of logging in.

*Fixed:* `/admin/mfa` is exempt from the coarse session gate. The page performs its own authoritative
`getPreMfaAdmin()` check, so no protection is lost.

### 2.3 HIGH — recovery codes were unusable
`AdminMfaClient` hardcoded `verifyAdminMfa(code, false)`, so `isRecoveryCode` was never true from any caller.
Recovery codes were generated and displayed but there was no way to redeem them — an administrator who lost
their device was locked out.

*Fixed:* a "Lost your authenticator? Use a recovery code" mode that submits with `isRecoveryCode = true`,
accepts the 10-character code format, and validates at 10 characters.

### 2.4 HIGH — recovery codes were never actually shown
`verifyAdminMfa()` cleared the pre-MFA handle and then called `revalidatePath("/admin")`. A Next.js server action
re-renders the current route as part of its response, so that re-render of `/admin/mfa` found no pre-MFA admin and
redirected to the login page — destroying the one-time recovery-code display before it could be read.

*Fixed:* removed the `revalidatePath("/admin")` (the dashboard is a dynamic route and renders fresh anyway) and
made `/admin/mfa` render for an already-authenticated admin so the component stays mounted. The actions remain
inert in that state because both require a pre-MFA handle.

### 2.5 MEDIUM — no TOTP replay protection
A code was accepted anywhere in the ±1 step window and could be replayed within it. RFC 6238 §5.2 says a verifier
should not accept the same OTP twice.

*Fixed:* new `AdminUser.mfaLastUsedStep` column (migration
`20260915104420_mfa_totp_replay_protection`), `verifyMfaTokenWithStep()` returning the matched step, a
constant-time comparison, and rejection of any step already used (audited as `MFA_CODE_REPLAY_REJECTED`).
**Trade-off:** strictly rejecting `step <= lastUsed` also blocks reuse within the same 30-second window, so an
administrator who signs out and immediately back in must wait for the authenticator to roll over.

### 2.6 MEDIUM — admin credentials were serialised to the browser (found by independent verification)
`src/app/admin/administrators/page.tsx` used `prisma.adminUser.findMany()` with **no `select`** and passed the
rows to the `"use client"` `AdminUserTable`, so `passwordHash` and `mfaSecret` were embedded in the page payload
for every administrator, even though the table never renders them. Fixed with an explicit `select` of the six
fields the table actually uses.

The same class of leak was closed in the shared helper: `getAuthenticatedAdmin()`
(`src/lib/adminAuth.ts`) previously used `include: { admin: true }`, returning the whole `AdminUser` row. It now
selects only the fields callers need, so no future client-component prop can serialise credentials. `tsc`
confirms no caller depended on the removed fields. This pattern had already been found and fixed twice before
(the audit API and the dashboard) — it is worth grepping for on every new admin data path.

### 2.7 Minor
- `adminLogin` no longer returns the internal `adminId`.
- `lastLoginAt` is now recorded on successful login (it was never written).
- Added audit events: `MFA_ENROLLMENT_STARTED`, `MFA_ENROLLMENT_BLOCKED_ALREADY_ENROLLED`,
  `MFA_CODE_REPLAY_REJECTED`.

---

## 3. Verification evidence

**Independent RFC 6238 implementation.** The test harness contains its own TOTP generator written from scratch
(HMAC-SHA1, 30 s step, 6 digits) sharing no code with the application. It reproduces all six RFC 6238 Appendix B
SHA-1 vectors: `T=59→287082`, `1111111109→081804`, `1111111111→050471`, `1234567890→005924`,
`2000000000→279037`, `20000000000→353130` — **6/6**. This is the standards-compatibility evidence.

**End-to-end flow: 34/34 scenarios passed** against the production build, driving the real login UI in a
browser. Every submitted code was **derived from the secret**; no expected code is hardcoded anywhere.

| # | Scenario | Result |
|---|---|---|
| 1 | Unenrolled admin with correct password reaches the enrolment screen | PASS |
| 1b | No session granted on password alone | PASS |
| 1c | Manual secret fallback displayed | PASS |
| 2 | QR code generated and rendered | PASS |
| 3 | Displayed secret is valid base32 and matches the stored secret | PASS |
| 3b/3c | Not active before verification; reload does not rotate the secret | PASS |
| 6/6b | Incorrect code rejected; failed attempt does not enrol | PASS |
| 7/7b | Out-of-window code rejected; malformed input cannot be submitted | PASS |
| 5/5b | **Correct code completes enrolment; MFA marked enrolled only then** | PASS |
| 5c/5d/5e | 8 recovery codes issued, stored only as digests, secret not rendered after enrolment | PASS |
| 5f | Completing MFA yields an authenticated session | PASS |
| 8 | Correct password without a TOTP code cannot reach `/admin` (`→ /admin/login`, no admin content) | PASS |
| 9/9b | Forged pre-MFA state cannot reach `/admin` or `/admin/mfa` | PASS |
| 10/10b/10c | Recovery code authenticates once, is consumed once, and is audited | PASS |
| 11 | Reusing the same recovery code is rejected | PASS |
| 12 | Logout invalidates the authenticated session | PASS |
| 13/13b | Revoked and expired sessions rejected (307) | PASS |
| 14a–14d | CONTENT_MANAGER logs in with a real TOTP code, is denied the audit API (403), allowed health (200), and cannot open the audit log | PASS |

The harness is archived at `artifacts/mfa-e2e/mfa-e2e.cjs` (gitignored) so the result is reproducible.

**Gate results:** `lint` 0 errors · `tsc` clean · `build` green · `test:acceptance` passed ·
`test:gate2` 72/72, 0 console errors.

---

## 4. Limitations (cannot be tested locally)

- **No physical authenticator device was used.** The claim that Google Authenticator / Authy / 1Password will
  work rests on: the `otpauth://` URI following the Key URI Format (issuer label + `issuer`, `algorithm=SHA1`,
  `digits=6`, `period=30`), a 160-bit base32 secret, and the server accepting codes generated by an independent
  RFC 6238 implementation. A real device scan was not performed.
- **Rate limiting remains per-process, in-memory** (5 attempts / 15 min, keyed on the account). It resets on
  restart and is not shared across instances; there is still no IP-level throttle. Needs a shared store or
  edge/WAF limiting at deployment.
- **Recovery codes remain 40-bit, unsalted SHA-256 at rest** — adequate but weaker than the Argon2id used for
  passwords. Unchanged.
- **Strict replay protection** means an immediate re-login within the same 30 s window is rejected by design.
- **Sessions are bearer tokens in SQLite**; expiry/revocation are enforced server-side per request, but there is
  no rotation on privilege change.
