-- CreateTable
CREATE TABLE "StorefrontConfigHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "sections" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT,
    "changelogNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StorefrontConfigHistory_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemBackup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemBackup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StorefrontConfigHistory_page_version_idx" ON "StorefrontConfigHistory"("page", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SystemBackup_filename_key" ON "SystemBackup"("filename");
