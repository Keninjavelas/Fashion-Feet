"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateSettings } from "../actions";

export function SettingsForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSettings(formData);
    setIsSaving(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 border border-black/5 shadow-sm relative">
      {success && (
        <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-4 py-2 text-sm flex items-center gap-2 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" /> Information updated
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
        <input 
          type="text" 
          name="name"
          defaultValue={user.name}
          className="w-full border border-black/10 p-3 text-black focus:outline-none focus:border-[var(--color-brand-900)] bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
        <input 
          type="email" 
          name="email"
          defaultValue={user.email}
          className="w-full border border-black/10 p-3 text-black focus:outline-none focus:border-[var(--color-brand-900)] bg-transparent opacity-60"
          readOnly // Better to not allow email change without verification in real app
        />
      </div>
      <div>
        <label className="block text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
        <input 
          type="tel" 
          name="phone"
          defaultValue={user.phone}
          placeholder="Optional"
          className="w-full border border-black/10 p-3 text-black focus:outline-none focus:border-[var(--color-brand-900)] bg-transparent"
        />
      </div>
      <button type="submit" disabled={isSaving} className="px-6 py-3 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest text-sm hover:bg-[var(--color-accent-gold)] transition-colors disabled:opacity-70 min-w-[200px]">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Information"}
      </button>
    </form>
  );
}
