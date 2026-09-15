"use client";

import { useState } from "react";
import { Folder, Upload, Search, Tag, Eye, Trash2, Edit3, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { createMediaAsset, updateMediaAsset, deleteMediaAsset } from "@/app/actions/media";
import { MEDIA_FOLDERS } from "@/lib/mediaConstants";

interface MediaAsset {
  id: string;
  name: string;
  filename: string;
  url: string;
  altText?: string | null;
  folder: string;
  status: string;
  usedIn?: string | null;
  createdAt: any;
}

export function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadFolder, setUploadFolder] = useState("branding");
  const [loading, setLoading] = useState(false);

  const filteredAssets = initialAssets.filter((a) => {
    const matchesFolder = selectedFolder === "all" || a.folder === selectedFolder;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.folder.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", uploadName || "New Media Asset");
    formData.append("url", uploadUrl);
    formData.append("folder", uploadFolder);

    const res = await createMediaAsset(formData);
    setLoading(false);

    if (res.success && res.asset) {
      setIsUploading(false);
      setUploadUrl("");
      setUploadName("");
      window.location.reload();
    } else {
      alert(res.error || "Failed to upload asset");
    }
  };

  const handleStatusToggle = async (asset: MediaAsset) => {
    const nextStatus = asset.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const formData = new FormData();
    formData.append("status", nextStatus);

    const res = await updateMediaAsset(asset.id, formData);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    const res = await deleteMediaAsset(assetId);
    if (res.success) {
      setSelectedAsset(null);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-xs text-gray-500">Single Source of Truth asset manager integrated with Storefront contract</p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="px-5 py-3 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#D4AF37]/30 flex items-center gap-2"
        >
          <Upload className="w-4 h-4 text-[#D4AF37]" /> Add New Asset
        </button>
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-5">
            <h3 className="font-serif text-2xl font-bold">Register Media Asset</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Header Logo"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Asset URL / Image Path</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-gray-500 mb-1">Target Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] font-medium"
                >
                  {MEDIA_FOLDERS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#8A1538] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Folders Navigation & Search */}
        <div className="lg:col-span-3 space-y-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block px-2 mb-1">Folders</span>
            
            <button
              onClick={() => setSelectedFolder("all")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "all" ? "bg-[#8A1538] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2"><Folder className="w-4 h-4" /> All Folders</span>
              <span className="text-[10px] opacity-75 font-mono">{initialAssets.length}</span>
            </button>

            {MEDIA_FOLDERS.map((f) => {
              const count = initialAssets.filter(a => a.folder === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolder(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedFolder === f.id ? "bg-[#8A1538] text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate"><Folder className="w-4 h-4 text-amber-500" /> {f.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Assets Grid */}
        <div className="lg:col-span-9 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              let usedInList: string[] = [];
              if (asset.usedIn) {
                try {
                  usedInList = JSON.parse(asset.usedIn);
                } catch {
                  usedInList = [];
                }
              }

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                    selectedAsset?.id === asset.id ? "ring-2 ring-[#8A1538] border-[#8A1538]" : "border-gray-200"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <Image src={asset.url} alt={asset.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                    
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      asset.status === "PUBLISHED" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className="font-semibold text-xs text-gray-900 truncate">{asset.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block">{asset.folder}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssets.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <Folder className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-600">No media assets found in this folder.</p>
            </div>
          )}
        </div>
      </div>

      {/* Asset Inspector Detail Drawer */}
      {selectedAsset && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white border-l border-gray-200 shadow-2xl z-40 p-6 space-y-6 overflow-y-auto font-sans">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-serif text-lg font-bold text-gray-900">Asset Inspector</h3>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image src={selectedAsset.url} alt={selectedAsset.name} fill className="object-cover" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Name</span>
              <p className="font-bold text-gray-900">{selectedAsset.name}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Folder</span>
              <p className="font-medium text-amber-800 uppercase tracking-wider">{selectedAsset.folder}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Storefront Dependent Usages</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedAsset.usedIn ? (
                  JSON.parse(selectedAsset.usedIn).map((loc: string) => (
                    <span key={loc} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold border border-purple-100">
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Global Media Library</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => handleStatusToggle(selectedAsset)}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Toggle Status ({selectedAsset.status})
            </button>

            <button
              onClick={() => handleDelete(selectedAsset.id)}
              className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
