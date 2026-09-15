import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";
import { PrivacySettingsClient } from "./PrivacySettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  return (
    <div className="space-y-12 max-w-2xl">
      <div className="border-b border-black/5 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your basic information, security, and privacy controls.</p>
      </div>

      <div className="space-y-10">
        
        {/* Personal Info */}
        <section>
          <h2 className="text-lg font-medium text-[var(--color-brand-900)] uppercase tracking-widest border-b border-black/5 pb-2 mb-6">Personal Information</h2>
          <SettingsForm user={{ name: dbUser?.name || session.user.name || "", email: session.user.email, phone: dbUser?.phone || "" }} />
        </section>

        {/* Security */}
        <section>
          <h2 className="text-lg font-medium text-[var(--color-brand-900)] uppercase tracking-widest border-b border-black/5 pb-2 mb-6">Security</h2>
          <div className="space-y-6 bg-white p-6 md:p-8 border border-black/5 shadow-sm">
            <div>
              <label className="block text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border border-black/10 p-3 text-black focus:outline-none focus:border-[var(--color-brand-900)] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border border-black/10 p-3 text-black focus:outline-none focus:border-[var(--color-brand-900)] bg-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-white border border-black/20 text-gray-700 font-medium uppercase tracking-widest text-sm hover:border-[var(--color-brand-900)] transition-colors">
              Change Password
            </button>
          </div>
        </section>

        {/* Privacy Controls & Data Management */}
        <section>
          <h2 className="text-lg font-medium text-[var(--color-brand-900)] uppercase tracking-widest border-b border-black/5 pb-2 mb-6">Privacy & Data Management</h2>
          <PrivacySettingsClient />
        </section>

      </div>
    </div>
  );
}
