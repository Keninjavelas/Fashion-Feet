import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function UnauthorizedPage() {
  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 md:p-12 border border-black/5 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-[var(--color-brand-900)] mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You do not have permission to view this page. This area is restricted to administrators only.
          </p>
          <Link 
            href="/" 
            className="block w-full py-3 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}
