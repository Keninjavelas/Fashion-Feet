"use client";

import { useState } from "react";
import { Plus, FolderTree, Edit3, Trash2, CheckCircle2, Image as ImageIcon, Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { createCollectionAction, updateCollectionAction, deleteCollectionAction, assignProductsToCollectionAction } from "@/app/actions/collections";
import { PLACEHOLDER_PRODUCT_IMAGE, PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

interface CollectionItem {
  id: string;
  title: string;
  description?: string | null;
  banner?: string | null;
  thumbnail?: string | null;
  status: string;
  visible: boolean;
  displayOrder: number;
  products: { id: string; title: string; sku: string; price: number }[];
}

interface ProductOption {
  id: string;
  title: string;
  sku: string;
  collectionId?: string | null;
}

export function CollectionManagerClient({ initialCollections, allProducts }: { initialCollections: CollectionItem[]; allProducts: ProductOption[] }) {
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [visible, setVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNewModal = () => {
    setEditingCollection(null);
    setTitle("");
    setDescription("");
    setBanner(PLACEHOLDER_HOMEPAGE_IMAGE);
    setThumbnail(PLACEHOLDER_PRODUCT_IMAGE);
    setStatus("DRAFT");
    setVisible(true);
    setDisplayOrder(0);
    setSelectedProductIds([]);
    setModalOpen(true);
  };

  const openEditModal = (col: CollectionItem) => {
    setEditingCollection(col);
    setTitle(col.title);
    setDescription(col.description || "");
    setBanner(col.banner || "");
    setThumbnail(col.thumbnail || "");
    setStatus(col.status);
    setVisible(col.visible);
    setDisplayOrder(col.displayOrder);
    setSelectedProductIds(col.products.map((p) => p.id));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title) {
      alert("Collection Title is required.");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("banner", banner);
    fd.append("thumbnail", thumbnail);
    fd.append("status", status);
    fd.append("visible", String(visible));
    fd.append("displayOrder", String(displayOrder));

    const res = editingCollection
      ? await updateCollectionAction(editingCollection.id, fd)
      : await createCollectionAction(fd);

    if (res.collection?.id) {
      await assignProductsToCollectionAction(res.collection.id, selectedProductIds);
    }

    setIsSubmitting(false);

    if (res.error) alert(res.error);
    else {
      setModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    const res = await deleteCollectionAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Collections Manager</h1>
          <p className="text-xs text-gray-500">Organize handcrafted Juttis into curated occasion and seasonal collections.</p>
        </div>

        <button onClick={openNewModal} className="px-5 py-2.5 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow border border-[#D4AF37]/30 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#D4AF37]" /> Create Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div key={col.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="relative h-44 bg-gray-100">
              {col.banner ? (
                <Image src={col.banner} alt={col.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                  <FolderTree className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-5 text-white">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full w-fit ${col.status === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                  {col.status}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">{col.title}</h3>
                  <p className="text-white/80 text-xs font-medium">{col.products.length} Products Assigned</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-gray-600 line-clamp-2">{col.description || "No description provided."}</p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button onClick={() => openEditModal(col)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(col.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">{editingCollection ? `Edit Collection: ${editingCollection.title}` : "Create New Collection"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Collection Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Royal Wedding Collection" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-[#C5A059]" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bespoke bridal and groom Juttis..." className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Publication status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl">
                    <option value="DRAFT">Draft (private)</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Display order</label>
                  <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl" />
                </div>
              </div>
              <label className="flex items-center gap-2 font-semibold text-gray-700">
                <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                Visible when published
              </label>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Banner Image URL</label>
                <input type="text" value={banner} onChange={(e) => setBanner(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Card Thumbnail URL</label>
                <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Assign Products ({selectedProductIds.length})</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-1.5 bg-gray-50">
                  {allProducts.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 cursor-pointer">
                        <span className="font-medium text-gray-900">{p.title} <span className="font-mono text-gray-400">({p.sku})</span></span>
                        <input type="checkbox" checked={isChecked} onChange={(e) => {
                          if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                          else setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                        }} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase tracking-wider rounded-xl text-xs">Cancel</button>
              <button onClick={handleSave} disabled={isSubmitting} className="px-5 py-2 bg-[#8A1538] text-white font-bold uppercase tracking-widest rounded-xl text-xs flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />} Save Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
