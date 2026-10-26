"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { changeAdminPassword } from "@/app/actions/admin";

export function AdminPasswordForm() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await changeAdminPassword(new FormData(event.currentTarget));
      if (result.success) {
        window.location.replace("/admin/login?passwordChanged=1");
        return;
      }
      setError(result.error || "Password could not be changed. Try again.");
    } catch {
      setError("Password could not be changed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClassName = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#8A1538]";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="change-admin-password-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="change-admin-password-title" className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900">
            <KeyRound className="h-5 w-5 text-[#8A1538]" /> Change password
          </h2>
          <p className="mt-1 text-xs text-gray-500">Enter your current password. Changing it signs out every admin session, including this one.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPasswords((visible) => !visible)}
          aria-pressed={showPasswords}
          className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 text-xs font-semibold text-[#8A1538] hover:bg-rose-50"
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPasswords ? "Hide passwords" : "Show passwords"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid max-w-xl gap-4">
        <div>
          <label htmlFor="admin-current-password" className="mb-1 block text-xs font-semibold text-gray-700">Current password</label>
          <input id="admin-current-password" name="currentPassword" type={showPasswords ? "text" : "password"} autoComplete="current-password" required className={inputClassName} />
        </div>
        <div>
          <label htmlFor="admin-new-password" className="mb-1 block text-xs font-semibold text-gray-700">New password</label>
          <input id="admin-new-password" name="newPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={16} maxLength={128} required className={inputClassName} />
          <p className="mt-1 text-xs text-gray-500">Use at least 16 characters.</p>
        </div>
        <div>
          <label htmlFor="admin-confirm-password" className="mb-1 block text-xs font-semibold text-gray-700">Confirm new password</label>
          <input id="admin-confirm-password" name="confirmPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={16} maxLength={128} required className={inputClassName} />
        </div>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}

        <button type="submit" disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#8A1538] px-5 py-3 text-xs font-bold text-white hover:bg-[#A81B45] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Change password
        </button>
      </form>
    </section>
  );
}
