"use client";

import { useState } from "react";
import {
  Plus, Search, Filter, Copy, Archive, RotateCcw, Trash2, Edit3, Image as ImageIcon,
  CheckCircle2, Sparkles, AlertCircle, Loader2, ArrowUpDown, Tag, Eye
} from "lucide-react";
import Image from "next/image";
import {
  createProductAction, updateProductAction, duplicateProductAction, archiveProductAction,
  restoreProductAction, deleteProductAction, bulkArchiveProductsAction, generateSkuAction
} from "@/app/actions/products";
import { MEDIA_FOLDERS } from "@/lib/mediaConstants";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/placeholders";
import { CATALOGUES } from "@/lib/catalogues";

interface ProductItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  promoPrice?: number | null;
  discount?: number | null;
  description: string;
  craftsmanship?: string | null;
  category: string;
  gender: string;
  status: string;
  featured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFestivalExclusive: boolean;
  material?: string | null;
  colors?: string | null;
  occasion?: string | null;
  care?: string | null;
  sizeGuide?: string | null;
  sizes?: string | null;
  collectionId?: string | null;
  collection?: { id: string; title: string } | null;
  images: { id: string; url: string }[];
  updatedAt?: any;
}

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
}

interface Props {
  initialProducts: ProductItem[];
  collections: { id: string; title: string }[];
  categories: { id: string; name: string }[];
  mediaAssets: MediaAsset[];
}

