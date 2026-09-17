# Fashion Feet — Store Details

Add each real location you operate. Copy the block below once per store.
Mark anything unknown as `TODO` rather than guessing.

The store table is now **empty**. The three fabricated placeholder records that used to be seeded
(invented addresses, phone numbers and `@fashionfeet.com` email addresses) have been removed — from
`prisma/seed.ts` and from the database — rather than renamed. `prisma/seed.ts` deliberately creates
**no** store at all, so a fresh database starts with a legitimately empty store table and anything you
see in `/admin/stores` is a real record you added. The removed rows remain recoverable from git history
at commit `b2c2f79`.

---

## Store 1

- **Name:**
- **Type:** (flagship / boutique / outlet / studio)
- **Street address:**
- **City:**
- **State:**
- **PIN code:**
- **Country:** India
- **Phone:**
- **Email:**
- **WhatsApp:**
- **Opening hours:** (e.g. Mon–Sat 10:30–20:30, Sun closed)
- **Services offered:** (e.g. custom fitting, bridal consultation, repairs)
- **Accessibility notes:**
- **Google Maps URL:**
- **Latitude / Longitude:** (optional — helps map embeds)
- **Photographs:** (filenames from `intake/stores/`, or tell me which files belong here)

---

## Store 2

- **Name:**
- **Type:**
- **Street address:**
- **City:**
- **State:**
- **PIN code:**
- **Phone:**
- **Email:**
- **WhatsApp:**
- **Opening hours:**
- **Services offered:**
- **Accessibility notes:**
- **Google Maps URL:**
- **Photographs:**

---

## Adding your real stores

The fabricated placeholder records are already gone — from both `prisma/seed.ts` and the database — so
there is no decision to make about them and nothing to confirm. Tell me once your real locations are
ready and I will add each one from this template through the admin console (`/admin/stores`). A newly
created store defaults to `DRAFT` with blank contact fields, so it stays invisible on the website and to
the mobile app until you deliberately publish it.
