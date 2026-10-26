"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleHelp, Pencil, Pin, Plus, Trash2, X } from "lucide-react";
import { createFaq, deleteFaq, togglePinFaq, updateFaq } from "@/app/actions/faq";
import { STOREFRONT_ORIGIN } from "@/lib/contactDetails";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  displayOrder: number;
};

const emptyForm = { question: "", answer: "", category: "GENERAL", isPinned: false };

function ordered(faqs: Faq[]) {
  return [...faqs].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || a.displayOrder - b.displayOrder);
}

export function FaqManagerClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categories = [...new Set(faqs.map((faq) => faq.category))];
  const shown = faqs.filter((faq) => `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(search.toLowerCase()));

  function edit(faq: Faq) {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, isPinned: faq.isPinned });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData();
    data.set("question", form.question);
    data.set("answer", form.answer);
    data.set("category", form.category);
    data.set("isPinned", String(form.isPinned));

    try {
      if (editingId) {
        const result = await updateFaq(editingId, data);
        if (result.error) setError(result.error);
        else if (result.updated) {
          setFaqs((current) => ordered(current.map((faq) => faq.id === editingId ? result.updated : faq)));
          setMessage("FAQ updated on the storefront.");
          reset();
        }
      } else {
        const result = await createFaq(data);
        if (result.error) setError(result.error);
        else if (result.faq) {
          setFaqs((current) => ordered([...current, result.faq]));
          setMessage("FAQ added to the storefront.");
          reset();
        }
      }
    } catch {
      setError("Could not save this FAQ. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePin(faq: Faq) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await togglePinFaq(faq.id);
      if (result.error) setError(result.error);
      else if (result.updated) {
        setFaqs((current) => ordered(current.map((item) => item.id === faq.id ? result.updated : item)));
        setMessage("FAQ order updated on the storefront.");
      }
    } catch {
      setError("Could not update this FAQ. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(faq: Faq) {
    if (!window.confirm(`Permanently delete “${faq.question}”? It will disappear from the storefront immediately.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteFaq(faq.id);
      if (result.error) setError(result.error);
      else {
        setFaqs((current) => current.filter((item) => item.id !== faq.id));
        if (editingId === faq.id) reset();
        setMessage("FAQ removed from the storefront.");
      }
    } catch {
      setError("Could not delete this FAQ. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-[#FBF6ED]">
      <header className="rounded-2xl border border-white/10 bg-[#23141B] p-6">
        <div className="flex items-center gap-3"><CircleHelp className="h-6 w-6 text-[#DBB772]" /><h1 className="font-serif text-3xl font-bold">Frequently asked questions</h1></div>
        <p className="mt-3 text-sm text-white/65">Manage the answers shown on the <Link href={`${STOREFRONT_ORIGIN}/faq`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#E8C684] underline">storefront FAQ page</Link>. Saving a question makes it public immediately.</p>
      </header>

      {(message || error) && <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}>{error || message}</p>}

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/10 bg-[#23141B] p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="font-serif text-xl font-semibold">{editingId ? "Edit question" : "Add a question"}</h2>{editingId && <button type="button" onClick={reset} disabled={busy} className="flex items-center gap-1 text-sm text-white/60 hover:text-white"><X className="h-4 w-4" /> Cancel</button>}</div>
        <label className="block text-sm font-semibold">Question
          <input required maxLength={300} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#DBB772]" placeholder="What would a customer ask?" />
        </label>
        <label className="block text-sm font-semibold">Answer
          <textarea required maxLength={5000} rows={5} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#DBB772]" placeholder="Write the answer shown to customers." />
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-56 flex-1 text-sm font-semibold">Category
            <input required maxLength={80} list="faq-categories" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#DBB772]" />
            <datalist id="faq-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={form.isPinned} onChange={(event) => setForm({ ...form, isPinned: event.target.checked })} className="h-4 w-4 accent-[#DBB772]" /> Pin to top</label>
          <button disabled={busy} type="submit" className="flex items-center gap-2 rounded-xl bg-[#8A1538] px-5 py-3 text-sm font-bold text-white hover:bg-[#A51D48] disabled:opacity-50"><Plus className="h-4 w-4" /> {busy ? "Saving…" : editingId ? "Save changes" : "Add FAQ"}</button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-[#23141B] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-serif text-xl font-semibold">Questions ({faqs.length})</h2><input type="search" aria-label="Search FAQs" placeholder="Search questions…" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-xs rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm text-white outline-none focus:border-[#DBB772]" /></div>
        {shown.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">{faqs.length === 0 ? "No FAQs yet. Add the first question above to publish it on the storefront." : "No questions match your search."}</p> : <div className="mt-5 space-y-3">{shown.map((faq) => <article key={faq.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#E8C684]"><span>{faq.category}</span>{faq.isPinned && <span className="flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}</div><h3 className="font-semibold text-white">{faq.question}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-white/65">{faq.answer}</p></div><div className="flex shrink-0 items-center gap-1"><button type="button" disabled={busy} onClick={() => edit(faq)} aria-label={`Edit ${faq.question}`} title="Edit" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button><button type="button" disabled={busy} onClick={() => togglePin(faq)} aria-label={`${faq.isPinned ? "Unpin" : "Pin"} ${faq.question}`} title={faq.isPinned ? "Unpin" : "Pin"} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><Pin className="h-4 w-4" /></button><button type="button" disabled={busy} onClick={() => remove(faq)} aria-label={`Delete ${faq.question}`} title="Delete" className="rounded-lg p-2 text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-200"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
      </section>
    </div>
  );
}
