"use client";

import { ExternalLink, LockKeyhole, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { STOREFRONT_ORIGIN } from "@/lib/contactDetails";

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
  role: string;
  mfaEnabled: boolean;
  onOpenMenu: () => void;
}

export function AdminHeader({ adminName, adminEmail, role, mfaEnabled, onOpenMenu }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-18 min-w-0 items-center justify-between gap-3 border-b border-[#3B2935] bg-[#160E17]/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="rounded-xl border border-[#4A3540] bg-[#261922] p-2.5 text-[#E8C684] hover:bg-[#38232F] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandLogo className="hidden h-10 w-auto rounded-md bg-white sm:block" sizes="64px" eager />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B776]">Fashion Feet</p>
          <h2 className="truncate font-serif text-base font-semibold text-[#F7F1E8] sm:text-lg">Admin workspace</h2>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span
          title={mfaEnabled ? "Authenticator MFA active" : "Authenticator MFA required"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-[11px] font-semibold sm:px-3 ${
            mfaEnabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
          }`}
        >
          {mfaEnabled ? <ShieldCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
          <span className="hidden sm:inline">{mfaEnabled ? "MFA active" : "MFA required"}</span>
        </span>
        <Link
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL || STOREFRONT_ORIGIN}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#4A3540] bg-[#261922] px-3 py-2 text-[11px] font-semibold text-[#E8C684] hover:bg-[#38232F]"
          title="Open customer storefront in a new tab"
        >
          <span className="hidden sm:inline">View storefront</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
        <span title={`${adminName} · ${adminEmail} · ${role.replace("_", " ")}`} className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#8A1538] font-serif text-sm font-bold text-white xl:inline-flex">
          {adminName.charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
