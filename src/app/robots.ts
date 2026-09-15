import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://fashionfeet.com';

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
