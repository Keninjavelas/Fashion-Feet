"use client";

import { useState } from "react";
import {
  Activity, Database, ShieldCheck, Server, HardDrive, CheckCircle2,
  AlertCircle, RefreshCw, RotateCcw, Clock, ShieldAlert, FileCheck,
  Cpu, Loader2, ArrowUpRight, TriangleAlert, OctagonAlert, GitBranch,
  DatabaseBackup, History
} from "lucide-react";
import Link from "next/link";
import { createBackupAction, restoreBackupAction } from "@/app/actions/backup";
import { getSystemHealthMetrics } from "@/app/actions/systemHealth";
import { formatAgeHours, formatUptime, type HealthState } from "@/lib/healthRules";

interface SystemHealthProps {
  initialMetrics: any;
  initialBackups: any[];
  adminRole: string;
  adminName: string;
}

/** States are reported by the server; anything unrecognised is treated as UNKNOWN. */
function normalizeState(value: unknown): HealthState {
  return value === "HEALTHY" || value === "WARNING" || value === "CRITICAL" || value === "UNKNOWN"
    ? value
    : "UNKNOWN";
}

const STATE_BADGE: Record<HealthState, string> = {
  HEALTHY: "bg-emerald-50 border-emerald-300 text-emerald-800",
  WARNING: "bg-amber-50 border-amber-300 text-amber-800",
  CRITICAL: "bg-rose-50 border-rose-300 text-rose-800",
  UNKNOWN: "bg-slate-100 border-slate-300 text-slate-700",
};

const STATE_BADGE_DARK: Record<HealthState, string> = {
  HEALTHY: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300",
  WARNING: "bg-amber-500/15 border-amber-400/40 text-amber-300",
  CRITICAL: "bg-rose-500/15 border-rose-400/40 text-rose-300",
  UNKNOWN: "bg-slate-500/15 border-slate-400/40 text-slate-300",
};

const STATE_TEXT: Record<HealthState, string> = {
  HEALTHY: "text-emerald-600",
  WARNING: "text-amber-600",
  CRITICAL: "text-rose-600",
  UNKNOWN: "text-slate-500",
};

const STATE_HEADLINE: Record<HealthState, string> = {
  HEALTHY: "All monitored subsystems healthy",
  WARNING: "Degraded — attention required",
  CRITICAL: "Critical — immediate action required",
  UNKNOWN: "Indeterminate — health could not be fully determined",
};

function StateIcon({ state, className }: { state: HealthState; className?: string }) {
  if (state === "HEALTHY") return <CheckCircle2 className={className} />;
  if (state === "WARNING") return <TriangleAlert className={className} />;
  if (state === "CRITICAL") return <OctagonAlert className={className} />;
  return <AlertCircle className={className} />;
}

