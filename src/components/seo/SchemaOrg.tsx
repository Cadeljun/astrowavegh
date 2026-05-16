'use client';

interface SchemaProps {
  schema: object;
}

/**
 * A simple client component to inject JSON-LD structured data into the head.
 */
export default function SchemaOrg({ schema }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
