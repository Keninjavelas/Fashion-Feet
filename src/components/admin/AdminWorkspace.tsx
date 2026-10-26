"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface AdminWorkspaceProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  role: string;
  mfaEnabled: boolean;
}

export function AdminWorkspace({ children, adminName, adminEmail, role, mfaEnabled }: AdminWorkspaceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="admin-workspace relative flex min-h-screen min-w-0 bg-[#0E090F] font-sans text-[#F7F1E8]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#1D0B11]/65 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <AdminSidebar
        currentRole={role}
        adminName={adminName}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          adminName={adminName}
          adminEmail={adminEmail}
          role={role}
          mfaEnabled={mfaEnabled}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main id="admin-main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
