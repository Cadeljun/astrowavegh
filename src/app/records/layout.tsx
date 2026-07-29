import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'AstroWave Records',
  description: 'AstroWave Records — discovering, developing, and amplifying the boldest African voices in music. Coming soon.',
  path: '/records',
});

export default function RecordsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
