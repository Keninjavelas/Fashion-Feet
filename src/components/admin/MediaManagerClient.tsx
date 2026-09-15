"use client";

import { useState, useRef } from "react";
import { 
  Folder, 
  Tag, 
  Home, 
  ShoppingBag, 
  Sparkles, 
  Store, 
  Image as ImageIcon, 
  CheckCircle, 
  FileText, 
  Search, 
  UploadCloud, 
  Star, 
  Trash2, 
  ExternalLink, 
  Check, 
  Eye, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Grid, 
  List, 
  Loader2,
  Send,
  Plus
} from "lucide-react";
import { 
  createMediaAssetAction, 
  updateMediaAssetAction, 
  publishMediaAssetAction, 
  replaceMediaAssetAction, 
  deleteMediaAssetAction, 
  toggleMediaFavoriteAction 
} from "@/app/actions/mediaActions";

interface MediaAssetItem {
  id: string;
  name: string;
  filename: string;
  url: string;
  altText: string | null;
  type: string;
  folder: string;
  fileSize: string | null;
  dimensions: string | null;
  status: string;
  usedIn: string | null;
  isFavorite: boolean;
  createdAt: any;
  updatedAt: any;
}

const FOLDERS = [
  { id: "all", name: "All Assets", icon: ImageIcon },
  { id: "branding", name: "Branding & Logos", icon: Tag, count: 5 },
  { id: "homepage", name: "Homepage Assets", icon: Home, count: 8 },
  { id: "products", name: "Products Gallery", icon: ShoppingBag, count: 12 },
  { id: "collections", name: "Collections Banners", icon: Folder, count: 6 },
  { id: "festivals", name: "Festival Themes", icon: Sparkles, count: 4 },
  { id: "stores", name: "Boutique Stores", icon: Store, count: 3 },
  { id: "backgrounds", name: "Backgrounds", icon: ImageIcon, count: 4 },
  { id: "favorites", name: "Favorites", icon: Star, count: 0 },
  { id: "trash", name: "Trash Bin", icon: Trash2, count: 0 },
];

