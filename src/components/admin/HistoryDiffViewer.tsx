import React from 'react';


interface Snapshot {
  sections: string; // JSON string of StorefrontSection[]
  version: number;
  publishedAt: string;
  changelogNote?: string;
}

interface Props {
  snapshot: Snapshot;
}

/**
 * Simple diff viewer that shows a pretty‑printed JSON of the snapshot.
 * For a more sophisticated line‑by‑line diff you could integrate the `diff` library.
 */
export default function HistoryDiffViewer({ snapshot }: Props) {
  let parsed: any;
  try {
    parsed = JSON.parse(snapshot.sections);
  } catch (e) {
    return <div className="text-amber-300">Unable to parse snapshot data.</div>;
  }

  const pretty = JSON.stringify(parsed, null, 2);

  // If you want a line diff against the current draft you could fetch it here,
  // but for now we just display the snapshot content.
  return (
    <pre className="text-xs overflow-x-auto p-2 bg-black/30 rounded" style={{ maxHeight: '60vh' }}>
      {pretty}
    </pre>
  );
}
