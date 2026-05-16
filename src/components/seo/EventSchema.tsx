import SchemaOrg from './SchemaOrg';

interface EventSchemaProps {
  name: string;
  description: string;
  startDate: string;
  location: string;
  imageUrl: string;
  url: string;
  price?: string;
  organizer?: string;
}

/**
 * Dynamic component to generate Schema.org Event structured data.
 */
export default function EventSchema({
  name,
  description,
  startDate,
  location,
  imageUrl,
  url,
  price = '0',
  organizer = 'AstroWave',
}: EventSchemaProps) {
  return (
    <SchemaOrg
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: name,
        description: description,
        startDate: startDate,
        endDate: startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: location,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Accra',
            addressCountry: 'GH',
          },
        },
        image: [imageUrl],
        url: url,
        organizer: {
          '@type': 'Organization',
          name: organizer,
          url: 'https://astrowave.com',
        },
        offers: {
          '@type': 'Offer',
          url: url,
          price: price,
          priceCurrency: 'GHS',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
        },
        performer: {
          '@type': 'PerformingGroup',
          name: 'AstroWave Artists',
        },
      }}
    />
  );
}
