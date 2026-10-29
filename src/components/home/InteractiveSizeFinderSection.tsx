import Link from "next/link";
import { ArrowRight, Ruler } from "lucide-react";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";

export function InteractiveSizeFinderSection({ section }: { section?: StorefrontSection }) {
  return (
    <section className="bg-[#e6d6ce] py-20 text-[#281c1b] md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <Ruler className="mb-7 h-8 w-8 text-[#861638]" strokeWidth={1.5} aria-hidden="true" />
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#861638]">{section?.badge === "Custom Fit Assurance" ? "Find your fit" : section?.badge || "Find your fit"}</p>
          <h2 className="max-w-[14ch] font-serif text-4xl font-semibold leading-tight md:text-5xl">{section?.title === "Bespoke Size Studio" ? "Start with a good measurement" : section?.title || "Start with a good measurement"}</h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#51413d]">
            Measure both feet from heel to longest toe, then ask us to confirm the right size for your chosen pair. Fit can vary between designs.
          </p>
          <Link href={section?.ctaLink || "/size-guide"} className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-[#861638] text-sm font-semibold text-[#861638] hover:opacity-70">
            {section?.ctaText || "View the measuring guide"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="border-y border-[#9b7b6e] py-8 sm:py-12">
          <p className="mb-8 font-serif text-2xl">A simple way to begin</p>
          <ol className="space-y-6">
            {[
              ["01", "Place your heel against a wall", "Stand on a sheet of paper with your weight on both feet."],
              ["02", "Mark your longest toe", "Measure the distance from the wall to the mark in centimetres."],
              ["03", "Check the pair with us", "Share the measurement when enquiring about a design; we can discuss its fit."],
            ].map(([number, title, detail]) => (
              <li key={number} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#bba79d] pt-5">
                <span className="text-sm font-semibold text-[#861638]">{number}</span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-[#51413d]">{detail}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
