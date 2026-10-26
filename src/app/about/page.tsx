import Link from "next/link";
import { Hand, Feather, ShieldCheck } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";
import { BRAND_TAGLINE } from "@/lib/branding";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const sections = await getPublishedStorefrontConfig("about");
  const hero = sections.find((section) => section.type === "HERO_BANNER");

  return (
    <StorefrontLayout>
      <div className="pt-24 pb-24">
        {/* Hero Section */}
        {hero?.visible !== false && <section data-published-section="HERO_BANNER" data-style-preset={hero?.stylePreset || "DARK_ROYAL"} data-motion-preset={hero?.motionPreset || "NONE"} className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 z-10 ${hero?.stylePreset === "LIGHT_GOLD" ? "bg-white/50" : "bg-black/40"}`}></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={hero?.image || PLACEHOLDER_HOMEPAGE_IMAGE}
              alt="Punjabi Juttis" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`relative z-20 max-w-3xl px-4 text-center ${hero?.stylePreset === "LIGHT_GOLD" ? "text-[#251b18]" : "text-white"}`}>
            <BrandLogo className="mx-auto mb-6 h-32 w-auto rounded-xl bg-white shadow-xl md:h-40" sizes="(max-width: 768px) 180px, 220px" eager />
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">{hero?.badge || BRAND_TAGLINE}</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">{hero?.title || BRAND_TAGLINE}</h1>
            <p className={`text-xl font-light md:text-2xl ${hero?.stylePreset === "LIGHT_GOLD" ? "text-[#45372e]" : "text-white/90"}`}>
              {hero?.subtitle || "Discover Punjabi Juttis that bring together timeless craftsmanship, vibrant design, and contemporary style."}
            </p>
            {hero?.description && <p className={`mt-5 text-sm ${hero.stylePreset === "LIGHT_GOLD" ? "text-[#514237]" : "text-white/75"}`}>{hero.description}</p>}
            {hero?.ctaText && <Link href={hero.ctaLink || "/shop"} className="mt-6 inline-flex bg-[#8A1538] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">{hero.ctaText}</Link>}
          </div>
        </section>}

        {/* Story & Philosophy */}
        <section className="py-24 bg-[var(--color-brand-50)]">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <h2 className="font-serif text-4xl text-[var(--color-brand-900)] mb-6">Our Story</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Fashion Feet began with a simple vision: to preserve the rich heritage of handcrafted Indian footwear while adapting it for the modern wardrobe. Every pair of Juttis we offer is shaped by traditional Punjabi craftsmanship.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We work directly with traditional shoemakers, ensuring fair practices and keeping the beautiful art of hand-embroidery and leather craftsmanship alive in a world of mass production.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-4xl text-[var(--color-brand-900)] mb-6">The Philosophy</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We believe that true luxury lies in authenticity and comfort. A Fashion Feet Jutti is not just an accessory; it is a piece of art meant to be worn, celebrated, and cherished.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our designs blend historical motifs with contemporary color palettes, making them the perfect companion for grand weddings, festive celebrations, and elegant everyday wear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Section */}
        <section className="py-24 bg-white border-y border-[var(--color-brand-100)]">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-[var(--color-brand-50)] rounded-full flex items-center justify-center mb-6 text-[var(--color-brand-900)]">
                  <Hand className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-[var(--color-brand-900)] mb-3">Tradition</h3>
                <p className="text-gray-600 max-w-xs">Timeless Punjabi craftsmanship preserved in every stitch.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-[var(--color-brand-50)] rounded-full flex items-center justify-center mb-6 text-[var(--color-brand-900)]">
                  <Feather className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-[var(--color-brand-900)] mb-3">Style</h3>
                <p className="text-gray-600 max-w-xs">Elegant designs crafted for every occasion, from weddings to casual outings.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-[var(--color-brand-50)] rounded-full flex items-center justify-center mb-6 text-[var(--color-brand-900)]">
                  <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-[var(--color-brand-900)] mb-3">Variety</h3>
                <p className="text-gray-600 max-w-xs">Extensive curated collections designed for both men and women.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="py-24 bg-[var(--color-brand-900)] text-center text-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-serif text-4xl mb-6">Explore Fashion Feet</h2>
            <p className="text-white/80 mb-12 text-lg">
              Discover our latest collections and find a pair that speaks to your style.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/women" className="px-8 py-4 bg-white text-[var(--color-brand-900)] font-medium uppercase tracking-widest text-sm hover:bg-[var(--color-accent-gold)] hover:text-white transition-colors">
                Explore Women's
              </Link>
              <Link href="/men" className="px-8 py-4 bg-transparent border border-white text-white font-medium uppercase tracking-widest text-sm hover:bg-white hover:text-[var(--color-brand-900)] transition-colors">
                Explore Men's
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
