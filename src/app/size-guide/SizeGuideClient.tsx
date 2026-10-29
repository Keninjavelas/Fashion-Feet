"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Ruler } from "lucide-react";
import { useSession } from "next-auth/react";
import { updateSize } from "../profile/actions";

export function SizeGuideClient() {
  const { data: session } = useSession();
  const [footLength, setFootLength] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveMeasurement() {
    const value = Number(footLength);
    if (!Number.isFinite(value) || value < 15 || value > 35) {
      setError("Enter a foot length between 15 and 35 cm.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await updateSize(`${value.toFixed(1)} cm foot length`);
      if (!result.success) throw new Error(result.error || "Could not save measurement");
      setSaved(true);
    } catch {
      setError("We could not save your measurement. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--theme-color-bg)] px-5 pb-24 pt-36 text-[var(--theme-color-text)] md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-color-accent)]"><Ruler className="h-4 w-4" /> Size Studio</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-6xl">Start with your measurement.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--theme-color-text-muted)]">Measure both feet at home, then ask us to confirm the size for the pair you choose. We do not have a verified Fashion Feet size chart yet, so a length alone cannot promise a particular fit.</p>

        <div className="mt-14 grid gap-12 border-t border-[var(--theme-color-border)] pt-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section aria-labelledby="measure-heading">
            <h2 id="measure-heading" className="font-serif text-3xl">How to measure</h2>
            <ol className="mt-8 space-y-8">
              {[
                ["Prepare", "Place a sheet of paper on a hard floor against a wall. Stand with your heel touching the wall."],
                ["Mark", "Mark the tip of your longest toe. Repeat for your other foot while standing normally."],
                ["Measure", "Measure from the wall edge to each mark in centimetres. Keep the longer measurement to share when enquiring."],
              ].map(([title, detail], index) => (
                <li key={title} className="flex gap-5 border-b border-[var(--theme-color-border)] pb-8">
                  <span className="font-serif text-3xl text-[var(--theme-color-jewel)]" aria-hidden="true">0{index + 1}</span>
                  <div><h3 className="font-serif text-xl">{title}</h3><p className="mt-2 max-w-xl text-base leading-relaxed text-[var(--theme-color-text-muted)]">{detail}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="h-fit bg-[var(--theme-color-surface)] p-7 ring-1 ring-[var(--theme-color-border)] md:p-9">
            <h2 className="font-serif text-3xl">Keep your measurement</h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--theme-color-text-muted)]">Share your foot length and the design you like with Fashion Feet for size guidance. Different designs may fit differently.</p>
            <label htmlFor="foot-length" className="mt-8 block text-sm font-semibold">Longer foot length (cm)</label>
            <div className="mt-2 flex items-center border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--theme-color-jewel)]">
              <input id="foot-length" type="number" min="15" max="35" step="0.1" inputMode="decimal" value={footLength} onChange={(event) => { setFootLength(event.target.value); setSaved(false); }} placeholder="e.g. 24.5" className="min-h-12 min-w-0 flex-1 bg-transparent px-4 text-base outline-none" />
              <span className="pr-4 text-sm text-[var(--theme-color-text-muted)]">cm</span>
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            {session?.user ? (
              <button onClick={saveMeasurement} disabled={saving} className="mt-5 min-h-12 w-full bg-[var(--theme-color-jewel)] px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : saved ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-4 w-4" /> Saved to your profile</span> : "Save measurement"}</button>
            ) : <p className="mt-5 text-sm text-[var(--theme-color-text-muted)]"><Link href="/login" className="font-semibold underline underline-offset-4">Sign in</Link> to save this measurement to your profile.</p>}
            <Link href="/contact" className="mt-5 inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-[var(--theme-color-jewel)] underline underline-offset-4">Ask about sizing <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
        <div className="mt-16 flex flex-wrap gap-4"><Link href="/women" className="inline-flex min-h-12 items-center gap-2 border border-[var(--theme-color-border)] px-6 text-sm font-semibold">Explore women&apos;s designs <ArrowRight className="h-4 w-4" /></Link><Link href="/men" className="inline-flex min-h-12 items-center gap-2 border border-[var(--theme-color-border)] px-6 text-sm font-semibold">Explore men&apos;s designs <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </div>
  );
}
