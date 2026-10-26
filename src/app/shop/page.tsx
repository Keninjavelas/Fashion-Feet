import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShopClient } from "./ShopClient";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import Link from "next/link";
import { CATALOGUES, catalogueHref, findCatalogue } from "@/lib/catalogues";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; catalogue?: string; collection?: string; gender?: string; type?: string; q?: string }> }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  const collectionId = resolvedParams.collection;
  const gender = resolvedParams.gender;
  const selectedGender = gender === "Men" || gender === "Women" ? gender : undefined;
  const catalogue = findCatalogue(resolvedParams.catalogue);
  const isNewArrivals = resolvedParams.type === "new";
  const searchQuery = resolvedParams.q;

  const [categories, collection] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" }, select: { name: true, slug: true } }).catch(() => []),
    collectionId ? prisma.collection.findFirst({ where: { id: collectionId, visible: true, status: "PUBLISHED" }, select: { id: true, title: true } }) : Promise.resolve(null)
  ]);

  const query: any = { published: true, archived: false, hidden: false };
  if (isNewArrivals) query.isNewArrival = true;
  if (collectionId) query.collectionId = collection?.id || "__unavailable_collection__";
  if (selectedGender) query.gender = { in: [selectedGender, "Unisex"] };
  if (resolvedParams.catalogue) query.occasion = catalogue?.name || "__unavailable_catalogue__";
  if (category) {
    query.category = { equals: category };
  }
  if (searchQuery) {
    query.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { category: { contains: searchQuery } },
      { occasion: { contains: searchQuery } },
    ];
  }
  
  const products = await prisma.product.findMany({
    where: query,
    include: { images: { take: 1 } },
    orderBy: isNewArrivals ? { id: 'desc' } : undefined
  });

  const title = searchQuery ? `Search: ${searchQuery}` : catalogue ? `${selectedGender ? `${selectedGender}'s ` : ""}${catalogue.name}` : collection ? collection.title : isNewArrivals ? "New Arrivals" : category ? `${category} Collection` : selectedGender ? `${selectedGender}'s Collection` : "All Products";
  const breadcrumbLabel = searchQuery ? "Search Results" : catalogue?.name || collection?.title || (isNewArrivals ? "New Arrivals" : category || "Shop");

  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen bg-[#12080C] text-[#F6F2EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
          <div className="text-center mb-16 mt-4">
            <h1 className="font-serif text-4xl md:text-5xl text-white tracking-tight mb-4 capitalize font-bold">
              {title}
            </h1>
            <p className="text-[#F6F2EB]/80 max-w-2xl mx-auto font-light text-sm md:text-base">
              {searchQuery ? `Showing results for "${searchQuery}"` : "Discover our carefully curated selection of handcrafted juttis."}
            </p>
          </div>

          <nav aria-label="Shop catalogues" className="mb-8 flex flex-wrap justify-center gap-2">
            <Link href={selectedGender ? `/shop?gender=${selectedGender}` : "/shop"} className={`rounded-full border px-4 py-2 text-xs font-bold ${!catalogue ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>All Catalogues</Link>
            {CATALOGUES.map((item) => <Link key={item.slug} href={catalogueHref(item.slug, selectedGender)} className={`rounded-full border px-4 py-2 text-xs font-bold ${catalogue?.slug === item.slug ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>{item.name}</Link>)}
          </nav>
          <nav aria-label="Shop by fit" className="mb-8 flex flex-wrap justify-center gap-2">
            <Link href={catalogue ? catalogueHref(catalogue.slug) : "/shop"} className={`rounded-full border px-4 py-2 text-xs font-bold ${!selectedGender ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>All Fits</Link>
            {(["Men", "Women"] as const).map((fit) => <Link key={fit} href={catalogue ? catalogueHref(catalogue.slug, fit) : `/shop?gender=${fit}`} className={`rounded-full border px-4 py-2 text-xs font-bold ${selectedGender === fit ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>{fit}</Link>)}
          </nav>

          {categories.length > 0 && <nav aria-label="Shop categories" className="flex flex-wrap justify-center gap-2">
            <Link href="/shop" className={`rounded-full border px-4 py-2 text-xs font-bold ${!category ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>All</Link>
            {categories.map((item) => <Link key={item.slug} href={`/shop?category=${encodeURIComponent(item.name)}`} className={`rounded-full border px-4 py-2 text-xs font-bold ${category === item.name ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/20 text-white/70"}`}>{item.name}</Link>)}
          </nav>}
          <ShopClient initialProducts={products} initialCategory={category} />
        </div>
      </div>
    </StorefrontLayout>
  );
}
