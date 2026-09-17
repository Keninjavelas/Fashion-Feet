"use client";

import { useState } from "react";
import { Plus, Store as StoreIcon, MapPin, Phone, Mail, Clock, Edit3, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createStoreAction, updateStoreAction, deleteStoreAction } from "@/app/actions/stores";

interface StoreItem {
  id: string;
  name: string;
  code?: string | null;
  type: string;
  status: string;
  city: string;
  state: string;
  country: string;
  street?: string | null;
  pinCode?: string | null;
  googleMapsUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  openingHours?: string | null;
  services?: string | null;
  photos?: string | null;
}

export function StoreManagerClient({ initialStores, currentAdminRole }: { initialStores: StoreItem[]; currentAdminRole: string }) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("FLAGSHIP");
  // DRAFT, not OPEN: a half-finished store must never be customer-visible the moment
  // it is saved. `openNewModal` sets this too — both are deliberate so no future code
  // path can open the form with a publishable default.
  const [status, setStatus] = useState("DRAFT");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [street, setStreet] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [openingHours, setOpeningHours] = useState("Mon-Sat: 10:00 - 20:00, Sun: Closed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNewModal = () => {
    setEditingStore(null);
    setName("");
    setCode(`FF-STORE-${(stores.length + 1).toString().padStart(3, "0")}`);
    setType("FLAGSHIP");
    // New stores start as DRAFT. Publishing to the storefront and the public API is a
    // deliberate act, and this used to default straight to "OPEN" — so an unfinished
    // record became customer-visible the moment it was saved.
    setStatus("DRAFT");
    // Address, contact and hours are deliberately EMPTY. These fields used to arrive
    // pre-filled with a fabricated Delhi address, a placeholder phone number and a
    // @fashionfeet.com mailbox, which meant one click could publish invented contact
    // details for the business. Real values must now be entered deliberately.
    setCity("");
    setState("");
    setStreet("");
    setPinCode("");
    setPhone("");
    setEmail("");
    setGoogleMapsUrl("");
    setOpeningHours("");
    setModalOpen(true);
  };

  const openEditModal = (st: StoreItem) => {
    setEditingStore(st);
    setName(st.name);
    setCode(st.code || "");
    setType(st.type);
    setStatus(st.status);
    setCity(st.city);
    setState(st.state);
    setStreet(st.street || "");
    setPinCode(st.pinCode || "");
    setPhone(st.phone || "");
    setEmail(st.email || "");
    setGoogleMapsUrl(st.googleMapsUrl || "");
    setOpeningHours(st.openingHours || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !city || !state) {
      alert("Store Name, City, and State are required.");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("code", code);
    fd.append("type", type);
    fd.append("status", status);
    fd.append("city", city);
    fd.append("state", state);
    fd.append("street", street);
    fd.append("pinCode", pinCode);
    fd.append("phone", phone);
    fd.append("email", email);
    fd.append("googleMapsUrl", googleMapsUrl);
    fd.append("openingHours", openingHours);

    const res = editingStore
      ? await updateStoreAction(editingStore.id, fd)
      : await createStoreAction(fd);

    setIsSubmitting(false);

    if (res.error) alert(res.error);
    else {
      setModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (currentAdminRole !== "SUPER_ADMIN") {
      alert("Only Super Admins are authorized to delete physical store records.");
      return;
    }
    if (!confirm("Are you sure you want to delete this store location?")) return;
    const res = await deleteStoreAction(id);
    if (res.error) alert(res.error);
    else window.location.reload();
  };

  const publishedStoresCount = stores.filter((s) => s.status === "OPEN" || s.status === "COMING_SOON").length;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Boutique Stores Manager</h1>
          <p className="text-xs text-gray-500">Manage physical flagship showrooms, boutique opening hours, and Storefront locator availability.</p>
        </div>

        <button onClick={openNewModal} className="px-5 py-2.5 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow border border-[#D4AF37]/30 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#D4AF37]" /> Add Showroom Store
        </button>
      </div>

      {publishedStoresCount === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>No physical stores are currently published as OPEN. The public Storefront will automatically display <strong>"Stores Coming Soon"</strong>.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((st) => (
          <div key={st.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${st.status === "OPEN" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                  {st.status.replace("_", " ")}
                </span>
                <span className="font-mono text-xs text-gray-400 font-bold">{st.code || "N/A"}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{st.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#8A1538]" /> {st.city}, {st.state}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                {st.street && <p>{st.street}, {st.pinCode}</p>}
                {st.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {st.phone}</p>}
                {st.openingHours && <p className="flex items-center gap-1.5 font-medium text-gray-800"><Clock className="w-3.5 h-3.5 text-[#C5A059]" /> {st.openingHours}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => openEditModal(st)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              {currentAdminRole === "SUPER_ADMIN" && (
                <button onClick={() => handleDelete(st.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">{editingStore ? `Edit Store: ${editingStore.name}` : "Add New Showroom Store"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Store Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GK-1 Flagship Boutique" className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Store Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl font-mono focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl focus:outline-none">
                    <option value="OPEN">Open</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="TEMPORARILY_CLOSED">Temporarily Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">City *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">State *</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Street Address</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Email</label>
                  <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Opening Hours</label>
                <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl font-medium focus:outline-none" />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold uppercase tracking-wider rounded-xl text-xs">Cancel</button>
              <button onClick={handleSave} disabled={isSubmitting} className="px-5 py-2 bg-[#8A1538] text-white font-bold uppercase tracking-widest rounded-xl text-xs flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />} Save Store Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
