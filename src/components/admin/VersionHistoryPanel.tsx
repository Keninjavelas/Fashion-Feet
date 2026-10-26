import React, { useEffect, useState } from 'react';
import HistoryDiffViewer from './HistoryDiffViewer';
import { getVersionHistoryAction, rollbackVersionAction } from '@/app/actions/editor';
import { formatAdminDate, formatAdminDateTime } from '@/lib/adminDate';

interface HistoryRecord {
  id: string;
  page: string;
  version: number;
  sections: string; // JSON string of StorefrontSection[]
  publishedAt: string; // ISO date
  changelogNote?: string;
  publishedBy?: { id: string; name: string; email: string; role: string };
}

interface Props {
  page: string;
  onRollbackSuccess: () => void | Promise<void>; // callback to refresh editor after successful rollback
}

export default function VersionHistoryPanel({ page, onRollbackSuccess }: Props) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HistoryRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getVersionHistoryAction(page);
        if (!result.history) throw new Error(result.error || 'Failed to fetch history');
        setHistory(result.history.map((record) => ({
          ...record,
          publishedAt: new Date(record.publishedAt).toISOString(),
          changelogNote: record.changelogNote ?? undefined,
          publishedBy: record.publishedBy ?? undefined,
        })));
        setError(null);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    }
    fetchHistory();
  }, [page]);

  const handleRollback = async (record: HistoryRecord) => {
    const confirmed = window.confirm(
      `Rollback to version v${record.version} (published on ${formatAdminDateTime(record.publishedAt)})? This will create a new live version and history entry.`
    );
    if (!confirmed) return;

    try {
      const result = await rollbackVersionAction(page, record.version);
      if (!result.success) throw new Error(result.error || 'Rollback failed');
      const refreshed = await getVersionHistoryAction(page);
      if (!refreshed.history) throw new Error(refreshed.error || 'Failed to refresh history');
      setHistory(refreshed.history.map((entry) => ({
        ...entry,
        publishedAt: new Date(entry.publishedAt).toISOString(),
        changelogNote: entry.changelogNote ?? undefined,
        publishedBy: entry.publishedBy ?? undefined,
      })));
      setSelected(null);
      await onRollbackSuccess();
      alert('Rollback successful');
    } catch (e: any) {
      alert(`Rollback error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-white/60">
        Loading version history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-amber-300">
        Error loading history: {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-sm text-white/40">No version history available.</div>
    );
  }

  return (
    <aside className="flex max-h-[70vh] w-full flex-col overflow-y-auto border-l border-[#D4AF37]/20 bg-[#12080C]">
      <header className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
          Version History
        </h3>
        <button
          onClick={() => setPreviewOpen(!previewOpen)}
          className="text-xs text-white/60 hover:text-white"
        >
          {previewOpen ? 'Close' : 'Preview'}
        </button>
      </header>
      <ul className="flex-1 space-y-1 p-2">
        {history.map((rec) => (
          <li
            key={rec.id}
            className={`p-2 rounded cursor-pointer text-xs hover:bg-white/5 ${
              selected?.id === rec.id ? 'bg-[#8A1538] border border-[#D4AF37]/40' : ''
            }`}
            onClick={() => setSelected(rec)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">v{rec.version}</span>
              <span className="text-white/60">{formatAdminDate(rec.publishedAt)}</span>
            </div>
            <div className="text-white/40 truncate">{rec.changelogNote ?? 'No note'}</div>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => handleRollback(selected)}
            className="w-full py-1.5 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs rounded"
          >
            Rollback to v{selected.version}
          </button>
        </div>
      )}
      {previewOpen && selected && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
          <div className="bg-[#12080C] p-4 rounded w-full max-w-xl max-h-[80vh] overflow-auto">
            <button
              onClick={() => setPreviewOpen(false)}
              className="float-right text-white/60 hover:text-white"
            >
              ✕
            </button>
            <h4 className="text-sm font-bold mb-2 text-[#D4AF37]">Snapshot v{selected.version} Preview</h4>
            <HistoryDiffViewer snapshot={selected} />
          </div>
        </div>
      )}
    </aside>
  );
}
