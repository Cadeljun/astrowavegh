import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'AstroWave Cares',
  description: 'AstroWave Cares — empowering youth, supporting creatives, and giving back to communities in Ghana. Creative education, youth empowerment, and community impact.',
  path: '/cares',
});

export default function CaresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
