"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck, Lock, RotateCcw, UserX, UserCheck, Loader2 } from "lucide-react";
import { inviteAdminUser, toggleSuspendAdmin, resetAdminMfa } from "@/app/actions/admin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  suspended: boolean;
  lastLoginAt?: any;
}

export function AdminUserTable({ initialAdmins }: { initialAdmins: AdminUser[] }) {
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await inviteAdminUser(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      alert(`Admin invited successfully! Email: ${res.newAdmin?.email}, Password: ${res.tempPassword}`);
      setIsInviting(false);
      window.location.reload();
    }
  };

  const handleToggleSuspend = async (adminId: string) => {
    if (!confirm("Are you sure you want to change this administrator's suspension status?")) return;
    const res = await toggleSuspendAdmin(adminId);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleResetMfa = async (adminId: string) => {
    if (!confirm("Are you sure you want to reset TOTP MFA for this administrator? They will be required to re-enroll MFA on next login.")) return;
    const res = await resetAdminMfa(adminId);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Administrator Management</h1>
          <p className="text-xs text-gray-500">SUPER_ADMIN RBAC Console: Invite administrators, enforce MFA, and manage access</p>
        </div>

        <button
          onClick={() => setIsInviting(true)}
          className="px-5 py-3 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#D4AF37]/30 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-[#D4AF37]" /> Invite Administrator
        </button>
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-5">
            <h3 className="font-serif text-2xl font-bold">Invite Administrator</h3>
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs">{error}</div>}

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Artisan Manager"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="manager@fashionfeet.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Role Assignment</label>
                <select
                  name="role"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] font-medium"
                >
                  <option value="CONTENT_MANAGER">CONTENT_MANAGER (Media & Dashboard)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Management)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Initial Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter initial password for invitee"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviting(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#8A1538] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">Administrator</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">MFA Status</th>
              <th className="px-6 py-4">Account Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {initialAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 block">{admin.name}</span>
                  <span className="text-gray-500 font-mono text-[11px]">{admin.email}</span>
                </td>

                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-100">
                    {admin.role.replace("_", " ")}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-1 ${
                    admin.mfaEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    <Lock className="w-3 h-3" /> {admin.mfaEnabled ? "TOTP Active" : "Pending Enrollment"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    admin.suspended ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {admin.suspended ? "SUSPENDED" : "ACTIVE"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleResetMfa(admin.id)}
                    className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Reset TOTP MFA"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleSuspend(admin.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      admin.suspended ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
                    }`}
                    title={admin.suspended ? "Unsuspend Admin" : "Suspend Admin"}
                  >
                    {admin.suspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
