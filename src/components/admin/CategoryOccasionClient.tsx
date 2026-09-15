"use client";

import { useState } from "react";
import { Plus, Tags, Sparkles, Trash2, ShieldAlert } from "lucide-react";
import { createCategoryAction, deleteCategoryAction, createOccasionAction, deleteOccasionAction } from "@/app/actions/categories";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount: number;
}

interface OccasionItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount: number;
}

export function CategoryOccasionClient({ categories, occasions }: { categories: CategoryItem[]; occasions: OccasionItem[] }) {
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [occName, setOccName] = useState("");
  const [occDesc, setOccDesc] = useState("");

  const handleAddCategory = async () => {
    if (!catName) return;
    const fd = new FormData();
    fd.append("name", catName);
    fd.append("description", catDesc);
    const res = await createCategoryAction(fd);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const res = await deleteCategoryAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleAddOccasion = async () => {
    if (!occName) return;
    const fd = new FormData();
    fd.append("name", occName);
    fd.append("description", occDesc);
    const res = await createOccasionAction(fd);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!confirm("Delete occasion?")) return;
    const res = await deleteOccasionAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Categories & Occasions Studio</h1>
        <p className="text-xs text-gray-500">Manage core product classifications and occasion groupings with delete protection for active products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tags className="w-5 h-5 text-[#8A1538]" /> Product Categories ({categories.length})
            </h3>
          </div>

          <div className="flex gap-2 text-xs">
            <input type="text" placeholder="New Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]" />
            <button onClick={handleAddCategory} className="px-4 py-2 bg-[#8A1538] text-white font-bold uppercase tracking-wider rounded-xl shrink-0">Add Category</button>
          </div>

          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">slug: {c.slug} &bull; {c.productCount} active products</span>
                </div>
                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Occasions Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Occasions ({occasions.length})
            </h3>
          </div>

          <div className="flex gap-2 text-xs">
            <input type="text" placeholder="New Occasion Name" value={occName} onChange={(e) => setOccName(e.target.value)} className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059]" />
            <button onClick={handleAddOccasion} className="px-4 py-2 bg-[#12080C] text-white font-bold uppercase tracking-wider rounded-xl shrink-0">Add Occasion</button>
          </div>

          <div className="space-y-2">
            {occasions.map((o) => (
              <div key={o.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{o.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">slug: {o.slug} &bull; {o.productCount} active products</span>
                </div>
                <button onClick={() => handleDeleteOccasion(o.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