export function ProductCatalogClient({ initialProducts, collections, categories, mediaAssets }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<"title" | "price" | "status">("title");

  // Editor Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "pricing" | "content" | "publishing">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formOccasion, setFormOccasion] = useState("");
  const [formCollectionId, setFormCollectionId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formPromoPrice, setFormPromoPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCraftsmanship, setFormCraftsmanship] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formColors, setFormColors] = useState("");
  const [formSizes, setFormSizes] = useState("");
  const [formCare, setFormCare] = useState("");
  const [formStatus, setFormStatus] = useState("DRAFT");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [formBestSeller, setFormBestSeller] = useState(false);

  // Filtered & Sorted Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesGender = filterGender === "all" || p.gender.toLowerCase() === filterGender.toLowerCase();
    const matchesStatus = filterStatus === "all" || p.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesGender && matchesStatus;
  });

  const openNewEditor = async () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormGender("");
    setFormCategory("");
    setFormOccasion("");
    setFormCollectionId("");
    setFormPrice("");
    setFormPromoPrice("");
    setFormDescription("");
    setFormCraftsmanship("");
    setFormMaterial("");
    setFormColors("");
    setFormSizes("");
    setFormCare("");
    setFormStatus("DRAFT");
    setFormImages([]);
    setFormFeatured(false);
    setFormNewArrival(false);
    setFormBestSeller(false);
    setActiveTab("general");

    setFormSku("");
    setEditorOpen(true);
  };

  const openEditEditor = (p: ProductItem) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormSku(p.sku || "");
    setFormGender(p.gender);
    setFormCategory(p.category);
    setFormOccasion(p.occasion || "");
    setFormCollectionId(p.collectionId || "");
    setFormPrice(p.price.toString());
    setFormPromoPrice(p.promoPrice ? p.promoPrice.toString() : "");
    setFormDescription(p.description);
    setFormCraftsmanship(p.craftsmanship || "");
    setFormMaterial(p.material || "");
    setFormColors(p.colors || "");
    setFormSizes(p.sizes || "");
    setFormCare(p.care || "");
    setFormStatus(p.status);
    setFormImages(p.images.map((img) => img.url));
    setFormFeatured(p.featured);
    setFormNewArrival(p.isNewArrival);
    setFormBestSeller(p.isBestSeller);
    setActiveTab("general");
    setEditorOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formTitle || !formPrice) {
      alert("Title and Display Price are required.");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", formTitle);
    fd.append("sku", formSku);
    fd.append("gender", formGender);
    fd.append("category", formCategory);
    fd.append("occasion", formOccasion);
    fd.append("collectionId", formCollectionId);
    fd.append("price", formPrice);
    if (formPromoPrice) fd.append("promoPrice", formPromoPrice);
    fd.append("description", formDescription);
    fd.append("craftsmanship", formCraftsmanship);
    fd.append("material", formMaterial);
    fd.append("colors", formColors);
    fd.append("sizes", formSizes);
    fd.append("care", formCare);
    fd.append("status", formStatus);
    fd.append("featured", formFeatured ? "true" : "false");
    fd.append("isNewArrival", formNewArrival ? "true" : "false");
    fd.append("isBestSeller", formBestSeller ? "true" : "false");
    fd.append("images", JSON.stringify(formImages));

    const res = editingProduct
      ? await updateProductAction(editingProduct.id, fd)
      : await createProductAction(fd);

    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setEditorOpen(false);
      window.location.reload();
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this product?")) return;
    const res = await duplicateProductAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleArchive = async (id: string) => {
    const res = await archiveProductAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleRestore = async (id: string) => {
    const res = await restoreProductAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    const res = await deleteProductAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Archive ${selectedIds.length} selected products?`)) return;
    const res = await bulkArchiveProductsAction(selectedIds);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Product Catalogue Manager</h1>
          <p className="text-xs text-gray-500">Manage handcrafted Jutti models, SKU codes, pricing, and storefront publication states.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkArchive}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <Archive className="w-4 h-4" /> Bulk Archive ({selectedIds.length})
            </button>
          )}

          <button
            onClick={openNewEditor}
            className="px-5 py-2.5 bg-[#8A1538] hover:bg-[#A81B45] text-white border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Create Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-medium"
            />
          </div>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <span className="text-gray-400 text-xs font-medium">Showing {filteredProducts.length} of {products.length} Products</span>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Tag className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-gray-900">No Products Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">No products match your current search or filter criteria. Click "Create Product" to add a new pair.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredProducts.map((p) => p.id));
                        else setSelectedIds([]);
                      }}
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                    />
                  </th>
                  <th className="p-4">Image</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const primaryImage = p.images[0]?.url || PLACEHOLDER_PRODUCT_IMAGE;

                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/80 transition-all ${isSelected ? "bg-amber-50/40" : ""}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                            else setSelectedIds(selectedIds.filter((id) => id !== p.id));
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image src={primaryImage} alt={p.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 block text-sm">{p.title}</span>
                          <span className="text-[11px] text-gray-500">{p.gender} &bull; {p.collection?.title || "No Collection"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-gray-800 px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">{p.sku || "N/A"}</span>
                      </td>
                      <td className="p-4 text-gray-600">{p.category}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-serif font-bold text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                          {p.promoPrice && <span className="text-[10px] text-emerald-600 block font-bold">Promo: ₹{p.promoPrice.toLocaleString("en-IN")}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "ARCHIVED"
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditEditor(p)} title="Edit Product" className="p-2 text-gray-500 hover:text-[#8A1538] hover:bg-gray-100 rounded-lg">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDuplicate(p.id)} title="Duplicate Product" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Copy className="w-4 h-4" />
                          </button>
                          {p.status === "ARCHIVED" ? (
                            <button onClick={() => handleRestore(p.id)} title="Restore Product" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleArchive(p.id)} title="Archive Product" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(p.id)} title="Delete Product" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabbed Product Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 bg-[#12080C] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Product Studio</span>
                <h2 className="font-serif text-xl font-bold">{editingProduct ? `Edit Product: ${editingProduct.title}` : "Create New Product Pair"}</h2>
              </div>
              <button onClick={() => setEditorOpen(false)} className="text-white/60 hover:text-white text-lg font-bold">✕</button>
            </div>

            {/* Editor Navigation Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 flex overflow-x-auto px-6 font-bold text-xs uppercase tracking-wider">
              <button onClick={() => setActiveTab("general")} className={`py-3.5 px-4 border-b-2 transition-all ${activeTab === "general" ? "border-[#8A1538] text-[#8A1538]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>General Info</button>
              <button onClick={() => setActiveTab("media")} className={`py-3.5 px-4 border-b-2 transition-all ${activeTab === "media" ? "border-[#8A1538] text-[#8A1538]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>Media ({formImages.length})</button>
              <button onClick={() => setActiveTab("pricing")} className={`py-3.5 px-4 border-b-2 transition-all ${activeTab === "pricing" ? "border-[#8A1538] text-[#8A1538]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>Pricing & Collection</button>
              <button onClick={() => setActiveTab("content")} className={`py-3.5 px-4 border-b-2 transition-all ${activeTab === "content" ? "border-[#8A1538] text-[#8A1538]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>Details & Craftsmanship</button>
              <button onClick={() => setActiveTab("publishing")} className={`py-3.5 px-4 border-b-2 transition-all ${activeTab === "publishing" ? "border-[#8A1538] text-[#8A1538]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>Publishing</button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Product Title *</label>
                      <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Use the product's actual name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]" />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Product SKU Code (optional)</label>
                      <div className="flex gap-2">
                        <input type="text" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="FF-M-WED-0001" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#C5A059]" />
                        <button type="button" onClick={async () => { const res = await generateSkuAction(formGender, formCategory); if (res.sku) setFormSku(res.sku); }} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl shrink-0">Auto SKU</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Gender</label>
                      <select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
                        <option value="">Select fit category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
                        <option value="">{categories.length === 0 ? "No categories defined yet" : "— Select category —"}</option>
                        {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                        {/* Keep an existing value selectable so editing a product never silently rewrites its category. */}
                        {formCategory && !categories.some((c) => c.name === formCategory) && (
                          <option value={formCategory}>{formCategory} (current)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Catalogue</label>
                      <select value={formOccasion} onChange={(e) => setFormOccasion(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
                        <option value="">Select catalogue</option>
                        {CATALOGUES.map((catalogue) => (<option key={catalogue.slug} value={catalogue.name}>{catalogue.name}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 uppercase">Product Image Gallery</h4>
                      <p className="text-gray-500">Select images directly from the Centralized Media Library.</p>
                    </div>
                    <button type="button" onClick={() => setMediaPickerOpen(true)} className="px-4 py-2 bg-[#8A1538] text-white font-bold uppercase tracking-wider rounded-xl flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Select from Media Library
                    </button>
                  </div>

                  {formImages.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-gray-500">No images selected yet. Click button above to choose from Media Library.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group">
                          <Image src={imgUrl} alt={`Product ${idx + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))} className="p-1.5 bg-rose-600 text-white rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Display Price (₹) *</label>
                      <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="4999" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] font-mono" />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Promotional Price (₹)</label>
                      <input type="number" value={formPromoPrice} onChange={(e) => setFormPromoPrice(e.target.value)} placeholder="3999" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Collection Assignment</label>
                    <select value={formCollectionId} onChange={(e) => setFormCollectionId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
                      <option value="">No Collection</option>
                      {collections.map((col) => (<option key={col.id} value={col.id}>{col.title}</option>))}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                    <textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe this product using verified details" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Craftsmanship Details</label>
                    <textarea rows={2} value={formCraftsmanship} onChange={(e) => setFormCraftsmanship(e.target.value)} placeholder="Add confirmed craftsmanship details, if available" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Materials</label>
                      <input type="text" value={formMaterial} onChange={(e) => setFormMaterial(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Colours</label>
                      <input type="text" value={formColors} onChange={(e) => setFormColors(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Available Sizes</label>
                    <input type="text" value={formSizes} onChange={(e) => setFormSizes(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none" />
                  </div>
                </div>
              )}

              {activeTab === "publishing" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Publication Status</label>
                    <div className="flex gap-4">
                      {["DRAFT", "PUBLISHED", "ARCHIVED"].map((st) => (
                        <label key={st} className={`flex-1 p-4 rounded-xl border flex items-center justify-between cursor-pointer ${formStatus === st ? "bg-amber-50 border-[#C5A059]" : "bg-gray-50 border-gray-200"}`}>
                          <span className="font-bold text-xs">{st}</span>
                          <input type="radio" name="status" value={st} checked={formStatus === st} onChange={() => setFormStatus(st)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formNewArrival} onChange={(e) => setFormNewArrival(e.target.checked)} />
                      <span className="font-bold text-xs text-gray-800">Mark as New Arrival</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formBestSeller} onChange={(e) => setFormBestSeller(e.target.checked)} />
                      <span className="font-bold text-xs text-gray-800">Mark as Best Seller</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} />
                      <span className="font-bold text-xs text-gray-800">Feature on Homepage</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditorOpen(false)} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold uppercase tracking-wider rounded-xl text-xs">Cancel</button>
              <button onClick={handleSaveProduct} disabled={isSubmitting} className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#A81B45] text-white font-bold uppercase tracking-widest rounded-xl text-xs shadow border border-[#D4AF37]/30 flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">Select Image from Media Library</h3>
              <button onClick={() => setMediaPickerOpen(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto flex-1">
              {mediaAssets.map((asset) => (
                <div key={asset.id} onClick={() => { setFormImages([...formImages, asset.url]); setMediaPickerOpen(false); }} className="relative aspect-square border rounded-xl overflow-hidden cursor-pointer hover:border-[#8A1538] hover:scale-105 transition-all">
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
