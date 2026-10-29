import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const details = [
  {
    number: "01",
    title: "Pattern",
    description: "A lattice of colour and embellishment across the toe.",
    image: "/catalogue/women/studio/ceremonial-v3/01.png",
    href: "/catalogue/women/ceremonial/01.jpeg",
  },
  {
    number: "02",
    title: "Colour",
    description: "Vibrant motifs that make a festive pair unmistakable.",
    image: "/catalogue/women/studio/festive-v2/03.png",
    href: "/catalogue/women/festive/03.jpeg",
  },
  {
    number: "03",
    title: "Shape",
    description: "The curved opening and pointed silhouette of a Punjabi jutti.",
    image: "/catalogue/women/studio/daily-wear/01.png",
    href: "/catalogue/women/daily-wear/01.jpeg",
  },
  {
    number: "04",
    title: "Embellishment",
    description: "A close-up of the decorative work in an original photograph.",
    image: "/catalogue/women/ceremonial/05.jpeg",
    href: "/catalogue/women/ceremonial/05.jpeg",
  },
] as const;

export function CraftsmanshipScrollStory() {
  return (
    <section className="bg-[#f7f2ea] py-20 text-[#281c1b] md:py-28" aria-labelledby="details-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#861638]">In the details</p>
            <h2 id="details-title" className="font-serif text-4xl font-semibold leading-tight md:text-5xl">Look at the footwear, up close</h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-[#594843]">These views come from the Fashion Feet catalogue. Open an original photograph to examine each design as it was documented.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail) => (
            <a key={detail.number} href={detail.href} target="_blank" rel="noopener noreferrer" className="group block border-t border-[#cdbdb1] pt-4 focus-visible:outline-offset-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#e6d6ce]">
                <Image src={detail.image} alt={`${detail.title} detail of Fashion Feet Punjabi juttis`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className={detail.number === "04" ? "object-cover" : "object-contain p-4"} />
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#861638]">{detail.number}</span>
                  <h3 className="mt-2 font-serif text-2xl font-semibold">{detail.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#594843]">{detail.description}</p>
                </div>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#861638] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
        <div className="mt-10"><Link href="/women" className="inline-flex min-h-12 items-center border-b border-[#861638] text-sm font-semibold text-[#861638] hover:opacity-70">Explore the women&apos;s gallery</Link></div>
      </div>
    </section>
  );
}
