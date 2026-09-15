"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download, CheckCircle2, Loader2, FileJson, ShieldCheck } from "lucide-react";
import { exportUserData } from "@/app/actions/userAccount";

export function DownloadDataModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus & Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await exportUserData();
    setLoading(false);

    if (res.success && res.data) {
      // Trigger browser download of formatted JSON
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fashion-feet-data-export-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } else {
      setError(res.error || "Failed to generate data export.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
      <div ref={modalRef} className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl border border-black/10 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[var(--color-brand-900)] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 text-[var(--color-accent-gold)] text-xs uppercase tracking-widest font-semibold mb-1">
            <FileJson className="w-4 h-4" /> Data Export & Privacy
          </div>
          <h2 className="font-serif text-2xl font-medium text-white">Download Your Fashion Feet Data?</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Data export downloaded successfully! Check your browser downloads folder.</span>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Your export will contain a complete, structured JSON copy of all personal records associated with your Fashion Feet account:
            </p>
            
            <ul className="space-y-2 text-xs font-medium text-gray-800 bg-[var(--color-brand-50)] p-4 rounded-xl border border-[var(--color-brand-100)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Profile information (Name, Email, Phone)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Saved Favorites wishlist items
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Saved Foot Size preference
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Account Preferences & Fitting notes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Notification Preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-900)]" /> Account creation date & activity timestamps
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-black/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-medium uppercase tracking-wider rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || success}
              className="px-6 py-2.5 bg-[var(--color-brand-900)] text-white text-xs font-medium uppercase tracking-wider rounded-md hover:bg-[var(--color-accent-gold)] transition-colors shadow-md flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-900)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {loading ? "Generating Export..." : "Download Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
