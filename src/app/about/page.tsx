import Link from "next/link";
import { Hand, Feather, ShieldCheck } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function AboutPage() {
  return (
    <StorefrontLayout>
      <div className="pt-24 pb-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2000&auto=format&fit=crop" 
              alt="Punjabi Juttis" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-20 text-center text-white px-4 max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">Tradition in Every Step.</h1>
            <p className="text-xl md:text-2xl font-light text-white/90">
              Discover Punjabi Juttis that bring together timeless craftsmanship, vibrant design, and contemporary style.
            </p>
          </div>
        </section>

        {/* Story & Philosophy */}
        <section className="py-24 bg-[var(--color-brand-50)]">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <h2 className="font-serif text-4xl text-[var(--color-brand-900)] mb-6">Our Story</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Fashion Feet began with a simple vision: to preserve the rich heritage of handcrafted Indian footwear while adapting it for the modern wardrobe. Every pair of Juttis we offer tells a story of generations of skilled artisans from Punjab.
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
