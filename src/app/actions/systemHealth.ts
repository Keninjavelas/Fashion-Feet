"use server";

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { sanitizeAuditRecord } from "@/lib/auditSanitizer";
import {
  evaluateBackupAge,
  evaluateDatabaseConnectivity,
  evaluateFailedBackups,
  evaluateMigrationState,
  formatUptime,
  rollupStatus,
  FAILED_BACKUP_WINDOW_HOURS,
  type MigrationStateResult,
} from "@/lib/healthRules";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");
const DB_PATH = path.join(process.cwd(), "dev.db");
const RECENT_EVENT_LIMIT = 6;

/**
 * Migrations shipped with this build, read from the artifact on disk.
 * If the directory is missing the comparison cannot be performed, which must
 * surface as UNKNOWN rather than a silent HEALTHY.
 */
function readShippedMigrations(): { readable: boolean; names: string[] } {
  try {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      return { readable: false, names: [] };
    }
    const names = fs
      .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => fs.existsSync(path.join(MIGRATIONS_DIR, name, "migration.sql")))
      .sort();
    return { readable: true, names };
  } catch {
    return { readable: false, names: [] };
  }
}

/**
 * Applied migrations as recorded by the deployed database. A missing tracking
 * table is reported distinctly so it is never misread as "nothing pending".
 */
async function readAppliedMigrations(): Promise<{
  readable: boolean;
  applied: string[];
  rolledBack: string[];
}> {
  try {
    const rows = await prisma.$queryRawUnsafe<
      Array<{ migration_name: string | null; finished_at: string | null; rolled_back_at: string | null }>
    >("SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations");

    const applied: string[] = [];
    const rolledBack: string[] = [];
    for (const row of rows ?? []) {
      const name = row?.migration_name;
      if (typeof name !== "string" || name.length === 0) continue;
      if (row.rolled_back_at) rolledBack.push(name);
      else if (row.finished_at) applied.push(name);
    }
    return { readable: true, applied, rolledBack };
  } catch {
    return { readable: false, applied: [], rolledBack: [] };
  }
}

/**
 * Compares the migrations shipped with this build against the migration state
 * of the deployed database. Pending migrations are derived from that comparison,
 * never from the tracking table alone.
 */
function compareMigrations(
  shipped: { readable: boolean; names: string[] },
  deployed: { readable: boolean; applied: string[]; rolledBack: string[] }
): MigrationStateResult {
  if (!shipped.readable) {
    return evaluateMigrationState({
      determination: "SHIPPED_UNREADABLE",
      shippedCount: 0,
      appliedCount: deployed.applied.length,
      pending: [],
      rolledBack: deployed.rolledBack,
    });
  }

  if (!deployed.readable) {
    return evaluateMigrationState({
      determination: "TRACKING_TABLE_ABSENT",
      shippedCount: shipped.names.length,
      appliedCount: 0,
      pending: shipped.names,
      rolledBack: [],
    });
  }

  const appliedSet = new Set(deployed.applied);
  const pending = shipped.names.filter((name) => !appliedSet.has(name));

  return evaluateMigrationState({
    determination: "DETERMINED",
    shippedCount: shipped.names.length,
    appliedCount: deployed.applied.length,
    pending,
    rolledBack: deployed.rolledBack,
  });
}

