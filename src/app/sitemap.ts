import { MetadataRoute } from 'next';

/**
 * Generates the sitemap.xml for the AstroWave platform.
 * Ensuring all public pages are discoverable by search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://astrowave.com';
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/management`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/records`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cares`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
