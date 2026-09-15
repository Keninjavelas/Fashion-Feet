"use client";

import { ShieldCheck, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
  role: string;
  mfaEnabled: boolean;
}

export function AdminHeader({ adminName, adminEmail, role, mfaEnabled }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm font-sans">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-lg font-bold text-gray-900">Fashion Feet Executive Console</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Isolated Admin App
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* MFA Status Indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
          mfaEnabled
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          <Lock className="w-3.5 h-3.5" />
          <span>{mfaEnabled ? "TOTP MFA Active" : "MFA Required"}</span>
        </div>

        {/* View Public Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border border-gray-200"
          title="Open Customer Storefront in New Tab"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
