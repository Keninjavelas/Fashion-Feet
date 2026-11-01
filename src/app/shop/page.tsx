import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShopClient } from "./ShopClient";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import Link from "next/link";
import { catalogueAvailableForGender, cataloguesForGender, catalogueHref, findCatalogue } from "@/lib/catalogues";
import { WomenCatalogueGallery } from "@/components/shop/WomenCatalogueGallery";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; catalogue?: string; collection?: string; gender?: string; type?: string; q?: string }> }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  const collectionId = resolvedParams.collection;
  const gender = resolvedParams.gender;
  let selectedGender: "Men" | "Women" | undefined = gender === "Men" || gender === "Women" ? gender : undefined;
  const catalogue = findCatalogue(resolvedParams.catalogue);
  if (catalogue && !catalogueAvailableForGender(catalogue.slug, selectedGender)) redirect("/shop?gender=Men");
  if (catalogue?.slug === "rajwadi") selectedGender = "Women";
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
  const showWomenPhotoGallery = products.length === 0 && selectedGender !== "Men" && !searchQuery && !isNewArrivals && !category && !collectionId && (!resolvedParams.catalogue || Boolean(catalogue));
  const pageTitle = showWomenPhotoGallery && !catalogue && !selectedGender ? "Explore the collection" : title;

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[var(--theme-color-bg)] px-0 pb-24 pt-32 text-[var(--theme-color-text)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
          <div className="text-center mb-16 mt-4">
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4 capitalize font-bold">
              {pageTitle}
            </h1>
            <p className="text-[var(--theme-color-text-muted)] max-w-2xl mx-auto text-base">
              {searchQuery ? `Showing results for "${searchQuery}"` : showWomenPhotoGallery ? "Photographed Fashion Feet designs are available to explore. Ask us about prices, sizes, and availability." : "Browse Fashion Feet designs and published product listings."}
            </p>
          </div>

          <nav aria-label="Shop catalogues" className="mb-8 flex flex-wrap justify-center gap-2">
            <Link href={selectedGender ? `/shop?gender=${selectedGender}` : "/shop"} className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${!catalogue ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>All Catalogues</Link>
            {cataloguesForGender(selectedGender).map((item) => <Link key={item.slug} href={catalogueHref(item.slug, selectedGender)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${catalogue?.slug === item.slug ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>{item.name}</Link>)}
          </nav>
          <nav aria-label="Shop by fit" className="mb-8 flex flex-wrap justify-center gap-2">
            {catalogue?.slug !== "rajwadi" && <Link href={catalogue ? catalogueHref(catalogue.slug) : "/shop"} className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${!selectedGender ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>All Fits</Link>}
            {(["Men", "Women"] as const).filter((fit) => !catalogue || catalogueAvailableForGender(catalogue.slug, fit)).map((fit) => <Link key={fit} href={catalogue ? catalogueHref(catalogue.slug, fit) : `/shop?gender=${fit}`} className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${selectedGender === fit ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>{fit}</Link>)}
          </nav>

          {categories.length > 0 && !showWomenPhotoGallery && <nav aria-label="Shop categories" className="flex flex-wrap justify-center gap-2">
            <Link href="/shop" className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${!category ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>All</Link>
            {categories.map((item) => <Link key={item.slug} href={`/shop?category=${encodeURIComponent(item.name)}`} className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${category === item.name ? "border-[#861638] bg-[#861638] text-white" : "border-[var(--theme-color-border)] text-[var(--theme-color-text)]"}`}>{item.name}</Link>)}
          </nav>}
          {showWomenPhotoGallery ? (
            <div className="mt-10"><WomenCatalogueGallery selectedCatalogue={catalogue?.slug} /></div>
          ) : (
            <ShopClient initialProducts={products} initialCategory={category} />
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
