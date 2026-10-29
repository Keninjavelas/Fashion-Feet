import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const sections = await getPublishedStorefrontConfig("about");
  const hero = sections.find((section) => section.type === "HERO_BANNER");
  const suppliedImage = hero?.image && hero.image !== PLACEHOLDER_HOMEPAGE_IMAGE ? hero.image : undefined;

  return (
    <StorefrontLayout>
      <div className="bg-[var(--theme-color-bg)] pt-28 text-[var(--theme-color-text)]">
        {hero?.visible !== false && <section data-published-section="HERO_BANNER" data-style-preset="LIGHT_GOLD" className="mx-auto grid max-w-[1500px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-20 md:px-12 lg:px-20">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-color-accent)]">{hero?.badge || "The Fashion Feet story"}</p>
            <h1 className="max-w-[11ch] font-serif text-5xl leading-tight md:text-7xl">{hero?.title || "Footwear with a point of view"}</h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--theme-color-text-muted)]">{hero?.subtitle || "Punjabi juttis for daily dressing, festive occasions, and ceremonies."}</p>
            {hero?.description && <p className="mt-4 max-w-xl leading-relaxed text-[var(--theme-color-text-muted)]">{hero.description}</p>}
            {hero?.ctaText && <Link href={hero.ctaLink || "/women"} className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 border-b border-current text-sm font-semibold">{hero.ctaText}<ArrowRight className="h-4 w-4" /></Link>}
          </div>
          <div className="relative min-h-[440px] bg-[#e6d6ce] lg:min-h-[650px]">
            {suppliedImage ? (
              // Admin media can use a remote URL outside the Next image allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={suppliedImage} alt="Fashion Feet collection" className="absolute inset-0 h-full w-full object-cover" />
            ) : <Image src="/catalogue/women/studio/festive-v2/02.png" alt="Embellished juttis from the Fashion Feet collection" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8" />}
          </div>
        </section>}

        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:px-8 lg:grid-cols-[0.65fr_1fr] lg:gap-24">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-color-accent)]">Our perspective</p><h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">Traditional form, individual expression.</h2></div>
          <div className="space-y-6 text-lg leading-relaxed text-[var(--theme-color-text-muted)]"><p>Fashion Feet presents Punjabi juttis in a range of colours and styles. The collection moves from easy daily wear to detailed pairs for celebrations and ceremonies.</p><p>The photographs on this site show actual designs from our collection and displays from past exhibitions. Explore the shape, texture, and decorative details before asking us about a particular pair.</p></div>
        </section>

        <section className="bg-[var(--theme-color-surface)] py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-8 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-square bg-[#eee4d8]"><Image src="/exhibitions/display-tables.jpg" alt="Fashion Feet juttis arranged for a past exhibition" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
            <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-color-accent)]">From the archive</p><h2 className="mt-5 font-serif text-4xl md:text-5xl">A collection seen in person.</h2><p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--theme-color-text-muted)]">Our exhibition photographs capture the variety of styles and colours Fashion Feet has brought together. They remain part of our story as the online catalogue grows.</p><Link href="/#past-exhibitions" className="mt-8 inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-[var(--theme-color-jewel)] underline underline-offset-4">See exhibition photos <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </section>

        <section className="bg-[#281c1b] px-6 py-20 text-center text-white"><h2 className="font-serif text-4xl md:text-5xl">Explore the designs</h2><p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#ebdcd3]">Browse the photographed women&apos;s catalogue or get in touch about a style you have seen.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/women" className="inline-flex min-h-12 items-center bg-white px-6 text-sm font-semibold text-[#281c1b]">Women&apos;s designs</Link><Link href="/contact" className="inline-flex min-h-12 items-center border border-white px-6 text-sm font-semibold text-white">Contact Fashion Feet</Link></div></section>
      </div>
    </StorefrontLayout>
  );
}