export async function getSystemHealthMetrics() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const now = new Date();
    const failedSince = new Date(
      now.getTime() - FAILED_BACKUP_WINDOW_HOURS * 60 * 60 * 1000
    );

    let dbSizeBytes = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      }
    } catch {
      // Disk footprint is informational only; the connectivity probe below is authoritative.
    }

    let databaseConnected = true;
    let databaseDetail: string | undefined;
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
    } catch (err) {
      databaseConnected = false;
      databaseDetail = `Primary database probe failed: ${
        err instanceof Error ? err.message : "unknown error"
      }`;
    }

    const [
      productCount,
      enquiryCount,
      adminCount,
      adminMfaCount,
      activeSessionCount,
      auditLogCount,
      festivalCount,
      mediaCount,
      historyCount,
      totalBackups,
      lastSuccessfulBackup,
      failedBackupsLast24h,
      recentAuditLogs,
      adminPasswordHashes,
    ] = await Promise.all([
      prisma.product.count().catch(() => 0),
      prisma.enquiry.count().catch(() => 0),
      prisma.adminUser.count().catch(() => 0),
      prisma.adminUser.count({ where: { mfaEnabled: true } }).catch(() => 0),
      prisma.adminSession.count({ where: { expiresAt: { gt: now } } }).catch(() => 0),
      prisma.adminAuditLog.count().catch(() => 0),
      prisma.festival.count().catch(() => 0),
      prisma.mediaAsset.count().catch(() => 0),
      prisma.storefrontConfigHistory.count().catch(() => 0),
      prisma.systemBackup.count().catch(() => 0),
      prisma.systemBackup
        .findFirst({ where: { status: "VALID" }, orderBy: { createdAt: "desc" } })
        .catch(() => null),
      prisma.systemBackup
        .count({ where: { status: "FAILED", createdAt: { gte: failedSince } } })
        .catch(() => 0),
      prisma.adminAuditLog
        .findMany({
          orderBy: { createdAt: "desc" },
          take: RECENT_EVENT_LIMIT,
          include: { admin: { select: { name: true, role: true } } },
        })
        .catch(() => []),
      prisma.adminUser
        .findMany({ select: { passwordHash: true } })
        .catch(() => []),
    ]);

    const connectivity = evaluateDatabaseConnectivity(databaseConnected, databaseDetail);

    const backupAge = evaluateBackupAge({
      lastSuccessfulBackupAt: lastSuccessfulBackup?.createdAt ?? null,
      now,
    });

    const failedBackups = evaluateFailedBackups({
      failedCountLast24h: failedBackupsLast24h,
    });

    const migrations = compareMigrations(
      readShippedMigrations(),
      await readAppliedMigrations()
    );

    const backupHealth = rollupStatus([backupAge.state, failedBackups.state]);

    const overall = rollupStatus([
      connectivity.state,
      backupAge.state,
      failedBackups.state,
      migrations.state,
    ]);

    const mfaAdoptionPercent =
      adminCount > 0 ? Math.round((adminMfaCount / adminCount) * 100) : 0;

    // Derived from the stored hashes rather than asserting a posture string.
    const argon2idAdminCount = (adminPasswordHashes ?? []).filter(
      (record: any) =>
        typeof record?.passwordHash === "string" &&
        record.passwordHash.startsWith("$argon2id$")
    ).length;

    const uptimeSeconds = process.uptime();

    // Operational audit representation: sanitized, never raw sensitive metadata.
    const recentOperationalEvents = (recentAuditLogs ?? []).map((entry: any) => {
      let safeMetadata: string | null = null;

      if (typeof entry.metadata === "string" && entry.metadata.length > 0) {
        try {
          JSON.parse(entry.metadata);
          const sanitized = sanitizeAuditRecord({
            metadata: entry.metadata,
          }) as { metadata?: string | null };
          safeMetadata = sanitized?.metadata ?? null;
        } catch {
          // Non-JSON metadata cannot be sanitized field-by-field, so it is
          // withheld rather than exposed verbatim.
          safeMetadata = null;
        }
      }

      return {
        id: entry.id,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        createdAt: entry.createdAt,
        metadata: safeMetadata,
        actorName: entry.admin?.name ?? null,
        actorRole: entry.admin?.role ?? null,
      };
    });

    return {
      success: true,
      generatedAt: now.toISOString(),
      overall: {
        state: overall,
        precedence: "CRITICAL > UNKNOWN > WARNING > HEALTHY",
        rules: [
          {
            key: "database",
            label: "Database Connectivity",
            state: connectivity.state,
            summary: connectivity.summary,
            detail: connectivity.detail,
          },
          {
            key: "backupAge",
            label: "Backup Freshness",
            state: backupAge.state,
            summary: backupAge.summary,
            detail: backupAge.detail,
          },
          {
            key: "failedBackups",
            label: "Failed Backups",
            state: failedBackups.state,
            summary: failedBackups.summary,
            detail: failedBackups.detail,
          },
          {
            key: "migrations",
            label: "Migration State",
            state: migrations.state,
            summary: migrations.summary,
            detail: migrations.detail,
          },
        ],
      },
      database: {
        status: connectivity.state,
        connected: databaseConnected,
        engine: "SQLite (WAL Mode via @prisma/adapter-better-sqlite3)",
        sizeBytes: dbSizeBytes,
        sizeMb: (dbSizeBytes / (1024 * 1024)).toFixed(2),
        totalBackups,
        lastBackupAt: lastSuccessfulBackup?.createdAt ?? null,
        lastBackupFilename: lastSuccessfulBackup?.filename ?? null,
        backupAgeHours: backupAge.ageHours,
        failedBackupsLast24h,
      },
      backups: {
        state: backupHealth,
        freshness: {
          state: backupAge.state,
          summary: backupAge.summary,
          detail: backupAge.detail,
          ageHours: backupAge.ageHours,
        },
        failures: {
          state: failedBackups.state,
          summary: failedBackups.summary,
          detail: failedBackups.detail,
          count: failedBackups.failedCount,
          windowHours: failedBackups.windowHours,
        },
        lastSuccessfulAt: lastSuccessfulBackup?.createdAt ?? null,
        lastSuccessfulFilename: lastSuccessfulBackup?.filename ?? null,
        lastSuccessfulSizeBytes: lastSuccessfulBackup?.fileSizeBytes ?? null,
      },
      migrations: {
        state: migrations.state,
        determination: migrations.determination,
        summary: migrations.summary,
        detail: migrations.detail,
        shippedCount: migrations.shippedCount,
        appliedCount: migrations.appliedCount,
        pending: migrations.pending,
        rolledBack: migrations.rolledBack,
      },
      counts: {
        products: productCount,
        enquiries: enquiryCount,
        admins: adminCount,
        auditLogs: auditLogCount,
        festivals: festivalCount,
        mediaAssets: mediaCount,
        configHistories: historyCount,
      },
      security: {
        // Every value below is read from real system state; no posture is asserted.
        mfaAdoptionPercent,
        mfaEnabledAdmins: adminMfaCount,
        activeAdminSessions: activeSessionCount,
        adminsOnArgon2id: argon2idAdminCount,
        adminsTotal: adminCount,
        totalAuditRecords: auditLogCount,
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.round(uptimeSeconds),
        uptimeHuman: formatUptime(uptimeSeconds),
        memoryUsageMb: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1),
        serverTime: now.toISOString(),
      },
      recentOperationalEvents,
    };
  } catch (error: any) {
    console.error("Error gathering system health metrics:", error);
    return { error: "Failed to load system health metrics." };
  }
}
