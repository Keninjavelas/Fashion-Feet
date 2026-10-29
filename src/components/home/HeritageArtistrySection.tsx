import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function HeritageArtistrySection({
  artisanImage1,
  artisanImage2,
  section,
}: {
  artisanImage1?: string;
  artisanImage2?: string;
  section?: StorefrontSection;
}) {
  const primary = [section?.image, artisanImage1].find((image) => image && image !== PLACEHOLDER_HOMEPAGE_IMAGE);
  const secondary = artisanImage2 && artisanImage2 !== PLACEHOLDER_HOMEPAGE_IMAGE ? artisanImage2 : null;
  const legacyUnverifiedCopy = section?.description?.includes("vegetable-tanned leather soles") || section?.description?.includes("dabka, cut-dana");

  return (
    <section className="bg-[#281c1b] py-20 text-[#f7f2ea] md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b779]">{section?.badge || "The details"}</p>
          <h2 className="max-w-[12ch] font-serif text-4xl font-semibold leading-tight md:text-5xl">{section?.title || "A closer look at the craft"}</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#e6d6ce]">
            {legacyUnverifiedCopy ? "Colour, pattern, and embellishment give every pair its own character. Explore the photographs and see the details for yourself." : section?.description || section?.subtitle || "Colour, pattern, and embellishment give every pair its own character. Explore the photographs and see the details for yourself."}
          </p>
          <Link href={section?.ctaLink || "/about"} className="mt-9 inline-flex min-h-12 items-center gap-3 border-b border-[#d8b779] text-sm font-semibold text-[#f7f2ea] hover:text-[#d8b779]">
            {section?.ctaText || "Explore the collection"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-[1.1fr_0.9fr] items-end gap-3 sm:gap-5">
          <figure className="relative aspect-[4/5] overflow-hidden bg-[#392b28]">
            {primary ? (
              // Admin-managed media may be hosted outside the Next image allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary} alt="Fashion Feet footwear detail" className="h-full w-full object-cover" />
            ) : (
              <Image src="/catalogue/women/ceremonial/05.jpeg" alt="Close-up of gold and pearl embellishment on Fashion Feet juttis" fill sizes="(max-width: 1024px) 55vw, 30vw" className="object-cover" />
            )}
            <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-sm font-medium text-white">Look closer</figcaption>
          </figure>
          <figure className="relative mb-10 aspect-[4/5] overflow-hidden bg-[#e6d6ce] sm:mb-16">
            {secondary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={secondary} alt="Fashion Feet footwear photograph" className="h-full w-full object-cover" />
            ) : (
              <Image src="/catalogue/women/studio/festive-v2/02.png" alt="Colourful Fashion Feet festive juttis" fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-contain p-3" />
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
