import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Image as ImageIcon, Users, ShieldCheck, Activity, Server, Clock, Lock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const admin = await getAuthenticatedAdmin();

  const [publishedMedia, draftMedia, totalAdmins, mfaAdmins, recentAudits] = await Promise.all([
    prisma.mediaAsset.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
    prisma.mediaAsset.count({ where: { status: "DRAFT" } }).catch(() => 0),
    prisma.adminUser.count({ where: { suspended: false } }).catch(() => 0),
    prisma.adminUser.count({ where: { mfaEnabled: true, suspended: false } }).catch(() => 0),
    prisma.adminAuditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      // Only non-sensitive actor fields, so this stays safe if the rows are ever
      // handed to a client component.
      include: { admin: { select: { id: true, name: true, role: true } } }
    }).catch(() => [])
  ]);

  const mfaCoveragePercent = totalAdmins > 0 ? Math.round((mfaAdmins / totalAdmins) * 100) : 0;

  return (
    <AdminShell>
      <div className="space-y-8 font-sans">
        {/* Welcome Banner */}
        <div className="bg-[#12080C] text-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Phase A Executive Console Active
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {admin?.name}
            </h1>
            <p className="text-white/70 text-xs font-light leading-relaxed">
              Storefront V1 is frozen. Manage media assets, system administrators, and security audit logs from this isolated console.
            </p>
          </div>

          <div className="flex gap-3 relative z-10 shrink-0">
            <Link
              href="/admin/media"
              className="px-5 py-3 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow border border-[#D4AF37]/30 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Open Media Library
            </Link>
          </div>
        </div>

        {/* Real Statistics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs uppercase font-bold tracking-wider">Published Media</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-gray-900">{publishedMedia}</p>
            <p className="text-[11px] text-gray-500 font-medium">Assets active in storefront resolver</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs uppercase font-bold tracking-wider">Draft Media Assets</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-gray-900">{draftMedia}</p>
            <p className="text-[11px] text-gray-500 font-medium">Drafts pending publication</p>
          </div>

          <div className="bg-[#12080C] text-white p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-white/70">
              <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37]">Active Administrators</span>
              <div className="p-2 bg-white/10 text-[#D4AF37] rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-white">{totalAdmins}</p>
            <p className="text-[11px] text-white/70 font-medium">Authorized console users</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs uppercase font-bold tracking-wider">MFA Security Coverage</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-gray-900">{mfaCoveragePercent}%</p>
            <p className="text-[11px] text-gray-500 font-medium">{mfaAdmins} of {totalAdmins} admins TOTP active</p>
          </div>
        </div>

        {/* System Status & Recent Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">Recent Audit Activity</h3>
                <p className="text-xs text-gray-500">Append-only security log entries</p>
              </div>
              {admin?.role === "SUPER_ADMIN" && (
                <Link href="/admin/audit-log" className="text-xs font-bold uppercase tracking-wider text-[#8A1538] hover:underline">
                  View Full Log →
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {recentAudits.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No audit records recorded yet.</p>
              ) : (
                recentAudits.map((log) => (
                  <div key={log.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-gray-900">{log.action}</span>
                        <span className="text-gray-500 text-[11px] block">
                          Actor: {log.admin?.name || log.adminId || "System"} &bull; Resource: {log.resourceType}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-gray-900">System Architecture Status</h3>
              <p className="text-xs text-gray-500">Phase A Foundation Status</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                <Server className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Database Sync Active (`dev.db`)</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Storefront V1 Frozen & Separated</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mandatory TOTP MFA Engine Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
