import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";
import { readdir } from "fs/promises";
import {
  evaluateBackupAge,
  evaluateDatabaseConnectivity,
  evaluateFailedBackups,
  evaluateMigrationState,
  rollupStatus,
  FAILED_BACKUP_WINDOW_HOURS,
  type HealthState,
  type MigrationStateResult,
} from "@/lib/healthRules";

type Status = HealthState;

interface HealthMetric<T = any> {
  status: Status;
  value: T;
  details?: string;
}

interface HealthResponse {
  overall: Status;
  db: HealthMetric<boolean>;
  dbSize: HealthMetric<number | null>;
  migrations: HealthMetric<number>; // pending count
  uptime: HealthMetric<number>;
  backup: HealthMetric<string | null>;
  backupAge: HealthMetric<number | null>; // hours
  recentFailedBackups: HealthMetric<number>;
  recentCriticalEvents: HealthMetric<Array<{ timestamp: string; action: string; adminId?: string; adminName?: string }>>;
}

const managedPostgres = /^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "");
const MIGRATIONS_DIR = path.resolve(process.cwd(), "../..", "prisma", managedPostgres ? "postgres/migrations" : "migrations");

/** Migrations shipped with this build, read from the artifact on disk. */
async function readShippedMigrationNames(): Promise<{ readable: boolean; names: string[] }> {
  try {
    const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
    const names = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => fs.existsSync(path.join(MIGRATIONS_DIR, name, "migration.sql")))
      .sort();
    return { readable: true, names };
  } catch {
    return { readable: false, names: [] };
  }
}

/** Applied migrations as recorded by the deployed database. */
async function readDeployedMigrationState(): Promise<{
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

export async function GET() {
  // Operational health details are for Super Admins only.
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: admin ? 403 : 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date();

  // 1. DB connectivity
  let dbOk = false;
  let dbDetail: string | undefined;
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    dbOk = true;
  } catch (err) {
    dbDetail = `Primary database probe failed: ${
      err instanceof Error ? err.message : "unknown error"
    }`;
  }
  const connectivity = evaluateDatabaseConnectivity(dbOk, dbDetail);

  // 2. Database size. A missing measurement is unknown, not a zero-byte database.
  let dbSize: number | null = null;
  try {
    if (managedPostgres) {
      const rows = await prisma.$queryRawUnsafe<Array<{ size_bytes: string }>>(
        "SELECT pg_database_size(current_database())::text AS size_bytes"
      );
      const reportedSize = Number(rows[0]?.size_bytes);
      if (Number.isFinite(reportedSize) && reportedSize >= 0) dbSize = reportedSize;
    } else {
      const dbPath = path.join(process.cwd(), "dev.db");
      if (fs.existsSync(dbPath)) dbSize = fs.statSync(dbPath).size;
    }
  } catch {
    dbSize = null;
  }

  // 3. Migrations — shipped (on disk) vs applied (deployed database)
  const migrationState = compareMigrations(
    await readShippedMigrationNames(),
    await readDeployedMigrationState()
  );

  // 4. Uptime (seconds)
  const uptimeSec = Math.round(process.uptime());

  // 5. Backup freshness — only a successfully verified snapshot counts.
  const lastValidBackup = await prisma.systemBackup
    .findFirst({ where: { status: "VALID" }, orderBy: { createdAt: "desc" } })
    .catch(() => null);
  const backupAge = evaluateBackupAge({
    lastSuccessfulBackupAt: lastValidBackup?.createdAt ?? null,
    now,
  });

  // 6. Failed backups within the observation window
  const failedSince = new Date(now.getTime() - FAILED_BACKUP_WINDOW_HOURS * 60 * 60 * 1000);
  const recentFailed = await prisma.systemBackup
    .count({ where: { status: "FAILED", createdAt: { gte: failedSince } } })
    .catch(() => 0);
  const failedBackups = evaluateFailedBackups({ failedCountLast24h: recentFailed });

  // 7. Recent administrative events (identifiers only; no raw audit metadata)
  const criticalEventsRaw = await prisma.adminAuditLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        createdAt: true,
        action: true,
        adminId: true,
        admin: { select: { name: true } },
      },
    })
    .catch(() => []);
  const criticalEvents = criticalEventsRaw.map((e: any) => ({
    timestamp: e.createdAt.toISOString(),
    action: e.action,
    adminId: e.adminId ?? undefined,
    adminName: e.admin?.name ?? undefined,
  }));

  // Overall status is the worst of the real operational rules only, using the
  // shared precedence: CRITICAL > UNKNOWN > WARNING > HEALTHY.
  const overall = rollupStatus(managedPostgres
    ? [connectivity.state, migrationState.state]
    : [connectivity.state, backupAge.state, failedBackups.state, migrationState.state]);

  const metrics: HealthResponse = {
    overall,
    db: { status: connectivity.state, value: dbOk, details: connectivity.detail },
    dbSize: { status: dbSize === null ? "UNKNOWN" : connectivity.state, value: dbSize,
      details: dbSize === null ? "Database size could not be measured." : undefined },
    migrations: {
      status: migrationState.state,
      value: migrationState.pending.length,
      details: migrationState.detail,
    },
    uptime: { status: "HEALTHY", value: uptimeSec },
    backup: {
      status: managedPostgres ? "UNKNOWN" : backupAge.state,
      value: managedPostgres ? null : lastValidBackup?.filename ?? null,
      details: managedPostgres ? "Backups are managed by the PostgreSQL provider." : backupAge.detail,
    },
    backupAge: {
      status: managedPostgres ? "UNKNOWN" : backupAge.state,
      value: managedPostgres ? null : backupAge.ageHours,
      details: managedPostgres ? "Backup freshness is not observable from this application." : backupAge.detail,
    },
    recentFailedBackups: {
      status: managedPostgres ? "UNKNOWN" : failedBackups.state,
      value: recentFailed,
      details: managedPostgres ? "Provider backup failures are not observable from this application." : failedBackups.detail,
    },
    recentCriticalEvents: { status: "HEALTHY", value: criticalEvents },
  };

  return new Response(JSON.stringify(metrics), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
