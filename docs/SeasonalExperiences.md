# Seasonal experiences

The storefront supports `default`, `diwali`, `holi`, `eid`, `christmas`, `lohri`, and `baisakhi` themes. Token sets live in `src/lib/themeTokens.ts` and `src/lib/seasonalConstants.ts`; the active festival is read by `src/lib/activeFestival.ts` and provided by `StorefrontLayout`.

Administrators manage festival schedules, assets, and activation in the separate dashboard at `/admin/festivals`. The published/active settings are read from the shared PostgreSQL database on storefront requests. Open storefront tabs need a refresh to pick up a change.

Seasonal copy and product claims in presets are design defaults, not verified business facts. Review them with the owner before promoting them as offers, stock promises, shipping terms, or material claims. The current content review is recorded in [ContentIntake.md](ContentIntake.md).
