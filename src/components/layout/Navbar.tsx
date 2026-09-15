"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Menu, X, Heart, ChevronDown, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchModal } from "./SearchModal";
import { CollectionsMegaMenu } from "./CollectionsMegaMenu";
import { EnquiryModal } from "../shop/EnquiryModal";
import { getWishlistCount } from "@/app/actions/wishlist";
import { useFestival } from "@/components/providers/FestivalProvider";

const links = [
  { name: "Home", href: "/" },
  { name: "Men", href: "/men" },
  { name: "Women", href: "/women" },
  { name: "Collections", href: "/shop", hasMegaMenu: true },
  { name: "New Arrivals", href: "/shop?type=new" },
  { name: "Size Studio", href: "/size-guide" },
  { name: "About", href: "/about" },
];

function WishlistIcon({ isDiwali }: { isDiwali: boolean }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    getWishlistCount().then(setCount).catch(() => {});
  }, []);

  return (
    <Link 
      href="/profile/favorites" 
      className={`relative transition-colors p-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
        isDiwali ? "text-white hover:text-[#D4AF37]" : "text-[#1F1A17] hover:text-[#8A1538]"
      }`}
      aria-label="Wishlist"
      title="Wishlist"
    >
      <Heart className="w-5 h-5 md:w-6 md:h-6" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-[#C5A059] text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Navbar({ siteLogo = "", siteName = "Fashion Feet" }: { siteLogo?: string; siteName?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [headerEnquiryOpen, setHeaderEnquiryOpen] = useState(false);

  const pathname = usePathname();
  const { activeFestival, preset } = useFestival();
  const isFestiveActive = activeFestival !== "none" && activeFestival !== "default";
  const isDiwali = activeFestival === "diwali" || activeFestival === "baisakhi" || activeFestival === "lohri";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultBoutiqueProduct = {
    id: "general-boutique-enquiry",
    title: "Boutique Showroom Custom Fitting & Inquiry",
    price: 0,
    category: "Custom Fitting"
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isDiwali
            ? isScrolled 
              ? "bg-[#12080C]/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl" 
              : "bg-gradient-to-b from-black/90 via-black/50 to-transparent py-6"
            : isScrolled 
              ? "bg-[#FAF6F0]/95 backdrop-blur-xl border-b border-black/10 py-3 shadow-md" 
              : "bg-[#FAF6F0] py-6 border-b border-black/5"
        }`}
        onMouseLeave={() => setMegaMenuOpen(false)}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden p-2.5 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                isDiwali ? "text-white hover:bg-white/10" : "text-[#1F1A17] hover:bg-black/5"
              }`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Premium Logo */}
            <Link
              href="/"
              className={`font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight z-10 flex-shrink-0 flex items-center gap-2 ${
                isDiwali ? "text-white" : "text-[#1F1A17]"
              }`}
            >
              {siteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteLogo} alt={siteName} className="h-9 md:h-12 object-contain" />
              ) : (
                <span className={isDiwali ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6F2EB] to-[#D4AF37]" : "text-[var(--color-brand-900)] font-bold"}>
                  {siteName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation (Frozen Architecture) */}
            <nav className="hidden lg:flex items-center space-x-7">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                if (link.hasMegaMenu) {
                  return (
                    <div 
                      key={link.name} 
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                    >
                      <button
                        onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                        className={`text-xs font-bold tracking-widest uppercase transition-all py-2 flex items-center gap-1 group focus:outline-none relative ${
                          isDiwali
                            ? isActive ? "text-[#D4AF37]" : "text-white/90 hover:text-[#D4AF37]"
                            : isActive ? "text-[#8A1538]" : "text-[#1F1A17] hover:text-[#8A1538]"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                        <span className={`absolute -bottom-0.5 left-0 h-0.5 transition-all duration-300 ${
                          isDiwali ? "bg-[#D4AF37]" : "bg-[#8A1538]"
                        } ${isActive || megaMenuOpen ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                      </button>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-bold tracking-widest uppercase transition-all py-2 group focus:outline-none relative ${
                      isDiwali
                        ? isActive ? "text-[#D4AF37]" : "text-white/90 hover:text-[#D4AF37]"
                        : isActive ? "text-[#8A1538]" : "text-[#1F1A17] hover:text-[#8A1538]"
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-0.5 left-0 h-0.5 transition-all duration-300 ${
                      isDiwali ? "bg-[#D4AF37]" : "bg-[#8A1538]"
                    } ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                  </Link>
                );
              })}

              {/* Temporary Highlighted Active Campaign Link */}
              {isFestiveActive && (
                <Link
                  href="/festive"
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#8A1538]/20 to-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>✨ {preset.name}</span>
                </Link>
              )}
            </nav>

            {/* Icon Controls */}
            <div className={`flex items-center space-x-1 md:space-x-2 z-10 ${isDiwali ? "text-white" : "text-[#1F1A17]"}`}>
              <button 
                onClick={() => setSearchOpen(true)}
                className={`p-2.5 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                  isDiwali ? "hover:text-[#D4AF37]" : "hover:text-[#8A1538]"
                }`}
                aria-label="Search Catalog"
                title="Search Catalog"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <Link 
                href="/profile" 
                className={`hidden sm:flex p-2.5 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                  isDiwali ? "hover:text-[#D4AF37]" : "hover:text-[#8A1538]"
                }`}
                aria-label="Customer Account Profile"
                title="Customer Account Profile"
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </Link>

              <WishlistIcon isDiwali={isDiwali} />

              {/* DIRECT BOUTIQUE ENQUIRY ACTION BUTTON (Replaces Cart) */}
              <button
                onClick={() => setHeaderEnquiryOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#D4AF37]/30"
                title="Send Boutique Fitting Enquiry"
              >
                <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Boutique Enquiry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collections Mega Menu */}
        <AnimatePresence>
          {megaMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionsMegaMenu onClose={() => setMegaMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-0 z-50 p-6 lg:hidden flex flex-col justify-between ${
                isDiwali ? "bg-[#12080C] text-white" : "bg-[#FAF6F0] text-[#1F1A17]"
              }`}
            >
              <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-4">
                <Link
                  href="/"
                  className="font-serif text-2xl font-bold tracking-tight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {siteName}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 -mr-2 text-gray-500 hover:text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-5 flex-1 overflow-y-auto">
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xl font-serif tracking-wide border-b border-black/5 pb-2.5 transition-colors ${
                        isActive ? "text-[#8A1538] font-bold" : "text-[#1F1A17]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {isFestiveActive && (
                  <Link
                    href="/festive"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#8A1538] text-[#D4AF37] font-serif font-bold text-base flex items-center justify-between shadow"
                  >
                    <span>✨ {preset.name}</span>
                    <Sparkles className="w-5 h-5" />
                  </Link>
                )}
              </nav>

              <div className="pt-4 border-t border-black/10 flex flex-col gap-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); setHeaderEnquiryOpen(true); }}
                  className="w-full py-3 bg-[#8A1538] text-white text-xs font-bold uppercase tracking-widest text-center rounded-xl shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#D4AF37]" /> Send Boutique Enquiry
                </button>

                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 text-sm font-bold justify-center pt-1 text-gray-700">
                  <User className="w-5 h-5 text-[#8A1538]" />
                  <span>Customer Profile</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />

      <EnquiryModal
        product={defaultBoutiqueProduct}
        isOpen={headerEnquiryOpen}
        onClose={() => setHeaderEnquiryOpen(false)}
      />
    </>
  );
}
