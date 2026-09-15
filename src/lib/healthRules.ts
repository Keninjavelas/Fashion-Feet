/**
 * Operational health rule engine for the System Health console.
 *
 * Pure functions only — no I/O, no database access, no side effects. The caller
 * gathers real system state and passes it in. Keeping the thresholds here means
 * the approved operational rules live in exactly one place and are directly
 * checkable.
 */

export type HealthState = "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";

/**
 * Overall status precedence: CRITICAL > UNKNOWN > WARNING > HEALTHY.
 */
export const HEALTH_STATE_RANK: Record<HealthState, number> = {
  HEALTHY: 0,
  WARNING: 1,
  UNKNOWN: 2,
  CRITICAL: 3,
};

export const HEALTH_STATES: ReadonlyArray<HealthState> = [
  "HEALTHY",
  "WARNING",
  "CRITICAL",
  "UNKNOWN",
];

/** Backup freshness thresholds (hours). */
export const BACKUP_AGE_WARNING_HOURS = 24;
export const BACKUP_AGE_CRITICAL_HOURS = 48;

/** Failed-backup thresholds within the observation window. */
export const FAILED_BACKUP_WINDOW_HOURS = 24;
export const FAILED_BACKUP_WARNING_COUNT = 1;
export const FAILED_BACKUP_CRITICAL_COUNT = 2;

export interface HealthRuleResult {
  state: HealthState;
  /** Short label describing what was measured. */
  summary: string;
  /** Actionable operational detail explaining the state. */
  detail: string;
}

function isHealthState(value: unknown): value is HealthState {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(HEALTH_STATE_RANK, value)
  );
}

/**
 * Collapses many rule results into the single worst state using the required
 * precedence: CRITICAL > UNKNOWN > WARNING > HEALTHY.
 */
export function rollupStatus(
  states: ReadonlyArray<HealthState | null | undefined>
): HealthState {
  let worst: HealthState = "HEALTHY";
  for (const state of states) {
    if (!isHealthState(state)) continue;
    if (HEALTH_STATE_RANK[state] > HEALTH_STATE_RANK[worst]) {
      worst = state;
    }
  }
  return worst;
}

/** Human-readable uptime, derived from a raw second count (e.g. process.uptime()). */
export function formatUptime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "unknown";
  const seconds = Math.floor(totalSeconds);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

/** Human-readable age, derived from an hour count. */
export function formatAgeHours(ageHours: number | null): string {
  if (ageHours === null || !Number.isFinite(ageHours)) return "unknown";
  if (ageHours < 1) return `${Math.round(ageHours * 60)} min`;
  if (ageHours <= BACKUP_AGE_CRITICAL_HOURS) return `${ageHours.toFixed(1)}h`;
  return `${(ageHours / 24).toFixed(1)}d`;
}

/* -------------------------------------------------------------------------- */
/* Backup age                                                                  */
/* -------------------------------------------------------------------------- */

export interface BackupAgeInput {
  lastSuccessfulBackupAt?: Date | string | null;
  now?: Date;
}

export interface BackupAgeResult extends HealthRuleResult {
  ageHours: number | null;
}

/**
 * Backup age rules:
 *   < 24h            -> HEALTHY
 *   24h - 48h        -> WARNING
 *   > 48h            -> CRITICAL
 *   no valid backup  -> CRITICAL
 */
