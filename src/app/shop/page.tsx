import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShopClient } from "./ShopClient";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, q?: string }> }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  const isNewArrivals = resolvedParams.type === "new";
  const searchQuery = resolvedParams.q;

  const query: any = { published: true, archived: false };
  if (category) {
    query.category = { equals: category };
  }
  if (searchQuery) {
    query.AND = [
      { published: true, archived: false },
      {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { category: { contains: searchQuery } },
        ]
      }
    ];
  }
  
  const products = await prisma.product.findMany({
    where: query,
    include: { images: { take: 1 } },
    orderBy: isNewArrivals ? { id: 'desc' } : undefined
  });

  const title = searchQuery ? `Search: ${searchQuery}` : isNewArrivals ? "New Arrivals" : category ? `${category} Collection` : "All Products";
  const breadcrumbLabel = searchQuery ? "Search Results" : isNewArrivals ? "New Arrivals" : category || "Shop";

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

          <ShopClient initialProducts={products} initialCategory={category} />
        </div>
      </div>
    </StorefrontLayout>
  );
}
