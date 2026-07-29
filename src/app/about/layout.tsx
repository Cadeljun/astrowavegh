import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Us',
  description: 'Learn about AstroWave — Ghana\'s leading creative entertainment powerhouse. Founded by Calvin Mensah Delali, we redefine African entertainment through events, talent management, and culture in Accra.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
