import type { Metadata } from 'next';

const baseUrl = 'https://astrowavegh.com';
const siteName = 'AstroWave';
const defaultDescription = 'Ghana\'s premier entertainment platform for events, nightlife, talent management, and creative culture in Accra.';

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  const desc = description || defaultDescription;
  const url = `${baseUrl}${path}`;
  const ogImage = image || `${baseUrl}/opengraph-image`;

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName,
      locale: 'en_GH',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Organization structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AstroWave',
    alternateName: 'AstroWave Ghana',
    url: baseUrl,
    logo: `${baseUrl}/logo/astrowave-logo.png`,
    description: defaultDescription,
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Calvin Mensah Delali',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@astrowave.live',
    },
    sameAs: [],
  };
}

// LocalBusiness structured data
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EntertainmentBusiness',
    name: 'AstroWave',
    image: `${baseUrl}/logo/astrowave-logo.png`,
    url: baseUrl,
    telephone: '',
    email: 'info@astrowave.live',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Accra',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      postalCode: '',
      addressCountry: 'GH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.6037,
      longitude: -0.1870,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '23:59',
    },
    priceRange: '$$',
    servesCuisine: 'Entertainment',
  };
}

// Website SearchAction schema
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AstroWave',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/events?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
