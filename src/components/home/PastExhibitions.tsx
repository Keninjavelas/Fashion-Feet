import Image from "next/image";

const exhibitionPhotos = [
  {
    src: "/exhibitions/display-shelves.jpg",
    alt: "Juttis arranged across three shelving units at a past exhibition",
    caption: "Handcrafted styles on display",
    width: 1280,
    height: 960,
  },
  {
    src: "/exhibitions/display-tables.jpg",
    alt: "Rows of colorful embroidered juttis displayed on tables at a past exhibition",
    caption: "A closer look at the collection",
    width: 1024,
    height: 768,
  },
];

export function PastExhibitions() {
  return (
    <section
      id="past-exhibitions"
      aria-labelledby="past-exhibitions-title"
      className="scroll-mt-24 border-y border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] py-16 text-[var(--theme-color-text)] md:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 max-w-2xl md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--theme-color-accent)]">
            From our archive
          </p>
          <h2 id="past-exhibitions-title" className="font-serif text-3xl font-bold tracking-tight md:text-5xl">
            Moments from Past Exhibitions
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--theme-color-text-muted)] md:text-base">
            A look back at the handcrafted juttis and colorful styles showcased at our past exhibitions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {exhibitionPhotos.map((photo) => (
            <figure
              key={photo.src}
              className="overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] shadow-lg"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="border-t border-[var(--theme-color-border)] px-5 py-4 font-serif text-base font-semibold md:px-6 md:text-lg">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
