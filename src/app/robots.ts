import { MetadataRoute } from 'next';

/**
 * Configures the robots.txt file to control search engine crawling behavior.
 * Blocks sensitive areas like /admin and /dev.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://astrowave.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dev/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/dev/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
