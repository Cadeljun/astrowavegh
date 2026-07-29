import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Events in Ghana',
  description: 'Discover the hottest events in Accra and across Ghana. Parties, concerts, nightlife, festivals, and networking events — all powered by AstroWave.',
  path: '/events',
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
