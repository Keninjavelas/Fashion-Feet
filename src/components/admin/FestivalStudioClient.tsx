"use client";

import { useState } from "react";
import {
  Sparkles, Calendar, Clock, CheckCircle2, AlertCircle, Play, Square,
  Edit3, Copy, Trash2, Eye, Image as ImageIcon, Sliders, Tag,
  ShoppingBag, Megaphone, ShieldCheck, ArrowRight, Loader2, X, Plus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SEASONAL_ATMOSPHERES, SeasonalThemeKey, SUPPORTED_SEASONAL_KEYS } from "@/lib/seasonalConstants";
import {
  saveFestivalStudioAction,
  activateFestivalNowAction,
  deactivateFestivalAction,
  duplicateFestivalCampaign,
  deleteFestival,
  syncFestivalCalendarAction
} from "@/app/actions/festivals";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  category: string;
  sku: string | null;
}

interface FestivalStudioProps {
  initialFestivals: any[];
  mediaAssets: MediaAsset[];
  products: ProductItem[];
  adminRole: string;
  adminName: string;
}

const THEME_ICONS: Record<string, string> = {
  default: "🏛️",
  diwali: "🪔",
  holi: "🎨",
  eid: "🌙",
  christmas: "🎄",
  lohri: "🔥",
  baisakhi: "🌾",
};

