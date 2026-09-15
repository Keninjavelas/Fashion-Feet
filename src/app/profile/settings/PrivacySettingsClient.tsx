"use client";

import { useState } from "react";
import { Download, Trash2, ShieldCheck } from "lucide-react";
import { DownloadDataModal } from "./DownloadDataModal";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function PrivacySettingsClient() {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 md:p-8 border border-black/5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
        <div>
          <h3 className="font-serif text-lg text-[var(--color-brand-900)] font-medium">Data Export & Account Controls</h3>
          <p className="text-xs text-gray-500">Download a full archive of your saved profile data or permanently close your account.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <button
          onClick={() => setDownloadModalOpen(true)}
          className="px-5 py-2.5 bg-[var(--color-brand-50)] text-[var(--color-brand-900)] border border-[var(--color-brand-200)] text-xs font-semibold uppercase tracking-widest hover:bg-[var(--color-brand-100)] transition-colors rounded-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-[var(--color-accent-gold)]" /> Download My Data
        </button>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold uppercase tracking-widest hover:bg-rose-100 transition-colors rounded-sm flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4 text-rose-600" /> Delete Account
        </button>
      </div>

      <DownloadDataModal isOpen={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} />
      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
