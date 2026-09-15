"use client";

import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { revokeSessionAction } from "@/app/actions/admin";

interface ActiveSession {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: any;
  lastActiveAt: any;
}

export function ActiveSessionsView({ initialSessions, currentAdminEmail }: { initialSessions: ActiveSession[]; currentAdminEmail: string }) {
  const handleRevoke = async (token: string) => {
    if (!confirm("Revoke this active session? The administrator will be logged out.")) return;
    await revokeSessionAction(token);
    window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Admin Settings & Active Sessions</h1>
        <p className="text-xs text-gray-500">View active login sessions for <strong className="text-gray-900 font-mono">{currentAdminEmail}</strong> and revoke unneeded devices.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900">Active Sessions Log</h3>

        <div className="space-y-3">
          {initialSessions.map((session) => (
            <div key={session.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm text-[#8A1538]">
                  {session.userAgent?.toLowerCase().includes("mobile") ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-bold text-gray-900 block truncate max-w-xs">{session.userAgent || "Unknown Device"}</span>
                  <span className="text-gray-500 font-mono text-[11px]">
                    IP: {session.ipAddress || "Internal"} &bull; Logged in: {new Date(session.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-gray-400">
                  Last active: {new Date(session.lastActiveAt).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => handleRevoke(session.token)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-rose-200 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
