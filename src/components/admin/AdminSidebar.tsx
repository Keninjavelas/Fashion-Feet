"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sliders, Sparkles, ShoppingBag, FolderTree, Tags, Store,
  Inbox, Image as ImageIcon, Users, ShieldAlert, Activity, Settings,
  ShieldCheck, LogOut, X, CircleHelp,
} from "lucide-react";
import { adminLogout } from "@/app/actions/admin";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface AdminSidebarProps {
  currentRole: string;
  adminName: string;
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Storefront Studio", href: "/admin/editor", icon: Sliders },
      { name: "Seasonal Experiences", href: "/admin/festivals", icon: Sparkles },
    ],
  },
  {
    label: "Catalogue & customers",
    items: [
      { name: "Products", href: "/admin/products", icon: ShoppingBag },
      { name: "Collections", href: "/admin/collections", icon: FolderTree },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "FAQs", href: "/admin/faq", icon: CircleHelp },
      { name: "Store Locations", href: "/admin/stores", icon: Store },
      { name: "Customer Enquiries", href: "/admin/enquiries", icon: Inbox },
      { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Security & account",
    items: [
      { name: "System Health", href: "/admin/system-health", icon: Activity, superAdminOnly: true },
      { name: "Administrators", href: "/admin/administrators", icon: Users, superAdminOnly: true },
      { name: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert, superAdminOnly: true },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ currentRole, adminName, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Admin navigation"
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[calc(100vw-2.5rem)] shrink-0 flex-col border-r border-white/10 bg-[#1D0E14] text-[#FBF6ED] shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:w-64 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-5">
        <div className="min-w-0">
          <BrandLogo className="h-auto w-24 rounded-lg bg-white p-1" sizes="96px" eager />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#DBB772]">Fashion Feet</p>
          <h1 className="font-serif text-lg font-semibold leading-tight text-white">Admin workspace</h1>
        </div>
        <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#BBA9AD]">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                if ("superAdminOnly" in item && item.superAdminOnly && currentRole !== "SUPER_ADMIN") return null;
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                      active
                        ? "bg-[#8A1538] text-white shadow-[inset_0_0_0_1px_rgba(219,183,114,0.35)]"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#E8C684]" : "text-white/45"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 bg-black/15 p-4">
        <p className="truncate text-xs font-bold text-white">{adminName}</p>
        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#E8C684]">
          <ShieldCheck className="h-3.5 w-3.5" /> {currentRole.replace("_", " ")}
        </p>
        <button
          type="button"
          onClick={async () => { await adminLogout(); window.location.href = "/admin/login"; }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-white/75 hover:border-rose-300/30 hover:bg-rose-300/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
