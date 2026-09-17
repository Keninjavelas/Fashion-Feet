import Link from "next/link";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ArrowLeft, Compass } from "lucide-react";

/**
 * Single source of truth for the storefront 404 experience.
 *
 * It is rendered by the root `not-found.tsx` boundary (unmatched routes) and by
 * any page that can detect a missing resource itself, so that both cases show
 * exactly the same styled shell: navigation, heading, copy and footer.
 */
export function StorefrontNotFound() {
  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] pt-32 pb-24 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] rounded-full flex items-center justify-center mx-auto border border-[var(--theme-color-border)] shadow-xl">
            <Compass className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--theme-color-accent)]">Page Not Found &bull; 404</span>
            <h1 className="font-serif text-4xl font-bold text-[var(--theme-color-text)]">Uncharted Route</h1>
            <p className="text-[var(--theme-color-text-muted)] text-sm leading-relaxed">
              The page or collection route you are attempting to reach does not exist or has been moved.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg border border-[var(--theme-color-border)]"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Storefront Home
            </Link>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
