import { MetadataRoute } from 'next';
import { STOREFRONT_ORIGIN } from '@/lib/contactDetails';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = STOREFRONT_ORIGIN;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/cart',
          '/checkout',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
