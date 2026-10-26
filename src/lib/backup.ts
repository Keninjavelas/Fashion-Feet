import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { execSync } from "child_process";
const BACKUPS_DIR = path.join(process.cwd(), "backups");
const managedPostgres = /^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "");

function requireLocalSqlite() {
  if (managedPostgres || process.env.VERCEL) {
    throw new Error("Database snapshots are managed by the PostgreSQL provider. Use its console for backups and recovery.");
  }
}

/**
 * Ensures the backups directory exists.
 */
function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Computes SHA-256 checksum for a file.
 */
function computeFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

/**
 * Creates an atomic snapshot backup of the SQLite database.
 */
export async function createDatabaseBackup(adminId?: string) {
  requireLocalSqlite();
  ensureBackupsDir();

  const dbPath = path.join(process.cwd(), "dev.db");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Primary database file not found at ${dbPath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup_${timestamp}.db`;
  const backupFilePath = path.join(BACKUPS_DIR, filename);

  // Use SQLite VACUUM INTO to create a consistent snapshot
  // This requires Prisma to run a raw query on the live DB
  await prisma.$executeRawUnsafe(`VACUUM INTO '${backupFilePath.replace(/\\/g, "\\\\")}';`);

  // Run integrity check on the generated backup
  const integrityResult = await prisma.$queryRawUnsafe(`PRAGMA integrity_check;`);
  // Note: The integrity_check runs against the live DB; to check backup, we open a new sqlite connection via child process
  // For simplicity, we will trust VACUUM INTO and proceed to checksum verification.

  const stats = fs.statSync(backupFilePath);
  const checksum = computeFileSha256(backupFilePath);

  // Record backup in database with initial status PENDING; will update after verification
  const record = await prisma.systemBackup.create({
    data: {
      filename,
      filePath: backupFilePath,
      fileSizeBytes: stats.size,
      checksumSha256: checksum,
      status: "PENDING",
      createdById: adminId || null,
    },
  });

  // Verify integrity of the backup file using sqlite3 CLI
  try {

    const result = execSync(`sqlite3 "${backupFilePath}" "PRAGMA integrity_check;"`, { encoding: "utf-8" }).trim();
    if (result !== "ok") {
      await prisma.systemBackup.update({ where: { id: record.id }, data: { status: "FAILED" } });
      throw new Error(`Backup integrity check failed: ${result}`);
    }
    // Mark as VALID
    await prisma.systemBackup.update({ where: { id: record.id }, data: { status: "VALID" } });
  } catch (e) {
    await prisma.systemBackup.update({ where: { id: record.id }, data: { status: "FAILED" } });
    throw e;
  }

  return record;
}

/**
 * Lists all database backup records.
 */
export async function listDatabaseBackups() {
  requireLocalSqlite();
  ensureBackupsDir();

  return await prisma.systemBackup.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, email: true } }
    }
  });
}

/**
 * Restores the SQLite database from a specified backup snapshot.
 */
export async function restoreDatabaseBackup(backupId: string, adminId?: string) {
  requireLocalSqlite();
  const backup = await prisma.systemBackup.findUnique({ where: { id: backupId } });
  if (!backup) {
    throw new Error(`Backup record ${backupId} not found.`);
  }

  if (!fs.existsSync(backup.filePath)) {
    throw new Error(`Backup file ${backup.filename} does not exist on disk.`);
  }

  // Verify SHA-256 checksum before restoration
  const currentChecksum = computeFileSha256(backup.filePath);
  if (currentChecksum !== backup.checksumSha256) {
    throw new Error(`Checksum mismatch! Backup file may be corrupted or tampered with.`);
  }

  const dbPath = path.join(process.cwd(), "dev.db");

  // Step 1: Create a pre-restore safeguard backup of the current database
  const safeguardTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeguardFilename = `safeguard_pre_restore_${safeguardTimestamp}.db`;
  const safeguardPath = path.join(BACKUPS_DIR, safeguardFilename);

  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, safeguardPath);
    const safeguardStats = fs.statSync(safeguardPath);
    await prisma.systemBackup.create({
      data: {
        filename: safeguardFilename,
        filePath: safeguardPath,
        fileSizeBytes: safeguardStats.size,
        checksumSha256: computeFileSha256(safeguardPath),
        status: "SAFEGUARD",
        createdById: adminId || null,
      }
    }).catch(() => null);
  }

  // Step 2: Restore backup over primary database file
  fs.copyFileSync(backup.filePath, dbPath);

  // Step 3: Mark backup record status
  await prisma.systemBackup.update({
    where: { id: backup.id },
    data: { status: "RESTORED" }
  });

  return { success: true, restoredFilename: backup.filename };
}
