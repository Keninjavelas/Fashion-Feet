// src/components/admin/AuditTimeline.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, X, Download, Eye, ShieldAlert } from "lucide-react";
import { sanitizeAuditRecord } from "@/lib/auditSanitizer";
import { formatAdminDateTime } from "@/lib/adminDate";

interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: string | null;
  createdAt: string; // ISO string from server
  admin?: { name: string; email: string } | null;
}

export function AuditTimeline() {
  // filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [adminId, setAdminId] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inspectedLog, setInspectedLog] = useState<AuditEntry | null>(null);

  // fetch logs whenever filters or page change
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("action", searchQuery);
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      if (adminId) params.append("adminId", adminId);
      if (actionFilter) params.append("action", actionFilter);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      setLogs(data.records);
      setTotal(data.total);
      setLoading(false);
    };
    fetchLogs();
  }, [searchQuery, startDate, endDate, adminId, actionFilter, page]);

  const totalPages = Math.ceil(total / pageSize);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setAdminId("");
    setActionFilter("");
    setPage(1);
  };

  // Export functions (CSV / JSON) – simple download of current filtered data
  const exportData = async (format: "csv" | "json") => {
    const params = new URLSearchParams({
      page: "1",
      pageSize: total.toString(), // export all
    });
    if (searchQuery) params.append("action", searchQuery);
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (adminId) params.append("adminId", adminId);
    if (actionFilter) params.append("action", actionFilter);

    const res = await fetch(`/api/admin/audit?${params.toString()}`);
    const data = await res.json();
    const rows = data.records as AuditEntry[];
    let blob: Blob;
    if (format === "json") {
      blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    } else {
      // CSV generation – simple flat representation
      const header = ["id", "createdAt", "action", "resourceType", "resourceId", "adminName", "adminEmail", "metadata"].join(",");
      const csvRows = rows.map((r) =>
        [
          r.id,
          r.createdAt,
          r.action,
          r.resourceType,
          r.resourceId ?? "",
          r.admin?.name ?? "",
          r.admin?.email ?? "",
          `"${(r.metadata ?? "").replace(/"/g, "" )}"`,
        ].join(",")
      );
      const csvContent = [header, ...csvRows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split("T")[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#8A1538]" /> Audit Timeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Secure, immutable log of administrative actions.
          </p>
        </div>
        <div className="text-right px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Records</span>
          <span className="font-mono text-base font-bold text-gray-900">{total}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
            placeholder="Start"
          />
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
            placeholder="End"
          />
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
        {/* Admin filter – simple text input for admin ID/email */}
        <input
          type="text"
          placeholder="Admin ID / Email"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs"
        />
        {/* Action filter */}
        <input
          type="text"
          placeholder="Action keyword"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs"
        />
        {/* Search (fallback) */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Full‑text search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#8A1538]"
          />
        </div>
        <button
          onClick={clearFilters}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs hover:bg-gray-200"
        >
          Clear Filters
        </button>
        <button
          onClick={() => exportData("csv")}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs hover:bg-gray-200"
        >
          <Download className="w-3 h-3" /> CSV
        </button>
        <button
          onClick={() => exportData("json")}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs hover:bg-gray-200"
        >
          <Download className="w-3 h-3" /> JSON
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading…</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Actor / Admin</th>
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-6 py-3.5">Metadata</th>
                  <th className="px-6 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {logs.map((log) => {
                  const isWarning = /FAILED|LOCKOUT|DELETED/.test(log.action);
                  const isSuccess = /PUBLISHED|ACTIVATED|RESTORED/.test(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors font-mono">
                      <td className="px-6 py-3.5 text-[11px] text-gray-500 whitespace-nowrap">
                        {formatAdminDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                            isWarning
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isSuccess
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-[#8A1538]/10 text-[#8A1538] border-[#8A1538]/20"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-sans">
                        <span className="font-bold text-gray-900 block text-xs">{log.admin?.name || "System"}</span>
                        <span className="text-gray-400 font-mono text-[10px]">{log.admin?.email || "automated"}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-gray-800 text-xs">{log.resourceType}</span>
                        {log.resourceId && (
                          <span className="text-gray-400 text-[10px] block truncate max-w-[120px]">{log.resourceId}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-[11px] text-gray-500 max-w-xs truncate">
                        {log.metadata || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setInspectedLog(log)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                          title="Inspect"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {logs.length === 0 && !loading && (
            <p className="p-8 text-center text-gray-500">No records match the current filters.</p>
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-gray-600">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Inspector Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">Audit Event Details</h3>
              <button onClick={() => setInspectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Action</span>
                <span className="font-mono font-bold text-gray-900">{inspectedLog.action}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Timestamp</span>
                <span className="font-mono text-gray-700">{formatAdminDateTime(inspectedLog.createdAt)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Actor</span>
                <span className="font-bold text-gray-900">{inspectedLog.admin?.name || "System"} ({inspectedLog.admin?.email || "internal"})</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Resource</span>
                <span className="font-mono text-gray-900">{inspectedLog.resourceType} : {inspectedLog.resourceId || "global"}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">JSON Payload</span>
              <pre className="p-4 bg-gray-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(inspectedLog.metadata || "{}"), null, 2);
                  } catch {
                    return inspectedLog.metadata || "{ \"empty\": true }";
                  }
                })()}
              </pre>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => setInspectedLog(null)} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
