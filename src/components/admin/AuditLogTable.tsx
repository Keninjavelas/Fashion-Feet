"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert, Clock, User, FileText, Search, Filter,
  CheckCircle2, AlertTriangle, Eye, X, Download, ShieldCheck
} from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: string | null;
  createdAt: any;
  admin?: { name: string; email: string } | null;
}

export function AuditLogTable({ initialLogs }: { initialLogs: AuditEntry[] }) {
  const [logs] = useState<AuditEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [inspectedLog, setInspectedLog] = useState<AuditEntry | null>(null);

  const categories = [
    { label: "All Events", value: "ALL" },
    { label: "Authentication & MFA", value: "AUTH" },
    { label: "Storefront & Sandbox", value: "STOREFRONT" },
    { label: "Seasonal Festivals", value: "FESTIVAL" },
    { label: "Products & Collections", value: "PRODUCT" },
    { label: "System & Backups", value: "SYSTEM" },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.admin?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.admin?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.metadata || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "ALL") return true;
      if (selectedCategory === "AUTH") {
        return log.action.includes("LOGIN") || log.action.includes("MFA") || log.action.includes("SESSION") || log.action.includes("ADMIN");
      }
      if (selectedCategory === "STOREFRONT") {
        return log.action.includes("PAGE") || log.action.includes("DRAFT") || log.action.includes("STOREFRONT") || log.action.includes("ROLLBACK");
      }
      if (selectedCategory === "FESTIVAL") {
        return log.action.includes("FESTIVAL");
      }
      if (selectedCategory === "PRODUCT") {
        return log.action.includes("PRODUCT") || log.action.includes("COLLECTION") || log.action.includes("CATEGORY");
      }
      if (selectedCategory === "SYSTEM") {
        return log.action.includes("BACKUP") || log.action.includes("RESTORE") || log.action.includes("SYSTEM") || log.action.includes("SETTINGS");
      }

      return true;
    });
  }, [logs, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A1538] block">
              Compliance & Security
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[9px] font-bold uppercase tracking-wider">
              Immutable Append-Only Log
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#8A1538]" /> Security & Administrative Audit Timeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically tracked audit events for authentications, role delegations, storefront publishing, rollback operations, and disaster recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Audit Records</span>
            <span className="font-mono text-base font-bold text-gray-900">{logs.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === c.value
                  ? "bg-[#8A1538] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#8A1538] font-sans"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Actor / Admin</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Metadata Preview</th>
                <th className="px-6 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredLogs.map((log) => {
                const isWarning = log.action.includes("FAILED") || log.action.includes("LOCKOUT") || log.action.includes("DELETED");
                const isSuccess = log.action.includes("PUBLISHED") || log.action.includes("ACTIVATED") || log.action.includes("RESTORED");

                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors font-mono">
                    <td className="px-6 py-3.5 text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
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
                        <span className="text-gray-400 text-[10px] block truncate max-w-[120px]">
                          {log.resourceId}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-[11px] text-gray-500 max-w-xs truncate">
                      {log.metadata || "-"}
                    </td>

                    <td className="px-6 py-3.5 text-right font-sans">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg transition-all"
                        title="Inspect Log Metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-xs">
              No audit log records match the selected filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Metadata Detail Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8A1538]" />
                <h3 className="font-serif font-bold text-lg text-gray-900">Audit Event Metadata Inspector</h3>
              </div>
              <button onClick={() => setInspectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Action</span>
                <span className="font-mono font-bold text-gray-900">{inspectedLog.action}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Timestamp</span>
                <span className="font-mono text-gray-700">{new Date(inspectedLog.createdAt).toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Actor</span>
                <span className="font-bold text-gray-900">{inspectedLog.admin?.name || "System"} ({inspectedLog.admin?.email || "internal"})</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Resource Target</span>
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

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
