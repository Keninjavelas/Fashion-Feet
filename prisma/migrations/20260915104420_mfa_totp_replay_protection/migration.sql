-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "mfaLastUsedStep" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemBackup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemBackup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SystemBackup" ("checksumSha256", "createdAt", "createdById", "filePath", "fileSizeBytes", "filename", "id", "status") SELECT "checksumSha256", "createdAt", "createdById", "filePath", "fileSizeBytes", "filename", "id", "status" FROM "SystemBackup";
DROP TABLE "SystemBackup";
ALTER TABLE "new_SystemBackup" RENAME TO "SystemBackup";
CREATE UNIQUE INDEX "SystemBackup_filename_key" ON "SystemBackup"("filename");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
