import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function CartPage() {
  return (
    <StorefrontLayout>
      <section className="mx-auto flex min-h-[650px] max-w-5xl flex-col justify-center px-6 pb-24 pt-36 text-[var(--theme-color-text)] md:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-color-accent)]">Fashion Feet catalogue</p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">Find a pair you love, then ask us about it.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--theme-color-text-muted)]">Online checkout is not available yet. Browse the photographed designs, note the design name, and contact Fashion Feet for current prices, sizes, and availability.</p>
        <div className="mt-9 flex flex-wrap gap-4"><Link href="/women" className="inline-flex min-h-12 items-center gap-2 bg-[var(--theme-color-jewel)] px-6 text-sm font-semibold text-white">Browse designs <ArrowRight className="h-4 w-4" /></Link><Link href="/contact" className="inline-flex min-h-12 items-center border border-[var(--theme-color-border)] px-6 text-sm font-semibold">Contact Fashion Feet</Link></div>
      </section>
    </StorefrontLayout>
  );
}