export function FestivalStudioClient({
  initialFestivals,
  mediaAssets,
  products,
  adminRole,
  adminName,
}: FestivalStudioProps) {
  const [festivals, setFestivals] = useState<any[]>(initialFestivals);
  const [editingFestival, setEditingFestival] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"SCHEDULING" | "VISUALS" | "OFFERS" | "ANNOUNCEMENT">("SCHEDULING");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [syncYear, setSyncYear] = useState<number>(new Date().getFullYear());
  const [syncMonth, setSyncMonth] = useState<number>(0);
  const [syncingCalendar, setSyncingCalendar] = useState<boolean>(false);

  const handleSyncCalendar = async () => {
    setSyncingCalendar(true);
    setFeedback(null);
    try {
      const res = await syncFestivalCalendarAction(syncYear, syncMonth === 0 ? undefined : syncMonth);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", `Successfully synchronized ${res.count} festival schedule(s) for year ${syncYear} from the internet (11-day active windows).`);
        window.location.reload();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to sync calendar.");
    } finally {
      setSyncingCalendar(false);
    }
  };

  const now = Date.now();
  const activeFestival = festivals.find((f) => f.enabled && (!f.autoDisable || new Date(f.endDate).getTime() >= now))
    || festivals.filter((f) => f.status === "SCHEDULED" && f.autoActivate
      && new Date(f.startDate).getTime() <= now && new Date(f.endDate).getTime() >= now)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenEdit = (fest: any) => {
    setEditingFestival({
      ...fest,
      startDate: new Date(fest.startDate).toISOString().slice(0, 16),
      endDate: new Date(fest.endDate).toISOString().slice(0, 16),
      productIds: typeof fest.productIds === "string" ? JSON.parse(fest.productIds || "[]") : (fest.productIds || []),
    });
    setActiveTab("SCHEDULING");
  };

  const handleSave = async () => {
    if (!editingFestival) return;
    setLoading(true);
    setFeedback(null);

    const res = await saveFestivalStudioAction(editingFestival);
    setLoading(false);

    if (res.error) {
      showFeedback("error", res.error);
    } else if (res.festival) {
      setFestivals((prev) =>
        prev.map((f) => (f.id === res.festival.id || f.id === `virtual-${res.festival.theme}` ? res.festival : f))
      );
      setEditingFestival(null);
      showFeedback("success", `Seasonal experience for ${res.festival.name} saved successfully.`);
    }
  };

  const handleActivateNow = async (id: string, theme: string) => {
    if (adminRole !== "SUPER_ADMIN") {
      alert("Unauthorized. Super Admin role required to activate live seasonal experiences.");
      return;
    }

    if (!confirm(`Activate ${theme.toUpperCase()} experience immediately on the live storefront?`)) return;

    setLoading(true);
    const res = await activateFestivalNowAction(id);
    setLoading(false);

    if (res.error) {
      showFeedback("error", res.error);
    } else if (res.festival) {
      setFestivals((prev) =>
        prev.map((f) => f.id === res.festival.id || f.id === `virtual-${res.festival.theme}`
          ? res.festival
          : { ...f, enabled: false, status: f.status === "ACTIVE" ? "INACTIVE" : f.status })
      );
      showFeedback("success", `Live Storefront transformed into ${res.festival.name} atmosphere!`);
      window.location.reload();
    }
  };

  const handleDeactivate = async (id: string) => {
    if (adminRole !== "SUPER_ADMIN") {
      alert("Unauthorized. Super Admin role required.");
      return;
    }

    if (!confirm("Deactivate this seasonal experience and return storefront to Default Atelier?")) return;

    setLoading(true);
    const res = await deactivateFestivalAction(id);
    setLoading(false);

    if (res.error) {
      showFeedback("error", res.error);
    } else {
      setFestivals((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabled: false, status: "INACTIVE" } : f))
      );
      showFeedback("success", "Storefront reverted cleanly to Default Atelier atmosphere.");
      window.location.reload();
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    const res = await duplicateFestivalCampaign(id);
    setLoading(false);

    if (res.error) {
      showFeedback("error", res.error);
    } else if (res.festival) {
      setFestivals((prev) => [...prev, res.festival]);
      showFeedback("success", "Campaign duplicated for future seasonal scheduling.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Studio Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A1538] block">
              Experience Studio
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#8A1538]/10 border border-[#8A1538]/30 text-[#8A1538] text-[9px] font-bold uppercase tracking-wider">
              Phase D Master Control
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight mt-1 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#D4AF37]" /> Seasonal & Festival Studio
          </h1>
          <p className="text-gray-600 text-xs mt-1 max-w-2xl">
            Manage all 7 cultural atmospheres, scheduled automation windows, physical boutique promotional offers, and visual effects with full enquiry-only fidelity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/editor"
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4 text-[#D4AF37]" /> Visual Canvas Studio
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Automated Internet Calendar Festival Sync (11-Day Window Control) */}
      <div className="p-6 bg-gradient-to-br from-[#12080C] via-[#1E0D14] to-[#0A0507] rounded-3xl border border-[#D4AF37]/40 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Automated Calendar Week Sync (11-Day Window)
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span>📅</span> Internet Festive Calendar Automation
            </h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Based on the calendar year and month, festival dates are fetched directly from open national panchang and holiday APIs on the internet. Each festival is automatically configured for an <strong>11-day active window</strong>: <strong>5 days prior</strong> to the event, the festival day itself, and <strong>5 days post-event</strong>. Once the 11 days elapse, the storefront automatically reverts back to the timeless Default Atelier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/60 mb-1">Calendar Year</label>
              <select
                value={syncYear}
                onChange={(e) => setSyncYear(Number(e.target.value))}
                className="bg-black/60 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/60 mb-1">Month (Optional)</label>
              <select
                value={syncMonth}
                onChange={(e) => setSyncMonth(Number(e.target.value))}
                className="bg-black/60 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
              >
                <option value={0}>All Months (Full Year)</option>
                <option value={1}>January (Lohri)</option>
                <option value={2}>February</option>
                <option value={3}>March (Holi / Eid)</option>
                <option value={4}>April (Baisakhi)</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November (Diwali)</option>
                <option value={12}>December (Christmas)</option>
              </select>
            </div>

            <div className="flex items-end pt-5">
              <button
                type="button"
                onClick={handleSyncCalendar}
                disabled={syncingCalendar}
                className="px-5 py-2.5 bg-[#8A1538] hover:bg-[#A81B45] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg border border-[#D4AF37]/50 flex items-center gap-2 disabled:opacity-50"
              >
                {syncingCalendar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching & Syncing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Sync 11-Day Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Active Atmosphere Spotlight */}
      <div className="p-6 bg-gradient-to-r from-[#1C0D12] via-[#12080C] to-black rounded-3xl border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#8A1538]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Live Public Atmosphere
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <span>{THEME_ICONS[activeFestival?.theme || "default"]}</span>
              <span className="capitalize">{activeFestival ? activeFestival.name : "Default Atelier (Warm Ivory & Royal Velvet)"}</span>
            </h2>

            <p className="text-white/70 text-xs max-w-xl leading-relaxed">
              {activeFestival?.offerHeading
                ? [activeFestival.offerHeading, activeFestival.offerDescription].filter(Boolean).join(" — ")
                : "Serving a timeless heritage aesthetic with subtle ambient gold particles and bespoke bridal consultation."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeFestival ? (
              <button
                onClick={() => handleDeactivate(activeFestival.id)}
                disabled={loading || adminRole !== "SUPER_ADMIN"}
                className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Square className="w-3.5 h-3.5" /> Deactivate / Revert to Atelier
              </button>
            ) : (
              <span className="text-xs text-white/50 italic">
                Default Atelier is active. Activate any festive atmosphere below.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 7 Seasonal Atmospheres Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8A1538]" /> Seasonal Experience Portfolio (7 Cultural Atmospheres)
          </h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            Independent Scheduled Configurations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {festivals.map((fest) => {
            const canonical = SEASONAL_ATMOSPHERES[fest.theme as SeasonalThemeKey] || SEASONAL_ATMOSPHERES.default;
            const isActive = fest.enabled;
            const isDefault = fest.theme === "default";

            return (
              <div
                key={fest.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 relative overflow-hidden ${
                  isActive
                    ? "bg-[#1F0C14] text-white border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/50"
                    : "bg-white text-gray-900 border-gray-200 hover:border-gray-400 shadow-sm"
                }`}
              >
                {/* Card Top Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{THEME_ICONS[fest.theme] || "✨"}</span>
                      <div>
                        <h4 className={`font-serif font-bold text-base capitalize ${isActive ? "text-white" : "text-gray-900"}`}>{fest.name || fest.theme}</h4>
                        <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold block">{fest.theme}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                          : fest.status === "SCHEDULED"
                          ? "bg-amber-500/20 text-amber-700 border-amber-300"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {isActive ? "LIVE ACTIVE" : (fest.status || "INACTIVE")}
                    </span>
                  </div>

                  {/* Dates & Schedule */}
                  {!isDefault && (
                    <div className={`p-3 rounded-xl border text-[11px] space-y-1 font-mono ${isActive ? "bg-black/40 border-white/5 text-white/80" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                      <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#8A1538]" />
                        <span>
                          {new Date(fest.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" — "}
                          {new Date(fest.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center justify-between pt-0.5">
                        <span>Auto-Activate: {fest.autoActivate ? "ON" : "OFF"}</span>
                        <span>Auto-Expire: {fest.autoDisable ? "ON" : "OFF"}</span>
                      </div>
                    </div>
                  )}

                  {/* Offer & Visual Details */}
                  <div className={`space-y-1.5 text-xs ${isActive ? "text-white/70" : "text-gray-600"}`}>
                    <p className={`font-bold truncate flex items-center gap-1.5 ${isActive ? "text-white" : "text-gray-900"}`}>
                      <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> {fest.offerHeading || "Boutique Experience"}
                    </p>
                    <p className="text-[11px] line-clamp-2">
                      {fest.offerDescription || fest.description}
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase ${isActive ? "bg-white/5 text-white/60" : "bg-gray-100 text-gray-600"}`}>
                        Effects: {fest.animation || "particles"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase ${isActive ? "bg-white/5 text-[#D4AF37]" : "bg-[#8A1538]/10 text-[#8A1538]"}`}>
                        Intensity: {fest.effectIntensity || "Balanced"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className={`pt-4 border-t flex items-center justify-between gap-2 ${isActive ? "border-white/10" : "border-gray-200"}`}>
                  <button
                    onClick={() => handleOpenEdit(fest)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all flex-1 justify-center ${
                      isActive ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" /> Studio Edit
                  </button>

                  <Link
                    href={`/admin/editor/preview?season=${fest.theme}`}
                    target="_blank"
                    className={`p-2 rounded-xl border transition-all ${
                      isActive ? "bg-white/5 hover:bg-white/10 text-white/70 border-white/10" : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
                    }`}
                    title="Preview in Sandbox Canvas"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {!isDefault && (
                    <button
                      onClick={() => handleDuplicate(fest.id)}
                      disabled={loading || fest.id.startsWith("virtual-")}
                      className={`p-2 rounded-xl border transition-all ${
                        isActive ? "bg-white/5 hover:bg-white/10 text-white/70 border-white/10" : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
                      }`}
                      title={fest.id.startsWith("virtual-") ? "Save this campaign before duplicating" : "Duplicate Campaign"}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}

                  {!isActive && !isDefault && (
                    <button
                      onClick={() => handleActivateNow(fest.id, fest.name || fest.theme)}
                      disabled={loading || adminRole !== "SUPER_ADMIN"}
                      className="px-4 py-2 bg-[#8A1538] hover:bg-[#A81B45] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md border border-[#D4AF37]/30 disabled:opacity-40"
                      title="Activate Live Immediately"
                    >
                      <Play className="w-3 h-3 text-[#D4AF37]" /> Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Studio Profile Editor Drawer / Modal */}
      {editingFestival && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12080C] text-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-[#D4AF37]/30 shadow-2xl my-8">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{THEME_ICONS[editingFestival.theme] || "✨"}</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">Seasonal Studio Profile</span>
                  <h2 className="font-serif text-2xl font-bold text-white capitalize">{editingFestival.name || editingFestival.theme} Experience</h2>
                </div>
              </div>

              <button
                onClick={() => setEditingFestival(null)}
                className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("SCHEDULING")}
                className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "SCHEDULING" ? "border-[#D4AF37] text-[#D4AF37] bg-white/5 rounded-t-xl" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" /> 1. Scheduling & Automation
              </button>
              <button
                onClick={() => setActiveTab("VISUALS")}
                className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "VISUALS" ? "border-[#D4AF37] text-[#D4AF37] bg-white/5 rounded-t-xl" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Sliders className="w-4 h-4" /> 2. Atmosphere & Visuals
              </button>
              <button
                onClick={() => setActiveTab("OFFERS")}
                className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "OFFERS" ? "border-[#D4AF37] text-[#D4AF37] bg-white/5 rounded-t-xl" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Tag className="w-4 h-4" /> 3. Boutique Offers & Badges
              </button>
              <button
                onClick={() => setActiveTab("ANNOUNCEMENT")}
                className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "ANNOUNCEMENT" ? "border-[#D4AF37] text-[#D4AF37] bg-white/5 rounded-t-xl" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Megaphone className="w-4 h-4" /> 4. Featured & Marquee
              </button>
            </div>

            {/* Tab 1: Scheduling & Automation */}
            {activeTab === "SCHEDULING" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Campaign Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editingFestival.startDate}
                      onChange={(e) => setEditingFestival({ ...editingFestival, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Campaign End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editingFestival.endDate}
                      onChange={(e) => setEditingFestival({ ...editingFestival, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <h4 className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-wider">Automated Lifecycle Rules</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingFestival.autoActivate}
                      onChange={(e) => setEditingFestival({ ...editingFestival, autoActivate: e.target.checked })}
                      className="w-4 h-4 accent-[#8A1538] rounded"
                    />
                    <div>
                      <span className="font-bold text-white block">Auto-Activate on Start Date</span>
                      <span className="text-[10px] text-white/50">Automatically promotes this festival to live status when current time reaches start date.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingFestival.autoDisable}
                      onChange={(e) => setEditingFestival({ ...editingFestival, autoDisable: e.target.checked })}
                      className="w-4 h-4 accent-[#8A1538] rounded"
                    />
                    <div>
                      <span className="font-bold text-white block">Auto-Expire on End Date (Revert to Default)</span>
                      <span className="text-[10px] text-white/50">Automatically ends campaign and cleanly returns storefront to timeless Atelier mode.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 2: Atmosphere & Visuals */}
            {activeTab === "VISUALS" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Campaign Display Name</label>
                    <input
                      type="text"
                      value={editingFestival.name}
                      onChange={(e) => setEditingFestival({ ...editingFestival, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Atmospheric Theme Token</label>
                    <select
                      value={editingFestival.theme}
                      onChange={(e) => setEditingFestival({ ...editingFestival, theme: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none capitalize"
                    >
                      {SUPPORTED_SEASONAL_KEYS.map((k) => (
                        <option key={k} value={k}>{k.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MediaAsset Hero Banner Binding */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Festival Hero Imagery (MediaAsset Library)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="px-3 py-1.5 bg-[#8A1538] hover:bg-[#A81B45] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md"
                    >
                      <Plus className="w-3 h-3" /> Select Asset
                    </button>
                  </div>

                  {editingFestival.heroBanner ? (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-[#D4AF37]/40">
                      <Image src={editingFestival.heroBanner} alt="Hero Banner" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] text-white font-mono truncate">{editingFestival.heroBanner}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-white/20 rounded-xl text-white/40 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto text-white/20" />
                      <p className="text-xs">No media asset bound yet. Default atmospheric imagery will be rendered.</p>
                    </div>
                  )}
                </div>

                {/* Effects & Particles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Particle Animation Overlay</label>
                    <select
                      value={editingFestival.animation || "floating-diyas"}
                      onChange={(e) => setEditingFestival({ ...editingFestival, animation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                    >
                      <option value="floating-diyas">Floating Diya Sparks (Diwali)</option>
                      <option value="gulal-powder">Gulal Powder Swirls (Holi)</option>
                      <option value="crescent-lanterns">Crescent Moon Lanterns (Eid)</option>
                      <option value="snowfall">Soft Winter Snowfall (Christmas)</option>
                      <option value="bonfire-embers">Bonfire Ember Glow (Lohri)</option>
                      <option value="wheat-chaff">Harvest Wheat & Silk (Baisakhi)</option>
                      <option value="none">None (Static Atmosphere)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Visual Effect Intensity</label>
                    <select
                      value={editingFestival.effectIntensity || "BALANCED"}
                      onChange={(e) => setEditingFestival({ ...editingFestival, effectIntensity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                    >
                      <option value="SUBTLE">Subtle (Quiet Luxury)</option>
                      <option value="BALANCED">Balanced (Standard Celebration)</option>
                      <option value="VIBRANT">Vibrant (Full Festive Gala)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Boutique Offers & Badges */}
            {activeTab === "OFFERS" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#8A1538]/20 border border-[#D4AF37]/30 rounded-2xl space-y-2 text-white/80">
                  <p className="font-bold text-[#D4AF37] uppercase text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Boutique Physical-Store Offer Model (No E-Commerce Cart)
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Promotional offers and percentages configured here display as celebratory in-store signage and inquiry badges. Customers use <strong>"Enquire About This Pair"</strong> for bespoke fittings without transactional cart checkouts.
                  </p>
                </div>

                <div>
                  <label className="block text-white/70 font-bold uppercase mb-1">Promotional Offer Headline</label>
                  <input
                    type="text"
                    value={editingFestival.offerHeading || ""}
                    onChange={(e) => setEditingFestival({ ...editingFestival, offerHeading: e.target.value })}
                    placeholder="e.g., Diwali Special — 20% Boutique Celebration Offer"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold uppercase mb-1">Offer Consultation Description</label>
                  <textarea
                    rows={2}
                    value={editingFestival.offerDescription || ""}
                    onChange={(e) => setEditingFestival({ ...editingFestival, offerDescription: e.target.value })}
                    placeholder="e.g., Visit our atelier for handcrafted zari customization on festive orders."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">Product Card Festive Badge</label>
                    <input
                      type="text"
                      value={editingFestival.badgeText || ""}
                      onChange={(e) => setEditingFestival({ ...editingFestival, badgeText: e.target.value })}
                      placeholder="e.g., ✨ Diwali Exclusive"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-bold uppercase mb-1">CTA Action Button Text</label>
                    <input
                      type="text"
                      value={editingFestival.ctaText || ""}
                      onChange={(e) => setEditingFestival({ ...editingFestival, ctaText: e.target.value })}
                      placeholder="e.g., Explore Festive Collection"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Featured & Marquee */}
            {activeTab === "ANNOUNCEMENT" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-bold uppercase mb-1">Marquee Announcement Bar Text</label>
                  <input
                    type="text"
                    value={editingFestival.announcement || ""}
                    onChange={(e) => setEditingFestival({ ...editingFestival, announcement: e.target.value })}
                    placeholder="e.g., ✨ Diwali Festive Edition — Handcrafted Anand Karaj & Bridal Mojaris Now in Boutique"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={editingFestival.announcementActive}
                    onChange={(e) => setEditingFestival({ ...editingFestival, announcementActive: e.target.checked })}
                    className="w-4 h-4 accent-[#8A1538] rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">Display Festive Announcement Bar</span>
                    <span className="text-[10px] text-white/50">Renders high-visibility animated marquee bar at top of storefront during campaign.</span>
                  </div>
                </label>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingFestival(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#A81B45] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg border border-[#D4AF37]/40 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />} Save Experience Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MediaAsset Library Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12080C] text-white rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col border border-[#D4AF37]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#D4AF37]" /> Select Hero Imagery from Media Library
              </h3>
              <button onClick={() => setMediaPickerOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto flex-1 p-2">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setEditingFestival({
                      ...editingFestival,
                      heroBanner: asset.url,
                      mediaAssetId: asset.id
                    });
                    setMediaPickerOpen(false);
                  }}
                  className="relative aspect-square border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:scale-105 transition-all group"
                >
                  <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-end p-2">
                    <span className="text-[9px] text-white font-bold truncate">{asset.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
