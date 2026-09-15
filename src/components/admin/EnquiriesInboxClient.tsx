"use client";

import { useState } from "react";
import { Inbox, Search, Mail, Phone, Clock, User, Send, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import { updateEnquiryStatusAction, assignEnquiryAction, addEnquiryNoteAction } from "@/app/actions/enquiries";

interface InternalNote {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
}

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  size?: string | null;
  color?: string | null;
  subject?: string | null;
  message?: string | null;
  productSku?: string | null;
  enquiryType?: string | null;
  status: string;
  createdAt: any;
  product?: { id: string; title: string; price: number; category: string; images?: { url: string }[] } | null;
  assignedAdminId?: string | null;
  assignedAdmin?: { id: string; name: string } | null;
  internalNotes?: string | null;
}

interface AdminUserOption {
  id: string;
  name: string;
  email: string;
}

export function EnquiriesInboxClient({ initialEnquiries, adminUsers }: { initialEnquiries: EnquiryItem[]; adminUsers: AdminUserOption[] }) {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(initialEnquiries[0] || null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || (e.productSku && e.productSku.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (enquiryId: string, status: string) => {
    const res = await updateEnquiryStatusAction(enquiryId, status);
    if (res.error) alert(res.error);
    else {
      setEnquiries(enquiries.map((e) => e.id === enquiryId ? { ...e, status } : e));
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status });
      }
    }
  };

  const handleAssignAdmin = async (enquiryId: string, adminId: string) => {
    const targetAdmin = adminUsers.find((a) => a.id === adminId) || null;
    const res = await assignEnquiryAction(enquiryId, adminId || null);
    if (res.error) alert(res.error);
    else {
      setEnquiries(enquiries.map((e) => e.id === enquiryId ? { ...e, assignedAdminId: adminId, assignedAdmin: targetAdmin } : e));
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, assignedAdminId: adminId, assignedAdmin: targetAdmin });
      }
    }
  };

  const handleAddNote = async () => {
    if (!selectedEnquiry || !newNoteText.trim()) return;
    setIsSubmittingNote(true);
    const res = await addEnquiryNoteAction(selectedEnquiry.id, newNoteText.trim());
    setIsSubmittingNote(false);
    if (res.error) alert(res.error);
    else {
      setNewNoteText("");
      if (res.enquiry) {
        setSelectedEnquiry(res.enquiry as any);
        setEnquiries(enquiries.map((e) => e.id === res.enquiry.id ? (res.enquiry as any) : e));
      }
    }
  };

  let notesList: InternalNote[] = [];
  if (selectedEnquiry?.internalNotes) {
    try { notesList = JSON.parse(selectedEnquiry.internalNotes); } catch { notesList = []; }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Customer Enquiries Inbox</h1>
          <p className="text-xs text-gray-500">Manage virtual showroom fitting requests, size inquiries, and bespoke bridal appointments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Enquiry List */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search customer name, email, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-medium"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-[11px] font-bold">
              {["all", "NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider ${
                    statusFilter === st ? "bg-[#8A1538] text-white" : "bg-white border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {filteredEnquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto" />
                <p className="text-xs font-medium">No customer enquiries match your filters.</p>
              </div>
            ) : (
              filteredEnquiries.map((e) => {
                const isSelected = selectedEnquiry?.id === e.id;
                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEnquiry(e)}
                    className={`p-4 cursor-pointer transition-all space-y-2 ${isSelected ? "bg-amber-50/60 border-l-4 border-[#8A1538]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs truncate max-w-xs">{e.name}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                        e.status === "NEW" ? "bg-indigo-100 text-indigo-700" : e.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>{e.status}</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1">{e.message || e.subject || "Virtual Atelier Enquiry"}</p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span>{e.product ? `Pair: ${e.product.title}` : e.productSku || "General Enquiry"}</span>
                      <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Enquiry Detail View */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[700px] flex flex-col justify-between">
          {!selectedEnquiry ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
              <Inbox className="w-12 h-12 text-gray-300" />
              <p className="text-xs font-medium">Select an enquiry from the left pane to view details and manage notes.</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A1538]">Enquiry #{selectedEnquiry.id.slice(-6)}</span>
                    <h2 className="font-serif text-2xl font-bold text-gray-900">{selectedEnquiry.name}</h2>
                    <p className="text-xs text-gray-500 flex items-center gap-3 font-mono mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#C5A059]" /> {selectedEnquiry.email}</span>
                      {selectedEnquiry.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#C5A059]" /> {selectedEnquiry.phone}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedEnquiry.status}
                      onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Product Context */}
                {selectedEnquiry.product && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl border text-[#8A1538]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{selectedEnquiry.product.title}</span>
                        <span className="text-gray-500 font-mono text-[11px]">Category: {selectedEnquiry.product.category} &bull; Price: ₹{selectedEnquiry.product.price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {selectedEnquiry.size && (
                      <span className="px-3 py-1 bg-white font-mono font-bold text-xs rounded-xl border border-gray-200">
                        Size: {selectedEnquiry.size}
                      </span>
                    )}
                  </div>
                )}

                {/* Customer Message */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Customer Message</h4>
                  <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl text-xs text-gray-800 leading-relaxed font-serif text-sm">
                    "{selectedEnquiry.message || selectedEnquiry.subject || "Boutique fitting enquiry submitted from Fashion Feet storefront."}"
                  </div>
                </div>

                {/* Assigned Admin Selector */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border text-xs">
                  <span className="font-bold text-gray-600 uppercase tracking-wider">Assigned Concierge Admin:</span>
                  <select
                    value={selectedEnquiry.assignedAdminId || ""}
                    onChange={(e) => handleAssignAdmin(selectedEnquiry.id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((a) => (<option key={a.id} value={a.id}>{a.name} ({a.email})</option>))}
                  </select>
                </div>

                {/* Internal Notes & Activity Timeline */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Internal Activity & Atelier Notes ({notesList.length})</h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notesList.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No internal notes added yet.</p>
                    ) : (
                      notesList.map((n) => (
                        <div key={n.id} className="p-3 bg-gray-50 rounded-xl border text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span className="font-bold text-gray-900">{n.authorName}</span>
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-700">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Add Note Input */}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Add internal note for atelier team..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(); }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isSubmittingNote || !newNoteText.trim()}
                  className="px-4 py-2.5 bg-[#8A1538] text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
