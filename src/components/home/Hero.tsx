import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_TAGLINE } from "@/lib/branding";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";

const ARCHIVE_HERO = "/catalogue/women/studio/ceremonial-v2/02.png";

export function Hero({
  section,
  fallbackImage,
  hasPublishedProducts = false,
}: {
  section?: StorefrontSection;
  fallbackImage?: string;
  hasPublishedProducts?: boolean;
}) {
  const suppliedImage = section?.image && section.image !== PLACEHOLDER_HOMEPAGE_IMAGE
    ? section.image
    : fallbackImage && fallbackImage !== PLACEHOLDER_HOMEPAGE_IMAGE ? fallbackImage : undefined;
  const primaryHref = !hasPublishedProducts && (!section?.ctaLink || section.ctaLink === "/shop")
    ? "/women"
    : section?.ctaLink || "/shop";

  return (
    <section className="relative isolate overflow-hidden bg-[var(--theme-color-bg)] text-[var(--theme-color-text)]">
      <div className="mx-auto grid min-h-[680px] max-w-[1600px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col justify-center px-6 pb-14 pt-36 sm:px-12 lg:px-16 lg:pb-20 lg:pt-28">
          <div className="mb-8 h-px w-16 bg-[var(--theme-color-accent)]" aria-hidden="true" />
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--theme-color-accent)]">
            {section?.badge || BRAND_TAGLINE}
          </p>
          <h1 className="max-w-[12ch] font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
            {section?.title || "Punjabi Juttis, Beautifully Made"}
          </h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-[var(--theme-color-text-muted)] sm:text-lg">
            {section?.subtitle || "Discover Fashion Feet designs for everyday moments, celebrations, and ceremonies."}
          </p>
          {section?.description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--theme-color-text-muted)]">{section.description}</p>}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={primaryHref} className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-[var(--theme-color-jewel)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90">
              {section?.ctaText || "Explore the designs"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/about" className="inline-flex min-h-12 items-center border-b border-current px-1 text-sm font-semibold hover:text-[var(--theme-color-accent)]">
              Our story
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[440px] items-center justify-center bg-[#e6d6ce] px-5 py-10 sm:px-10 lg:min-h-full">
          <div className="absolute inset-5 border border-[#8a1538]/15 sm:inset-8" aria-hidden="true" />
          <div className="relative h-[390px] w-full max-w-[700px] sm:h-[540px] lg:h-[620px]">
            {suppliedImage ? (
              // Admin-managed hero media can be hosted outside the Next image allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={suppliedImage} alt="Fashion Feet featured footwear" className="h-full w-full object-contain" />
            ) : (
              <Image src={ARCHIVE_HERO} alt="Gold embellished Punjabi juttis from the Fashion Feet catalogue" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain drop-shadow-[0_24px_24px_rgba(40,28,27,0.18)]" />
            )}
          </div>
          {!suppliedImage && <p className="absolute bottom-7 left-8 text-xs font-medium text-[#4d3730] sm:left-12">From the Fashion Feet collection · <Link href="/women" className="underline underline-offset-4">View women&apos;s designs</Link></p>}
        </div>
      </div>
    </section>
  );
}
