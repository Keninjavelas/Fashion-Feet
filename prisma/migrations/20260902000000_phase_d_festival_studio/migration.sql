-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Festival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "theme" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "heroSubtitle" TEXT,
    "heroBanner" TEXT,
    "mediaAssetId" TEXT,
    "accentColor" TEXT DEFAULT '#D4AF37',
    "announcement" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT true,
    "animation" TEXT DEFAULT 'floating-diyas',
    "effectIntensity" TEXT DEFAULT 'BALANCED',
    "badgeText" TEXT,
    "offerHeading" TEXT,
    "offerDescription" TEXT,
    "ctaText" TEXT DEFAULT 'Explore Festive Collection',
    "discountPercentage" REAL,
    "discountScope" TEXT DEFAULT 'FESTIVAL_COLLECTION',
    "productIds" TEXT,
    "autoActivate" BOOLEAN NOT NULL DEFAULT true,
    "autoDisable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Festival_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Festival" ("accentColor", "animation", "announcement", "autoActivate", "autoDisable", "createdAt", "description", "discountPercentage", "discountScope", "enabled", "endDate", "heroBanner", "id", "name", "productIds", "startDate", "status", "theme") SELECT "accentColor", "animation", "announcement", "autoActivate", "autoDisable", "createdAt", "description", "discountPercentage", "discountScope", "enabled", "endDate", "heroBanner", "id", "name", "productIds", "startDate", "status", "theme" FROM "Festival";
DROP TABLE "Festival";
ALTER TABLE "new_Festival" RENAME TO "Festival";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
