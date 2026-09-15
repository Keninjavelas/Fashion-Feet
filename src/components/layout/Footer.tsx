import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FooterNewsletterForm } from "./FooterNewsletterForm";

export function Footer({ siteLogo = "", siteName = "Fashion Feet" }: { siteLogo?: string; siteName?: string }) {
  return (
    <footer className="bg-[#12080C] text-[#F6F2EB] pt-16 pb-8 border-t border-[#D4AF37]/20 relative z-20">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-[#1A0A10] via-[#240C12] to-[#1A0A10] rounded-2xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-[#D4AF37]/30">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <h3 className="font-serif text-3xl font-bold tracking-tight text-white">Join Our Heritage Atelier</h3>
            <p className="text-[#F6F2EB]/80 text-sm font-sans">
              Subscribe for private previews of new seasonal drops, festive showcases, and bespoke fitting announcements.
            </p>
          </div>
          <FooterNewsletterForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
              {siteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteLogo} alt={siteName} className="h-8 object-contain" />
              ) : (
                <span>{siteName}</span>
              )}
            </h3>
            <p className="text-white/70 leading-relaxed max-w-xs text-xs">
              Traditional elegance meets modern comfort. Handcrafted Punjabi Juttis for every occasion, bringing 400 years of heritage to your steps.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#8A1538] hover:text-[#D4AF37] transition-all border border-white/10" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#8A1538] hover:text-[#D4AF37] transition-all border border-white/10" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#8A1538] hover:text-[#D4AF37] transition-all border border-white/10" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Shop</h4>
            <ul className="space-y-3.5 text-xs">
              <li><Link href="/men" className="text-white/70 hover:text-[#D4AF37] transition-colors">Men's Collection</Link></li>
              <li><Link href="/women" className="text-white/70 hover:text-[#D4AF37] transition-colors">Women's Collection</Link></li>
              <li><Link href="/festive" className="text-white/70 hover:text-[#D4AF37] transition-colors">Festive Collection</Link></li>
              <li><Link href="/shop?type=new" className="text-white/70 hover:text-[#D4AF37] transition-colors">New Arrivals</Link></li>
              <li><Link href="/size-guide" className="text-white/70 hover:text-[#D4AF37] transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Company</h4>
            <ul className="space-y-3.5 text-xs">
              <li><Link href="/about" className="text-white/70 hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link href="/stores" className="text-white/70 hover:text-[#D4AF37] transition-colors">Stores Coming Soon</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-[#D4AF37] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider mb-6 text-[#D4AF37] text-xs">Get in Touch</h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start space-x-3 text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D4AF37]" />
                <span>Fashion Feet Atelier & Head Office<br />Punjab, India<br />(Physical Boutiques Opening Soon)</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
                <span>hello@fashionfeet.com</span>
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
