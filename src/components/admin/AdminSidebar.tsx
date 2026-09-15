"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Sparkles,
  ShoppingBag,
  FolderTree,
  Tags,
  Store,
  Inbox,
  Image as ImageIcon,
  Users,
  ShieldAlert,
  Activity,
  Settings,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { adminLogout } from "@/app/actions/admin";

interface AdminSidebarProps {
  currentRole: string;
  adminName: string;
}

export function AdminSidebar({ currentRole, adminName }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Storefront Studio", href: "/admin/editor", icon: Sliders },
    { name: "Seasonal Experiences", href: "/admin/festivals", icon: Sparkles },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Collections", href: "/admin/collections", icon: FolderTree },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Store Locations", href: "/admin/stores", icon: Store },
    { name: "Customer Enquiries", href: "/admin/enquiries", icon: Inbox },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "System Health", href: "/admin/system-health", icon: Activity, superAdminOnly: true },
    { name: "Administrators", href: "/admin/administrators", icon: Users, superAdminOnly: true },
    { name: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert, superAdminOnly: true },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#12080C] text-[#F6F2EB] flex flex-col justify-between border-r border-[#D4AF37]/20 min-h-screen shrink-0 font-sans z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">Management Console</span>
            <h1 className="font-serif text-xl font-bold text-white tracking-tight">Fashion Feet Admin</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            if (item.superAdminOnly && currentRole !== "SUPER_ADMIN") return null;

            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#8A1538] text-white shadow-md border border-[#D4AF37]/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-white/60"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 overflow-hidden">
            <span className="font-bold text-xs text-white truncate block">{adminName}</span>
            <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {currentRole.replace("_", " ")}
            </span>
          </div>
        </div>

        <button
          onClick={async () => { await adminLogout(); window.location.href = "/admin/login"; }}
          className="w-full py-2 px-3 bg-white/5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
