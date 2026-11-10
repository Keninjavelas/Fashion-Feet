import Link from "next/link";
import { Mail } from "lucide-react";
import { BRAND_TAGLINE } from "@/lib/branding";
import { BrandLogo } from "./BrandLogo";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { CONTACT_EMAIL } from "@/lib/contactDetails";
import { FooterNewsletterForm } from "./FooterNewsletterForm";

export function Footer({ siteName = "Fashion Feet", section }: { siteName?: string; section?: StorefrontSection }) {
  if (section?.visible === false) return null;

  return (
    <footer data-published-section="GLOBAL_FOOTER" data-style-preset={section?.stylePreset || "DARK_ROYAL"} data-motion-preset={section?.motionPreset || "NONE"} className="bg-[#12080C] text-[#F6F2EB] pt-16 pb-8 border-t border-[#D4AF37]/20 relative z-20">
      {section?.image && <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${section.image})` }} aria-hidden="true" />}
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        
        {/* Top Fitting Consultation Callout */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/20 pb-10 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b779]">Fashion Feet</p>
            <h3 className="mt-4 font-serif text-3xl font-semibold text-white md:text-4xl">Have a pair in mind?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75">Tell us which design caught your eye. We can discuss its details and fit.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 items-center justify-center border border-[#d8b779] px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors">Contact Fashion Feet</Link>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-[#1A0A10] via-[#240C12] to-[#1A0A10] rounded-2xl p-8 md:p-10 mb-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-[#D4AF37]/30">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Private Previews</span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">Join Our Heritage Atelier</h3>
            <p className="text-[#F6F2EB]/80 text-xs md:text-sm font-sans leading-relaxed">
              Subscribe for private previews of seasonal drops, festive showcases, and bespoke announcements.
            </p>
          </div>
          <FooterNewsletterForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            {section?.badge && <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{section.badge}</p>}
            <h3 className="font-serif text-lg font-bold text-white">{section?.title || siteName}</h3>
            <BrandLogo className="h-auto w-full max-w-[130px] bg-white" sizes="130px" />
            <p className="font-sans text-xs font-bold tracking-wider text-[#D4AF37]">{BRAND_TAGLINE}</p>
            {section?.subtitle && <p className="text-xs text-white/70">{section.subtitle}</p>}
            <p className="text-white/70 leading-relaxed max-w-xs text-xs">
              {section?.description?.includes("Worldwide delivery") ? "Explore Fashion Feet designs for daily wear, celebrations, and ceremonies." : section?.description || "Explore Fashion Feet designs for daily wear, celebrations, and ceremonies."}
            </p>
            {section?.ctaText && <Link href={section.ctaLink || "/contact"} className="inline-flex text-xs font-bold uppercase tracking-widest text-[#D4AF37] underline underline-offset-4">{section.ctaText}</Link>}

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Shop</h4>
            <ul className="space-y-3.5 text-xs">
              <li><Link href="/men" className="text-white/70 hover:text-[#D4AF37] transition-colors">Men's Collection</Link></li>
              <li><Link href="/women" className="text-white/70 hover:text-[#D4AF37] transition-colors">Women's Collection</Link></li>
              <li><Link href="/shop?catalogue=daily-wear" className="text-white/70 hover:text-[#D4AF37] transition-colors">Daily Wear</Link></li>
              <li><Link href="/shop?catalogue=festive" className="text-white/70 hover:text-[#D4AF37] transition-colors">Festive</Link></li>
              <li><Link href="/shop?catalogue=ceremonial" className="text-white/70 hover:text-[#D4AF37] transition-colors">Ceremonial</Link></li>
              <li><Link href="/shop?catalogue=rajwadi&amp;gender=Women" className="text-white/70 hover:text-[#D4AF37] transition-colors">Women's Rajwadi</Link></li>
              <li><Link href="/shop?catalogue=functional&amp;gender=Men" className="text-white/70 hover:text-[#D4AF37] transition-colors">Men's Functional</Link></li>
              <li><Link href="/shop?catalogue=office-wear&amp;gender=Men" className="text-white/70 hover:text-[#D4AF37] transition-colors">Men's Office Wear</Link></li>
              <li><Link href="/shop?type=new" className="text-white/70 hover:text-[#D4AF37] transition-colors">New Arrivals</Link></li>
              <li><Link href="/size-guide" className="text-white/70 hover:text-[#D4AF37] transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Company</h4>
            <ul className="space-y-3.5 text-xs">
              <li><Link href="/about" className="text-white/70 hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link href="/#past-exhibitions" className="text-white/70 hover:text-[#D4AF37] transition-colors">Past Exhibitions</Link></li>
              <li><Link href="/stores" className="text-white/70 hover:text-[#D4AF37] transition-colors">Stores Coming Soon</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-[#D4AF37] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Get in Touch</h4>
            <ul className="space-y-3.5 text-xs">
              {/* Physical location and telephone details remain unpublished. */}
              <li className="flex items-start space-x-3 text-white/70">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D4AF37]" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline decoration-[#D4AF37]/40 underline-offset-2 hover:text-[#D4AF37] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
