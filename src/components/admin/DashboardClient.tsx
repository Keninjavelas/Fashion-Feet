"use client";

import { 
  Package, 
  Layers, 
  Sparkles, 
  Tag, 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Eye, 
  Ruler, 
  Palette,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { TiltCard } from "./TiltCard";

export function DashboardClient({
  totalProducts,
  featuredProductsCount,
  discountedProductsCount,
  totalCollections,
  totalUsers,
  totalWishlists,
  totalEnquiries,
  newEnquiriesCount,
  recentEnquiries,
  topRequestedSize,
  topSizePercentage,
  totalSizesRecorded,
  topPalette,
  categoryBreakdown,
  colorsForBars,
  activeFestival
}: {
  totalProducts: number;
  featuredProductsCount: number;
  discountedProductsCount: number;
  totalCollections: number;
  totalUsers: number;
  totalWishlists: number;
  totalEnquiries: number;
  newEnquiriesCount: number;
  recentEnquiries: any[];
  topRequestedSize: string;
  topSizePercentage: number;
  totalSizesRecorded: number;
  topPalette: string;
  categoryBreakdown: [string, number][];
  colorsForBars: string[];
  activeFestival: any;
}) {
  return (
    <div className="space-y-8 pb-12">
      {/* Premium Hero Banner with 3D Floating Brand Badge */}
      <div className="bg-gradient-to-r from-[var(--color-brand-900)] via-slate-900 to-[#121212] text-white p-8 md:p-10 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[var(--color-accent-gold)] text-xs uppercase tracking-widest font-semibold border border-white/15">
            <Sparkles className="w-4 h-4 text-[var(--color-accent-gold)] animate-pulse" />
            <span>Fashion Feet Business Operating Platform</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
            Showroom Operating Suite
          </h1>

          <p className="text-white/70 text-xs md:text-sm leading-relaxed">
            Real-time analytics: catalogue inventory, customer size preferences, showroom fitting enquiries, and active campaign takeovers.
          </p>

          {activeFestival && (
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-300 uppercase tracking-wider">
                Active Theme: {activeFestival.name}
              </span>
            </div>
          )}
        </div>

        {/* 3D Floating Brand Accent / Jutti Badge */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[var(--color-accent-gold)]/20 to-transparent p-0.5 border border-[var(--color-accent-gold)]/40 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full bg-slate-950/80 rounded-[14px] backdrop-blur-md flex flex-col items-center justify-center p-3 text-center space-y-1">
              <span className="text-3xl animate-bounce">👞</span>
              <span className="font-serif text-[10px] font-bold text-[var(--color-accent-gold)] uppercase tracking-wider">Fashion Feet</span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="px-6 py-3.5 bg-[var(--color-accent-gold)] text-[var(--color-brand-900)] font-bold text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
          >
            Storefront <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Background Glow */}
        <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-[var(--color-accent-gold)]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid with 3D Tilt & Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Products */}
        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Total Products</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-brand-900)]">{totalProducts}</p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center pt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> {featuredProductsCount} Featured Items
              </p>
            </div>
            <div className="p-4 bg-[var(--color-brand-50)] text-[var(--color-brand-900)] rounded-xl border border-[var(--color-brand-200)]">
              <Package className="w-6 h-6" />
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Catalogue Growth</span>
            <svg className="w-20 h-5 text-emerald-500 overflow-visible" viewBox="0 0 50 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0,8 L10,5 L20,7 L30,3 L40,6 L50,1" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 2: Collections */}
        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Active Collections</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-brand-900)]">{totalCollections}</p>
              <p className="text-xs text-amber-600 font-semibold flex items-center pt-1">
                <Tag className="w-3.5 h-3.5 mr-1" /> {discountedProductsCount} On Promo Offer
              </p>
            </div>
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Collection Reach</span>
            <svg className="w-20 h-5 text-amber-500 overflow-visible" viewBox="0 0 50 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0,9 L12,7 L25,4 L38,6 L50,2" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 3: Wishlists Saved */}
        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Favorites Saved</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-brand-900)]">{totalWishlists}</p>
              <p className="text-xs text-rose-600 font-semibold flex items-center pt-1">
                <Heart className="w-3.5 h-3.5 mr-1" /> High Intent Saves
              </p>
            </div>
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Customer Interest</span>
            <svg className="w-20 h-5 text-rose-500 overflow-visible" viewBox="0 0 50 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0,7 L15,3 L28,8 L40,2 L50,1" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 4: Enquiries */}
        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Showroom Enquiries</p>
              <p className="text-3xl font-serif font-bold text-[var(--color-brand-900)]">{totalEnquiries}</p>
              <p className="text-xs text-indigo-600 font-semibold flex items-center pt-1">
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> {newEnquiriesCount} New Unread
              </p>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Inquiry Traffic</span>
            <svg className="w-20 h-5 text-indigo-500 overflow-visible" viewBox="0 0 50 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0,6 L10,8 L25,3 L35,5 L50,1" />
            </svg>
          </div>
        </TiltCard>
      </div>

      {/* Dynamic Live Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-[11px] uppercase font-bold tracking-widest">
            <span>Most Requested Size</span>
            <Ruler className="w-4 h-4 text-[var(--color-accent-gold)]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[var(--color-brand-900)]">{topRequestedSize}</p>
          <p className="text-xs text-gray-500 font-medium">
            {totalSizesRecorded > 0 
              ? `Based on ${topSizePercentage}% of customer accounts & size profiles` 
              : "No customer size profiles saved yet"}
          </p>
        </TiltCard>

        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-[11px] uppercase font-bold tracking-widest">
            <span>Popular Palette</span>
            <Palette className="w-4 h-4 text-[var(--color-accent-gold)]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[var(--color-brand-900)]">{topPalette}</p>
          <p className="text-xs text-gray-500 font-medium">Dominant color combinations in active catalogue inventory</p>
        </TiltCard>

        <TiltCard className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-[11px] uppercase font-bold tracking-widest">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-[var(--color-accent-gold)]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[var(--color-brand-900)]">{totalUsers}</p>
          <p className="text-xs text-gray-500 font-medium">Registered user profiles with wishlist history</p>
        </TiltCard>
      </div>

      {/* Real-time Category Breakdown & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-black/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--color-brand-900)]">Catalogue Taxonomy Distribution</h2>
              <p className="text-xs text-gray-500 mt-0.5">Actual count & percentage breakdown per category</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest bg-[var(--color-brand-50)] text-[var(--color-brand-900)] px-3 py-1.5 rounded-lg border border-[var(--color-brand-200)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live DB Sync
            </span>
          </div>

          <div className="space-y-5 pt-2">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No products categorized yet.</p>
            ) : (
              categoryBreakdown.map(([catName, count], idx) => {
                const percentage = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
                const barColor = colorsForBars[idx % colorsForBars.length];

                return (
                  <div key={catName} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-700">
                      <span className="font-bold text-gray-900">{catName} Category</span>
                      <span className="font-mono text-gray-500">{count} Products ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-black/5">
                      <div className={`${barColor} h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${Math.max(percentage, 8)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-black/5">
            <Link href="/admin/products" className="p-3.5 bg-[var(--color-brand-50)] text-center rounded-xl hover:bg-[var(--color-brand-900)] hover:text-white transition-all group shadow-sm">
              <Package className="w-5 h-5 mx-auto text-[var(--color-brand-900)] group-hover:text-[var(--color-accent-gold)] mb-1 transition-colors" />
              <span className="text-xs font-bold">Catalogue</span>
            </Link>
            <Link href="/admin/enquiries" className="p-3.5 bg-[var(--color-brand-50)] text-center rounded-xl hover:bg-[var(--color-brand-900)] hover:text-white transition-all group shadow-sm">
              <MessageSquare className="w-5 h-5 mx-auto text-[var(--color-brand-900)] group-hover:text-[var(--color-accent-gold)] mb-1 transition-colors" />
              <span className="text-xs font-bold">Enquiries</span>
            </Link>
            <Link href="/admin/festivals" className="p-3.5 bg-[var(--color-brand-50)] text-center rounded-xl hover:bg-[var(--color-brand-900)] hover:text-white transition-all group shadow-sm">
              <Sparkles className="w-5 h-5 mx-auto text-[var(--color-brand-900)] group-hover:text-[var(--color-accent-gold)] mb-1 transition-colors" />
              <span className="text-xs font-bold">Themes</span>
            </Link>
            <Link href="/admin/analytics" className="p-3.5 bg-[var(--color-brand-50)] text-center rounded-xl hover:bg-[var(--color-brand-900)] hover:text-white transition-all group shadow-sm">
              <Eye className="w-5 h-5 mx-auto text-[var(--color-brand-900)] group-hover:text-[var(--color-accent-gold)] mb-1 transition-colors" />
              <span className="text-xs font-bold">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Live Customer Enquiries Activity Stream */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="font-serif text-lg font-bold text-[var(--color-brand-900)]">Live Customer Stream</h2>
              </div>
              <Link href="/admin/enquiries" className="text-xs font-bold text-[var(--color-accent-gold)] hover:underline flex items-center">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {recentEnquiries.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium">No customer inquiries received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnquiries.map((enquiry: any) => (
                  <div key={enquiry.id} className="p-3.5 bg-gray-50/80 rounded-xl border border-black/5 hover:border-black/15 transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--color-brand-900)]">{enquiry.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-300" /> {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {enquiry.product ? `Pair: ${enquiry.product.title}` : enquiry.subject || enquiry.message || "Showroom Fitting Enquiry"}
                    </p>
                    {enquiry.size && (
                      <span className="inline-block text-[10px] bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-semibold shadow-xs">
                        Size: {enquiry.size}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-black/5 text-center text-[11px] text-gray-400 font-medium">
            Live Stream — Customer interactions update in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