export function MediaManagerClient({ initialAssets = [] }: { initialAssets: MediaAssetItem[] }) {
  const [assets, setAssets] = useState<MediaAssetItem[]>(initialAssets);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialAssets[0]?.id || null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Edit / Replace state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Filter Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.filename.toLowerCase().includes(search.toLowerCase()) ||
      (asset.altText || "").toLowerCase().includes(search.toLowerCase());

    if (selectedFolder === "favorites") {
      return matchesSearch && asset.isFavorite && asset.status !== "TRASH";
    }
    if (selectedFolder === "trash") {
      return matchesSearch && asset.status === "TRASH";
    }
    if (selectedFolder !== "all") {
      if (asset.folder !== selectedFolder || asset.status === "TRASH") return false;
    } else {
      if (asset.status === "TRASH") return false;
    }

    if (statusFilter === "PUBLISHED") return matchesSearch && asset.status === "PUBLISHED";
    if (statusFilter === "DRAFT") return matchesSearch && asset.status === "DRAFT";

    return matchesSearch;
  });

  // Handle New Asset Upload
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        setLoading(true);
        const folder = selectedFolder !== "all" && selectedFolder !== "trash" && selectedFolder !== "favorites" ? selectedFolder : "branding";
        
        const sizeKb = `${Math.round(file.size / 1024)} KB`;
        const res = await createMediaAssetAction({
          name: file.name.replace(/\.[^/.]+$/, ""),
          filename: file.name,
          url: reader.result,
          altText: file.name,
          folder: folder,
          fileSize: sizeKb,
          dimensions: "1024 x 1024",
          status: "DRAFT" // New uploads enter DRAFT mode
        });

        setLoading(false);
        if (res.asset) {
          setAssets([res.asset as any, ...assets]);
          setSelectedAssetId(res.asset.id);
          setSuccessMsg("Asset uploaded as DRAFT. Click 'Publish' when ready to go live.");
          setTimeout(() => setSuccessMsg(null), 4000);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Replace File
  const handleReplaceFile = (file: File) => {
    if (!selectedAsset) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        setLoading(true);
        const sizeKb = `${Math.round(file.size / 1024)} KB`;
        const res = await replaceMediaAssetAction(selectedAsset.id, reader.result, "1024 x 1024", sizeKb);
        setLoading(false);

        if (res.asset) {
          setAssets(assets.map(a => a.id === selectedAsset.id ? (res.asset as any) : a));
          setSuccessMsg("Asset replaced as DRAFT. Preview storefront or click 'Publish' to push live.");
          setTimeout(() => setSuccessMsg(null), 4000);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Publish Asset
  const handlePublishAsset = async () => {
    if (!selectedAsset) return;
    setLoading(true);
    const res = await publishMediaAssetAction(selectedAsset.id);
    setLoading(false);

    if (res.asset) {
      setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, status: "PUBLISHED" } : a));
      setSuccessMsg("Published! Entire storefront immediately updated.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Save Meta Edits (Name & Alt Text)
  const handleSaveMeta = async () => {
    if (!selectedAsset) return;
    setLoading(true);
    const res = await updateMediaAssetAction(selectedAsset.id, {
      name: editName || selectedAsset.name,
      altText: editAltText
    });
    setLoading(false);

    if (res.asset) {
      setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, name: editName || a.name, altText: editAltText } : a));
      setIsEditingName(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!selectedAsset) return;
    const res = await toggleMediaFavoriteAction(selectedAsset.id);
    if (res.success) {
      setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, isFavorite: !!res.isFavorite } : a));
    }
  };

  // Delete Asset
  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    if (selectedAsset.status !== "TRASH") {
      const usedInList = JSON.parse(selectedAsset.usedIn || "[]");
      if (usedInList.length > 0) {
        if (!confirm(`Warning: This asset is currently used in ${usedInList.join(", ")}. Moving it to trash may affect storefront display. Proceed?`)) return;
      }
    }

    setLoading(true);
    const res = await deleteMediaAssetAction(selectedAsset.id);
    setLoading(false);

    if (res.success) {
      if (selectedAsset.status === "TRASH") {
        setAssets(assets.filter(a => a.id !== selectedAsset.id));
        setSelectedAssetId(assets.find(a => a.id !== selectedAsset.id)?.id || null);
      } else {
        setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, status: "TRASH" } : a));
      }
    }
  };

  // Parse Used In
  const usedInLocations: string[] = selectedAsset?.usedIn ? JSON.parse(selectedAsset.usedIn) : [];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl text-[var(--color-brand-900)] font-bold">Centralized Media Library</h1>
          <p className="text-gray-500 text-sm mt-1">Single source of truth for all visual assets across Fashion Feet Storefront & Admin.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest transition-all rounded-xl shadow-lg border border-[#D4AF37]/30 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
            Upload Asset
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 rounded-xl flex items-center gap-2 font-bold shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Google Drive / Lightroom 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* COLUMN 1: Left Folder Tree (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-black/10 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 pt-1">
            Media Folders
          </div>

          <nav className="space-y-1">
            {FOLDERS.map((folder) => {
              const isActive = selectedFolder === folder.id;
              const Icon = folder.icon;
              const count = assets.filter(a => folder.id === "all" ? a.status !== "TRASH" : folder.id === "favorites" ? a.isFavorite && a.status !== "TRASH" : folder.id === "trash" ? a.status === "TRASH" : a.folder === folder.id && a.status !== "TRASH").length;

              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[var(--color-brand-900)] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#D4AF37]" : "text-gray-500"}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* COLUMN 2: Main Asset Explorer Grid (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search & View Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-black/15 text-xs rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-black/15 text-xs font-bold uppercase tracking-wider text-gray-700 px-3 py-2 rounded-xl bg-gray-50 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Drafts Only</option>
                </select>

                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-black/10">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow text-black" : "text-gray-400"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-400"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Asset Grid / List View */}
            {filteredAssets.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-black/15">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="font-serif text-lg font-bold text-gray-700">No assets found in this folder</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Upload new assets or select another folder from the tree menu.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto pr-1">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setEditName(asset.name);
                        setEditAltText(asset.altText || "");
                      }}
                      className={`group relative bg-gray-50 border-2 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-sm ${
                        isSelected
                          ? "border-[#8A1538] ring-2 ring-[#8A1538]/20 shadow-md"
                          : "border-black/10 hover:border-black/30"
                      }`}
                    >
                      {/* Asset Image */}
                      <div className="relative aspect-square bg-slate-900/5 overflow-hidden flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
                        
                        {/* Status Badge */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full shadow ${
                          asset.status === "PUBLISHED"
                            ? "bg-emerald-600 text-white"
                            : asset.status === "DRAFT"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-600 text-white"
                        }`}>
                          {asset.status}
                        </span>

                        {/* Favorite Star */}
                        {asset.isFavorite && (
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 absolute top-2 right-2 drop-shadow" />
                        )}
                      </div>

                      <div className="p-3 space-y-1 bg-white">
                        <p className="text-xs font-bold text-[var(--color-brand-900)] truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                          <span className="uppercase text-[var(--color-accent-gold)]">{asset.folder}</span>
                          <span>{asset.fileSize || "120 KB"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-black/5 bg-gray-50 rounded-2xl border border-black/10 max-h-[560px] overflow-y-auto">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setEditName(asset.name);
                        setEditAltText(asset.altText || "");
                      }}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-amber-500/10 font-bold" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-brand-900)]">{asset.name}</p>
                          <span className="text-[10px] text-gray-500 uppercase">{asset.folder} &bull; {asset.dimensions || "1024x1024"}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                        asset.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 border-t border-black/5 pt-3 flex justify-between">
            <span>Showing {filteredAssets.length} of {assets.length} visual assets</span>
            <span>Single Source of Truth Media Repository</span>
          </div>
        </div>

        {/* COLUMN 3: Right-Hand Adobe Lightroom Style Asset Inspector (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-6 flex flex-col justify-between">
          {selectedAsset ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-black/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Asset Details Inspector</span>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-full transition-colors ${
                    selectedAsset.isFavorite ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-black"
                  }`}
                  title="Toggle Favorite"
                >
                  <Star className={`w-4 h-4 ${selectedAsset.isFavorite ? "fill-amber-400" : ""}`} />
                </button>
              </div>

              {/* Large Asset Preview Box */}
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-black/10 shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-full object-contain" />
                
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open Full Image"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Editable Name & Alt Text */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Asset Name</label>
                    <button
                      onClick={() => {
                        if (isEditingName) handleSaveMeta();
                        else {
                          setEditName(selectedAsset.name);
                          setEditAltText(selectedAsset.altText || "");
                          setIsEditingName(true);
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-[var(--color-brand-900)] hover:underline"
                    >
                      {isEditingName ? "Save" : "Edit"}
                    </button>
                  </div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-black/20 text-xs rounded-lg font-bold"
                    />
                  ) : (
                    <p className="text-sm font-serif font-bold text-[var(--color-brand-900)] truncate">{selectedAsset.name}</p>
                  )}
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl text-[11px] font-medium text-gray-600 border border-black/5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Dimensions</span>
                    <span className="font-mono text-black font-bold">{selectedAsset.dimensions || "1024 x 1024"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">File Size</span>
                    <span className="font-mono text-black font-bold">{selectedAsset.fileSize || "145 KB"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Folder</span>
                    <span className="uppercase text-[#8A1538] font-bold">{selectedAsset.folder}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Status</span>
                    <span className={`font-bold uppercase ${selectedAsset.status === "PUBLISHED" ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedAsset.status}
                    </span>
                  </div>
                </div>

                {/* DEPENDENCY TRACKING: "USED IN" SECTION */}
                <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                    <span>Used In Storefront ({usedInLocations.length})</span>
                  </div>

                  {usedInLocations.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">Not directly bound to a live component yet.</p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-gray-700 font-medium">
                      {usedInLocations.map((loc, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A1538]" />
                          <span>{loc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-black/10">
                {selectedAsset.status === "DRAFT" && (
                  <button
                    onClick={handlePublishAsset}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Publish to Storefront
                  </button>
                )}

                <input
                  type="file"
                  ref={replaceInputRef}
                  onChange={(e) => e.target.files?.[0] && handleReplaceFile(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => replaceInputRef.current?.click()}
                  disabled={loading}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-black/10 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" /> Replace Image (Draft)
                </button>

                <button
                  onClick={handleDeleteAsset}
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-rose-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  {selectedAsset.status === "TRASH" ? "Delete Permanently" : "Move to Trash"}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 text-xs">
              Select an asset from the grid to inspect details and dependency locations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