export function evaluateBackupAge(input: BackupAgeInput): BackupAgeResult {
  const now = input.now ?? new Date();
  const raw = input.lastSuccessfulBackupAt;

  if (raw === null || raw === undefined || raw === "") {
    return {
      state: "CRITICAL",
      ageHours: null,
      summary: "No valid backup",
      detail:
        "No successful database snapshot exists. Disaster-recovery coverage is absent — create a backup now.",
    };
  }

  const completedAt = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(completedAt.getTime())) {
    return {
      state: "CRITICAL",
      ageHours: null,
      summary: "No valid backup",
      detail:
        "The most recent successful backup has an uninterpretable timestamp, so backup coverage cannot be confirmed.",
    };
  }

  const rawAgeHours = (now.getTime() - completedAt.getTime()) / 3600000;
  const clockSkewed = rawAgeHours < 0;
  const ageHours = clockSkewed ? 0 : rawAgeHours;

  if (ageHours < BACKUP_AGE_WARNING_HOURS) {
    return {
      state: "HEALTHY",
      ageHours,
      summary: "Fresh backup",
      detail: clockSkewed
        ? "The most recent successful backup is timestamped in the future; treating it as current. Verify server clock synchronisation."
        : `Most recent successful backup is ${ageHours.toFixed(1)}h old, within the ${BACKUP_AGE_WARNING_HOURS}h threshold.`,
    };
  }

  if (ageHours <= BACKUP_AGE_CRITICAL_HOURS) {
    return {
      state: "WARNING",
      ageHours,
      summary: "Backup ageing",
      detail: `Most recent successful backup is ${ageHours.toFixed(1)}h old. The snapshot exceeds the ${BACKUP_AGE_WARNING_HOURS}h freshness target but is still inside the ${BACKUP_AGE_CRITICAL_HOURS}h limit — create a fresh backup.`,
    };
  }

  return {
    state: "CRITICAL",
    ageHours,
    summary: "Backup stale",
    detail: `Most recent successful backup is ${ageHours.toFixed(1)}h old, beyond the ${BACKUP_AGE_CRITICAL_HOURS}h maximum. Create a fresh snapshot immediately.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Failed backups                                                              */
/* -------------------------------------------------------------------------- */

export interface FailedBackupInput {
  failedCountLast24h: number;
  windowHours?: number;
}

export interface FailedBackupResult extends HealthRuleResult {
  failedCount: number;
  windowHours: number;
}

/**
 * Failed-backup rules within the observation window:
 *   0    -> HEALTHY
 *   1    -> WARNING
 *   >= 2 -> CRITICAL
 */
export function evaluateFailedBackups(input: FailedBackupInput): FailedBackupResult {
  const windowHours = input.windowHours ?? FAILED_BACKUP_WINDOW_HOURS;
  const failedCount = Number.isFinite(input.failedCountLast24h)
    ? Math.max(0, Math.trunc(input.failedCountLast24h))
    : 0;

  if (failedCount === 0) {
    return {
      state: "HEALTHY",
      failedCount,
      windowHours,
      summary: "No failures",
      detail: `No failed backup attempts recorded in the last ${windowHours}h.`,
    };
  }

  if (failedCount === FAILED_BACKUP_WARNING_COUNT) {
    return {
      state: "WARNING",
      failedCount,
      windowHours,
      summary: "1 failure",
      detail: `1 failed backup attempt in the last ${windowHours}h. Investigate before the next snapshot is taken.`,
    };
  }

  return {
    state: "CRITICAL",
    failedCount,
    windowHours,
    summary: `${failedCount} failures`,
    detail: `${failedCount} failed backup attempts in the last ${windowHours}h. Snapshot reliability is compromised — inspect the failure reasons and available disk space.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Migrations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * How confidently the deployed migration state could be compared against the
 * migrations shipped with this build.
 */
export type MigrationDetermination =
  | "DETERMINED"
  | "SHIPPED_UNREADABLE"
  | "TRACKING_TABLE_ABSENT";

export interface MigrationStateInput {
  determination: MigrationDetermination;
  shippedCount: number;
  appliedCount: number;
  /** Migrations shipped with the app that are not applied to the deployed database. */
  pending: ReadonlyArray<string>;
  /** Applied migrations marked as rolled back in the deployed database. */
  rolledBack?: ReadonlyArray<string>;
  detail?: string;
}

export interface MigrationStateResult extends HealthRuleResult {
  pending: string[];
  rolledBack: string[];
  shippedCount: number;
  appliedCount: number;
  determination: MigrationDetermination;
}

/**
 * Migration rules:
 *   shipped == applied            -> HEALTHY
 *   pending / unapplied shipped   -> WARNING
 *   shipped state unreadable      -> UNKNOWN
 *   tracking table absent         -> CRITICAL (shipped migrations exist) / UNKNOWN (none shipped)
 */
export function evaluateMigrationState(input: MigrationStateInput): MigrationStateResult {
  const pending = [...input.pending];
  const rolledBack = [...(input.rolledBack ?? [])];

  const base = {
    pending,
    rolledBack,
    shippedCount: input.shippedCount,
    appliedCount: input.appliedCount,
    determination: input.determination,
  };

  if (input.determination === "SHIPPED_UNREADABLE") {
    return {
      ...base,
      state: "UNKNOWN",
      summary: "Cannot determine",
      detail:
        input.detail ??
        "The migrations shipped with this build could not be read, so the deployed migration state cannot be compared. Verify that prisma/migrations is present in the deployment artifact.",
    };
  }

  if (input.determination === "TRACKING_TABLE_ABSENT") {
    const hasShipped = input.shippedCount > 0 || pending.length > 0;
    return {
      ...base,
      state: hasShipped ? "CRITICAL" : "UNKNOWN",
      summary: hasShipped ? "Schema not provisioned" : "Cannot determine",
      detail:
        input.detail ??
        (hasShipped
          ? `This build ships ${input.shippedCount} migration(s) but the deployed database has no migration tracking table, so the deployed schema cannot be reconciled with the shipped schema.`
          : "No migrations are shipped with this build and the deployed database has no migration tracking table, so migration state is indeterminate."),
    };
  }

  if (pending.length > 0) {
    return {
      ...base,
      state: "WARNING",
      summary: `${pending.length} pending`,
      detail: `${pending.length} of ${input.shippedCount} shipped migration(s) are not applied to the deployed database: ${pending.join(", ")}.`,
    };
  }

  if (rolledBack.length > 0) {
    return {
      ...base,
      state: "WARNING",
      summary: `${rolledBack.length} rolled back`,
      detail: `${rolledBack.length} applied migration(s) are marked rolled back in the deployed database: ${rolledBack.join(", ")}.`,
    };
  }

  return {
    ...base,
    state: "HEALTHY",
    summary: "Up to date",
    detail: `All ${input.shippedCount} shipped migration(s) are applied to the deployed database.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Database connectivity                                                       */
/* -------------------------------------------------------------------------- */

export function evaluateDatabaseConnectivity(
  connected: boolean,
  detail?: string
): HealthRuleResult {
  return connected
    ? {
        state: "HEALTHY",
        summary: "Connected",
        detail:
          detail ?? "The application can query the primary SQLite database.",
      }
    : {
        state: "CRITICAL",
        summary: "Unreachable",
        detail:
          detail ??
          "The application could not query the primary database. Operational metrics are unavailable.",
      };
}