function StateBadge({ state, label }: { state: HealthState; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${STATE_BADGE[state]}`}
    >
      <StateIcon state={state} className="w-3 h-3" />
      {label ?? state}
    </span>
  );
}

/** Snapshot statuses map to the real BackupStatus enum: PENDING | VALID | FAILED | RESTORED | SAFEGUARD. */
function backupStatusClasses(status: string): string {
  switch (status) {
    case "VALID":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "RESTORED":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "SAFEGUARD":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

export function SystemHealthClient({
  initialMetrics,
  initialBackups,
  adminRole,
  adminName,
}: SystemHealthProps) {
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  const [backups, setBackups] = useState<any[]>(initialBackups);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  /** Re-reads authoritative health state from the server. */
  const reloadMetrics = async (): Promise<boolean> => {
    const res: any = await getSystemHealthMetrics();
    if (res && res.success) {
      setMetrics(res);
      return true;
    }
    return false;
  };

  const handleRefresh = async () => {
    setLoading(true);
    const ok = await reloadMetrics();
    setLoading(false);
    if (ok) {
      showFeedback("success", "System health metrics refreshed.");
    } else {
      showFeedback("error", "Failed to refresh system health metrics.");
    }
  };

  const handleCreateBackup = async () => {
    if (adminRole !== "SUPER_ADMIN") {
      alert("Unauthorized. Super Admin role required to create database backups.");
      return;
    }

    setBackupLoading(true);
    const res: any = await createBackupAction();
    setBackupLoading(false);

    if (res && res.error) {
      showFeedback("error", res.error);
      return;
    }

    if (res && res.backup) {
      setBackups((prev) => [res.backup, ...prev]);
      await reloadMetrics();
      showFeedback("success", `Database snapshot '${res.backup.filename}' created with SHA-256 integrity verification.`);
    }
  };

  const handleRestoreBackup = async (backup: any) => {
    if (adminRole !== "SUPER_ADMIN") {
      alert("Unauthorized. Super Admin role required to restore database snapshots.");
      return;
    }

    if (!confirm(`Are you sure you want to restore database snapshot '${backup.filename}'?\n\nAn automated pre-restore safeguard backup will be generated before restoration.`)) {
      return;
    }

    setRestoreLoadingId(backup.id);
    const res: any = await restoreBackupAction(backup.id);
    setRestoreLoadingId(null);

    if (res && res.error) {
      showFeedback("error", res.error);
    } else {
      await reloadMetrics();
      showFeedback("success", `Database successfully restored from '${backup.filename}'.`);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Real, server-computed state                                       */
  /* ---------------------------------------------------------------- */

  const overallState = normalizeState(metrics?.overall?.state);
  const overallRules: any[] = Array.isArray(metrics?.overall?.rules) ? metrics.overall.rules : [];
  const degradedRules = overallRules.filter((rule) => normalizeState(rule?.state) !== "HEALTHY");

  const databaseState = normalizeState(
    overallRules.find((rule) => rule?.key === "database")?.state ?? metrics?.database?.status
  );
  const backupFreshnessState = normalizeState(metrics?.backups?.freshness?.state);
  const failedBackupState = normalizeState(metrics?.backups?.failures?.state);
  const migrationState = normalizeState(metrics?.migrations?.state);

  const backupAgeHours: number | null =
    typeof metrics?.backups?.freshness?.ageHours === "number"
      ? metrics.backups.freshness.ageHours
      : null;

  const uptimeSeconds: number =
    typeof metrics?.runtime?.uptimeSeconds === "number" ? metrics.runtime.uptimeSeconds : 0;
  const uptimeLabel: string =
    typeof metrics?.runtime?.uptimeHuman === "string" && metrics.runtime.uptimeHuman.length > 0
      ? metrics.runtime.uptimeHuman
      : formatUptime(uptimeSeconds);

  const lastSuccessfulAt: string | null = metrics?.backups?.lastSuccessfulAt ?? null;
  const failedCount: number =
    typeof metrics?.backups?.failures?.count === "number" ? metrics.backups.failures.count : 0;
  const failedWindowHours: number =
    typeof metrics?.backups?.failures?.windowHours === "number" ? metrics.backups.failures.windowHours : 24;

  const pendingMigrations: string[] = Array.isArray(metrics?.migrations?.pending)
    ? metrics.migrations.pending
    : [];
  const recentEvents: any[] = Array.isArray(metrics?.recentOperationalEvents)
    ? metrics.recentOperationalEvents
    : [];

  const overallDetail = !metrics
    ? "Health metrics are unavailable. Refresh to retry the operational probes."
    : degradedRules.length === 0
      ? "Every monitored rule is within its operational threshold."
      : degradedRules.map((rule) => `${rule?.label ?? "Rule"}: ${rule?.detail ?? "state requires attention."}`).join(" ");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A1538] block">
              Phase E Enterprise Management
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${STATE_BADGE[overallState]}`}>
              {overallState}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight mt-1 flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#8A1538]" /> System Health & Disaster Recovery
          </h1>
          <p className="text-gray-600 text-xs mt-1 max-w-2xl">
            Live operational health derived from real backup, migration, database and runtime state — with SHA-256 verified
            snapshots and one-click disaster recovery controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-gray-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Metrics
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={backupLoading || adminRole !== "SUPER_ADMIN"}
            className="px-4 py-2 bg-[#8A1538] hover:bg-[#A81B45] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
          >
            {backupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-[#D4AF37]" />} Create DB Backup
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Overall Operational Status */}
      <div className="p-6 bg-gradient-to-r from-gray-900 via-black to-[#1A0B0E] rounded-3xl border border-white/10 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${STATE_BADGE_DARK[overallState]}`}>
                <StateIcon state={overallState} className="w-3 h-3" />
                {overallState}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wide text-white/50">
                Worst rule wins · CRITICAL &gt; UNKNOWN &gt; WARNING &gt; HEALTHY
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-3">
              <Server className="w-6 h-6 text-[#D4AF37]" /> {STATE_HEADLINE[overallState]}
            </h2>

            <p className="text-white/70 text-xs max-w-2xl leading-relaxed">{overallDetail}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {overallRules.map((rule: any) => {
                const ruleState = normalizeState(rule?.state);
                return (
                  <span
                    key={rule?.key ?? rule?.label}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${STATE_BADGE_DARK[ruleState]}`}
                  >
                    <StateIcon state={ruleState} className="w-3 h-3" />
                    {rule?.label}: {ruleState}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-white/50 uppercase font-bold block">DB Size</span>
              <span className="font-mono text-base font-bold text-white">{metrics?.database?.sizeMb || "0.00"} MB</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Snapshots</span>
              <span className="font-mono text-base font-bold text-[#D4AF37]">{metrics?.database?.totalBackups || 0}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Uptime</span>
              <span className="font-mono text-base font-bold text-white">{uptimeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Database Connectivity */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Database</span>
            <Database className={`w-5 h-5 ${STATE_TEXT[databaseState]}`} />
          </div>
          <div className="flex items-center justify-between">
            <StateBadge state={databaseState} />
            <span className="text-[11px] text-gray-500 font-mono">{metrics?.database?.sizeMb || "0.00"} MB</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            {overallRules.find((rule) => rule?.key === "database")?.detail ??
              "Primary SQLite database connectivity."}
          </p>
        </div>

        {/* Card 2: Backup Freshness */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Backup Freshness</span>
            <DatabaseBackup className={`w-5 h-5 ${STATE_TEXT[backupFreshnessState]}`} />
          </div>
          <div className="flex items-center justify-between">
            <StateBadge state={backupFreshnessState} />
            <span className="text-[11px] text-gray-500 font-mono">age {formatAgeHours(backupAgeHours)}</span>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">Last successful</span>
              <span className="font-mono font-bold text-gray-900 text-right">
                {lastSuccessfulAt ? new Date(lastSuccessfulAt).toLocaleString("en-IN") : "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">Snapshot</span>
              <span className="font-mono text-gray-900 truncate" title={metrics?.backups?.lastSuccessfulFilename ?? undefined}>
                {metrics?.backups?.lastSuccessfulFilename ?? "—"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {metrics?.backups?.freshness?.detail ?? "No successful backup snapshot recorded."}
          </p>
        </div>

        {/* Card 3: Failed Backups */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failed Backups</span>
            <StateIcon state={failedBackupState} className={`w-5 h-5 ${STATE_TEXT[failedBackupState]}`} />
          </div>
          <div className="flex items-center justify-between">
            <StateBadge state={failedBackupState} />
            <span className="text-[11px] text-gray-500 font-mono">last {failedWindowHours}h</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
            <span className="text-gray-500">Failed attempts</span>
            <span className={`font-mono font-bold ${STATE_TEXT[failedBackupState]}`}>{failedCount}</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {metrics?.backups?.failures?.detail ?? "No failed backup attempts recorded."}
          </p>
        </div>

        {/* Card 4: Migration State */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Migrations</span>
            <GitBranch className={`w-5 h-5 ${STATE_TEXT[migrationState]}`} />
          </div>
          <div className="flex items-center justify-between">
            <StateBadge state={migrationState} />
            <span className="text-[11px] text-gray-500 font-mono">
              {metrics?.migrations?.appliedCount ?? 0}/{metrics?.migrations?.shippedCount ?? 0}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">Determination</span>
              <span className="font-mono text-gray-900">{metrics?.migrations?.determination ?? "UNKNOWN"}</span>
            </div>
            {pendingMigrations.length > 0 && (
              <div className="text-amber-700 font-mono break-words">pending: {pendingMigrations.join(", ")}</div>
            )}
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {metrics?.migrations?.detail ?? "Migration state could not be determined."}
          </p>
        </div>
      </div>

      {/* Runtime / Security / Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Runtime & Uptime</span>
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 font-mono">{metrics?.runtime?.nodeVersion || "Node.js"}</div>
            <span className="text-[11px] text-gray-500 block mt-0.5">
              Heap {metrics?.runtime?.memoryUsageMb || "0"} MB · {metrics?.runtime?.platform || "—"}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> process.uptime()</span>
            <span className="font-mono font-bold text-gray-900">{uptimeLabel} ({uptimeSeconds}s)</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Security Posture</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">MFA adoption</span>
              <span className="font-mono font-bold text-gray-900">
                {metrics?.security?.mfaAdoptionPercent ?? 0}% ({metrics?.security?.mfaEnabledAdmins ?? 0}/{metrics?.security?.adminsTotal ?? 0})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Active admin sessions</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.security?.activeAdminSessions ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Argon2id password hashes</span>
              <span className="font-mono font-bold text-gray-900">
                {metrics?.security?.adminsOnArgon2id ?? 0}/{metrics?.security?.adminsTotal ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Audit records</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.security?.totalAuditRecords ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Inventory</span>
            <FileCheck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Products</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.counts?.products ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Customer enquiries</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.counts?.enquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Audit records</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.counts?.auditLogs ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Snapshot records</span>
              <span className="font-mono font-bold text-gray-900">{metrics?.database?.totalBackups ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Breakdown */}
      {overallRules.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#8A1538]" /> Operational Health Rules
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Each rule is evaluated against live system state. Overall status is the worst state across all rules.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {overallRules.map((rule: any) => {
              const ruleState = normalizeState(rule?.state);
              return (
                <div key={rule?.key ?? rule?.label} className="py-3.5 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="sm:w-56 shrink-0 flex items-center gap-2">
                    <StateBadge state={ruleState} />
                    <span className="text-xs font-bold text-gray-800">{rule?.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed flex-1">{rule?.detail}</p>
                  <span className={`text-[10px] font-mono uppercase font-bold ${STATE_TEXT[ruleState]}`}>{rule?.summary}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[10px] text-gray-400 font-mono">
            Evaluated at {metrics?.generatedAt ? new Date(metrics.generatedAt).toLocaleString("en-IN") : "—"}
          </div>
        </div>
      )}

      {/* Database Backup & Disaster Recovery Snapshots */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#8A1538]" /> Database Snapshots & Disaster Recovery Archive
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Atomic point-in-time snapshots with cryptographic SHA-256 checksum verification and pre-restore recovery safeguards.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={backupLoading || adminRole !== "SUPER_ADMIN"}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            {backupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DatabaseBackup className="w-3.5 h-3.5 text-[#D4AF37]" />} Create Snapshot Now
          </button>
        </div>

        {/* Backups List Table */}
        <div className="overflow-x-auto">
          {backups.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <Database className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-bold">No database backup snapshots recorded yet.</p>
              <p className="text-[11px] text-gray-400">Click &quot;Create Snapshot Now&quot; above to capture a point-in-time SQLite archive.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Snapshot Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">SHA-256 Checksum</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors font-mono">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-[#8A1538]" /> {b.filename}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {(b.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]" title={b.checksumSha256}>
                        {b.checksumSha256.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${backupStatusClasses(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(b.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => handleRestoreBackup(b)}
                        disabled={restoreLoadingId === b.id || adminRole !== "SUPER_ADMIN"}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1 disabled:opacity-40"
                      >
                        {restoreLoadingId === b.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Operational Events + Runbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#8A1538]" /> Recent Operational Events
          </h4>
          {recentEvents.length === 0 ? (
            <p className="text-xs text-gray-500">No administrative audit events recorded.</p>
          ) : (
            <ul className="space-y-2.5">
              {recentEvents.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 text-xs border-b border-gray-50 pb-2 last:border-0">
                  <div className="min-w-0">
                    <span className="font-bold text-gray-800 block truncate">{event.action}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {event.resourceType}
                      {event.actorName ? ` · ${event.actorName}` : ""}
                      {event.actorRole ? ` (${event.actorRole})` : ""}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    {event.createdAt ? new Date(event.createdAt).toLocaleString("en-IN") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-gray-400">
            Sanitized operational view — sensitive audit metadata fields are never exposed here.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" /> Operational Runbooks & Audit History
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Review the full administrative timeline history or inspect version snapshots of the storefront.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/admin/audit-log"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-1 justify-center border border-gray-200"
            >
              Audit Log Timeline <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/editor"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-1 justify-center border border-gray-200"
            >
              Storefront Studio <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
