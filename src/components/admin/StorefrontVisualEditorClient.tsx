"use client";

import { useState, useEffect, useRef } from "react";
import VersionHistoryPanel from '@/components/admin/VersionHistoryPanel';
import {
  Monitor, Tablet, Smartphone, Sparkles, Save, Upload, RotateCcw, RotateCw,
  Eye, Layers, Image as ImageIcon, Settings, CheckCircle2, AlertCircle, Loader2,
  ChevronUp, ChevronDown, Plus, Trash2, Sliders, Type, Layout
} from "lucide-react";
import Image from "next/image";
import { StorefrontSection, DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/storefrontConfigTypes";
import { SUPPORTED_SEASONAL_KEYS, SEASONAL_ATMOSPHERES } from "@/lib/seasonalConstants";
import { loadPageDraftAction, savePageDraftAction, publishPageConfigAction, discardPageDraftAction } from "@/app/actions/editor";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
}

interface Props {
  initialPage: string;
  initialSections: StorefrontSection[];
  mediaAssets: MediaAsset[];
  adminRole: string;
}

export function StorefrontVisualEditorClient({ initialPage, initialSections, mediaAssets, adminRole }: Props) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sections, setSections] = useState<StorefrontSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialSections[0]?.id || null);

  // History Undo/Redo stack
  const [history, setHistory] = useState<StorefrontSection[][]>([initialSections]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Canvas Viewport & Seasonal Preview
  const [deviceViewport, setDeviceViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [seasonPreview, setSeasonPreview] = useState("default");

  // Save & Publish Status
  const [draftStatus, setDraftStatus] = useState<"SAVED" | "DIRTY" | "SAVING" | "ERROR">("SAVED");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync sections changes with iframe preview canvas
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "STOREFRONT_EDITOR_UPDATE", sections },
        "*"
      );
    }
  }, [sections, seasonPreview]);

  // Sync selected section highlight with iframe preview canvas
  useEffect(() => {
    if (iframeRef.current?.contentWindow && selectedSectionId) {
      iframeRef.current.contentWindow.postMessage(
        { type: "STOREFRONT_EDITOR_SELECT_SECTION", sectionId: selectedSectionId },
        "*"
      );
    }
  }, [selectedSectionId]);

  // Listen for canvas selection postMessages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "STOREFRONT_CANVAS_SELECT_SECTION") {
        setSelectedSectionId(event.data.sectionId);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateSections = (newSections: StorefrontSection[]) => {
    setSections(newSections);
    setDraftStatus("DIRTY");

    // Add to history stack
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(newSections);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setSections(prev);
      setDraftStatus("DIRTY");
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setSections(next);
      setDraftStatus("DIRTY");
    }
  };

  const handlePageChange = async (newPage: string) => {
    if (draftStatus === "DIRTY") {
      if (!confirm("You have unsaved draft changes. Switch page anyway?")) return;
    }

    setCurrentPage(newPage);
    setDraftStatus("SAVING");
    const res = await loadPageDraftAction(newPage);
    if ("sections" in res && res.sections) {
      setSections(res.sections);
      setHistory([res.sections]);
      setHistoryIdx(0);
      setSelectedSectionId(res.sections[0]?.id || null);
    }
    setDraftStatus("SAVED");
  };

  const handleSaveDraft = async () => {
    setDraftStatus("SAVING");
    const res = await savePageDraftAction(currentPage, sections);
    if (res.error) {
      alert(res.error);
      setDraftStatus("ERROR");
    } else {
      setDraftStatus("SAVED");
    }
  };

  const handlePublish = async () => {
    if (adminRole !== "SUPER_ADMIN") {
      alert("Unauthorized. Super Admin role is required to publish storefront changes live.");
      return;
    }

    setIsPublishing(true);
    // First save current draft
    await savePageDraftAction(currentPage, sections);

    // Promote draft to published
    const res = await publishPageConfigAction(currentPage);
    setIsPublishing(false);

    if (res.error) {
      alert(res.error);
    } else {
      setPublishModalOpen(false);
      setDraftStatus("SAVED");
      alert(`Page "${currentPage.toUpperCase()}" published live! Storefront updated dynamically.`);
    }
  };

  const handleDiscardDraft = async () => {
    if (!confirm("Discard unsaved draft changes and reload published version?")) return;
    const res = await discardPageDraftAction(currentPage);
    if (res.sections) {
      setSections(res.sections);
      setHistory([res.sections]);
      setHistoryIdx(0);
      setDraftStatus("SAVED");
    }
  };

  const moveSection = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Recalculate displayOrder
    const reordered = newSections.map((s, i) => ({ ...s, displayOrder: i + 1 }));
    updateSections(reordered);
  };

  const toggleSectionVisibility = (id: string) => {
    const newSections = sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s);
    updateSections(newSections);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const updateSelectedSectionProp = (key: string, val: any) => {
    if (!selectedSectionId) return;
    const newSections = sections.map((s) => s.id === selectedSectionId ? { ...s, [key]: val } : s);
    updateSections(newSections);
  };

  const getCanvasWidthClass = () => {
    switch (deviceViewport) {
      case "mobile": return "w-[375px] h-[667px]";
      case "tablet": return "w-[768px] h-[900px]";
      default: return "w-full h-full max-w-[1440px]";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B0508] text-[#F6F2EB] font-sans overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 bg-[#12080C] border-b border-[#D4AF37]/20 px-6 flex items-center justify-between shrink-0 z-40">
          {/* History Toggle Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1 bg-[#8A1538] hover:bg-[#A81B45] text-xs text-white rounded"
          >
            History
          </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">Visual Studio</span>
            <select
              value={currentPage}
              onChange={(e) => handlePageChange(e.target.value)}
              className="bg-black/40 border border-white/20 text-white font-serif font-bold text-sm px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="homepage">Homepage</option>
              <option value="men">Men's Collection</option>
              <option value="women">Women's Collection</option>
              <option value="about">About Us</option>
              <option value="footer">Global Footer</option>
            </select>
          </div>

          {/* Device Viewport Selector */}
          <div className="bg-black/30 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button onClick={() => setDeviceViewport("desktop")} className={`p-1.5 rounded-lg transition-all ${deviceViewport === "desktop" ? "bg-[#8A1538] text-white" : "text-white/60 hover:text-white"}`} title="Desktop View (1440px)"><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setDeviceViewport("tablet")} className={`p-1.5 rounded-lg transition-all ${deviceViewport === "tablet" ? "bg-[#8A1538] text-white" : "text-white/60 hover:text-white"}`} title="Tablet View (768px)"><Tablet className="w-4 h-4" /></button>
            <button onClick={() => setDeviceViewport("mobile")} className={`p-1.5 rounded-lg transition-all ${deviceViewport === "mobile" ? "bg-[#8A1538] text-white" : "text-white/60 hover:text-white"}`} title="Mobile View (375px)"><Smartphone className="w-4 h-4" /></button>
          </div>

          {/* Seasonal Experience Preview Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={seasonPreview}
              onChange={(e) => setSeasonPreview(e.target.value)}
              className="bg-black/30 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-xs px-3 py-1.5 rounded-xl focus:outline-none"
            >
              {SUPPORTED_SEASONAL_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SEASONAL_ATMOSPHERES[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & Draft Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <button onClick={handleUndo} disabled={historyIdx === 0} className="p-2 text-white/70 hover:text-white disabled:opacity-30" title="Undo Edit"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={handleRedo} disabled={historyIdx === history.length - 1} className="p-2 text-white/70 hover:text-white disabled:opacity-30" title="Redo Edit"><RotateCw className="w-4 h-4" /></button>
          </div>

          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
            draftStatus === "SAVED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
          }`}>
            {draftStatus === "SAVED" ? "Draft Saved" : "Unsaved Edits"}
          </span>

          <button onClick={handleSaveDraft} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-[#D4AF37]" /> Save Draft
          </button>

          <button onClick={() => setPublishModalOpen(true)} className="px-5 py-2 bg-[#8A1538] hover:bg-[#A81B45] text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-[#D4AF37]/30 transition-all shadow-md flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" /> Publish Live
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
          {/* Version History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#12080C] text-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-[#D4AF37]/30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">Version History</h3>
                  <button onClick={() => setShowHistoryModal(false)} className="text-white/60 hover:text-white">✕</button>
                </div>
                <VersionHistoryPanel
                  page={currentPage}
                  onRollbackSuccess={async () => {
                    // Reload draft after successful rollback
                    const res = await loadPageDraftAction(currentPage);
                    if ("sections" in res && res.sections) {
                      setSections(res.sections);
                      setHistory([res.sections]);
                      setHistoryIdx(0);
                      setSelectedSectionId(res.sections[0]?.id || null);
                      setDraftStatus("SAVED");
                    }
                    setShowHistoryModal(false);
                  }}
                />
              </div>
            </div>
          )}
        {/* Left Sidebar: Layers & Sections Tree */}
        <aside className="w-72 bg-[#12080C] border-r border-[#D4AF37]/20 flex flex-col justify-between shrink-0 font-sans z-30">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" /> Page Layers ({sections.length})
              </h3>
            </div>

            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      isSelected
                        ? "bg-[#8A1538] border-[#D4AF37]/40 text-white shadow-md"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="font-bold block truncate">{sec.title || sec.type}</span>
                      <span className="text-[9px] uppercase tracking-wider text-white/50">{sec.type}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.id); }} className={`p-1 rounded ${sec.visible ? "text-emerald-400" : "text-white/30"}`} title={sec.visible ? "Hide Section" : "Show Section"}>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }} disabled={idx === 0} className="p-1 text-white/50 hover:text-white disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }} disabled={idx === sections.length - 1} className="p-1 text-white/50 hover:text-white disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Live Canvas Sandbox */}
        <main className="flex-1 bg-black/80 p-6 flex items-center justify-center overflow-auto relative">
          <div className={`transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-[#12080C] ${getCanvasWidthClass()}`}>
            <iframe
              ref={iframeRef}
              src={`/admin/editor/preview?page=${currentPage}&season=${seasonPreview}`}
              className="w-full h-full border-none"
              title="Storefront Preview Canvas"
            />
          </div>
        </main>

        {/* Right Sidebar: Contextual Property Inspector */}
        <aside className="w-80 bg-[#12080C] border-l border-[#D4AF37]/20 flex flex-col justify-between shrink-0 font-sans z-30 p-4 space-y-4 overflow-y-auto">
          {!selectedSection ? (
            <div className="text-center p-8 text-white/40 space-y-2">
              <Sliders className="w-8 h-8 mx-auto" />
              <p className="text-xs">Select a section layer from left panel or canvas to edit properties.</p>
            </div>
          ) : (
            <div className="space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">Property Inspector</span>
                <h3 className="font-serif text-base font-bold text-white">{selectedSection.type}</h3>
              </div>

              {/* Text Properties */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[#D4AF37] text-[10px] flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Content & Copy
                </h4>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Badge</label>
                  <input type="text" value={selectedSection.badge || ""} onChange={(e) => updateSelectedSectionProp("badge", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Title *</label>
                  <input type="text" value={selectedSection.title || ""} onChange={(e) => updateSelectedSectionProp("title", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Subtitle</label>
                  <input type="text" value={selectedSection.subtitle || ""} onChange={(e) => updateSelectedSectionProp("subtitle", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none" />
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Description</label>
                  <textarea rows={2} value={selectedSection.description || ""} onChange={(e) => updateSelectedSectionProp("description", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-white/60 font-bold uppercase mb-1">CTA Text</label>
                    <input type="text" value={selectedSection.ctaText || ""} onChange={(e) => updateSelectedSectionProp("ctaText", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-white/60 font-bold uppercase mb-1">CTA Link</label>
                    <input type="text" value={selectedSection.ctaLink || ""} onChange={(e) => updateSelectedSectionProp("ctaLink", e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Media Asset Picker */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="font-bold uppercase tracking-wider text-[#D4AF37] text-[10px] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Imagery
                </h4>

                {selectedSection.image && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20">
                    <Image src={selectedSection.image} alt="Section Media" fill className="object-cover" />
                  </div>
                )}

                <button onClick={() => setMediaPickerOpen(true)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded-xl border border-white/20 flex items-center justify-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Choose from Media Library
                </button>
              </div>

              {/* Motion & Preset Effects */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="font-bold uppercase tracking-wider text-[#D4AF37] text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Curated Motion Presets
                </h4>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Entrance Animation</label>
                  <select
                    value={selectedSection.motionPreset || "FADE_UP"}
                    onChange={(e) => updateSelectedSectionProp("motionPreset", e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                  >
                    <option value="NONE">None</option>
                    <option value="FADE_UP">Fade Up</option>
                    <option value="REVEAL">Reveal</option>
                    <option value="STAGGER">Stagger Cards</option>
                    <option value="PARALLAX">Subtle Parallax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase mb-1">Atmospheric Style Token</label>
                  <select
                    value={selectedSection.stylePreset || "DARK_ROYAL"}
                    onChange={(e) => updateSelectedSectionProp("stylePreset", e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none"
                  >
                    <option value="DARK_ROYAL">Dark Velvet & Gold</option>
                    <option value="LIGHT_GOLD">Light Champagne Gold</option>
                    <option value="GLASS">Glassmorphism Overlay</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Publish Confirmation Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12080C] text-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#D4AF37]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">Publish Storefront Changes</h3>
              <button onClick={() => setPublishModalOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <p className="leading-relaxed">You are about to promote the current <strong className="text-[#D4AF37] uppercase">{currentPage}</strong> draft configuration to live production.</p>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 font-mono text-[11px]">
                <p>⚡ Page: {currentPage}</p>
                <p>📦 Active Sections: {sections.filter((s) => s.visible).length}</p>
                <p>🔒 Admin Role: {adminRole}</p>
              </div>

              <p className="text-[11px] text-amber-300 italic">Customers will immediately see this updated layout without code changes.</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setPublishModalOpen(false)} className="px-4 py-2 bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs">Cancel</button>
              <button onClick={handlePublish} disabled={isPublishing} className="px-5 py-2 bg-[#8A1538] hover:bg-[#A81B45] text-white font-bold uppercase tracking-widest rounded-xl text-xs flex items-center gap-2 shadow-lg">
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Upload className="w-4 h-4 text-[#D4AF37]" />} Confirm & Publish Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12080C] text-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col border border-[#D4AF37]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">Select Section Image from Media Library</h3>
              <button onClick={() => setMediaPickerOpen(false)} className="text-white/60 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto flex-1">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    updateSelectedSectionProp("image", asset.url);
                    updateSelectedSectionProp("mediaAssetId", asset.id);
                    setMediaPickerOpen(false);
                  }}
                  className="relative aspect-square border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:scale-105 transition-all"
                >
                  <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
