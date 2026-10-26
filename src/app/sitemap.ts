import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { STOREFRONT_ORIGIN } from '@/lib/contactDetails';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = STOREFRONT_ORIGIN;

  const staticRoutes = [
    '',
    '/shop',
    '/men',
    '/women',
    '/festive',
    '/stores',
    '/size-guide',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/shop') || route === '/stores' ? 0.9 : 0.7,
  }));

  // Dynamic Product URLs
  try {
    const products = await prisma.product.findMany({
      where: { published: true, archived: false, hidden: false },
      select: { id: true, createdAt: true },
      take: 500,
    });

    const productRoutes = products.map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
