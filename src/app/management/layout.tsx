import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Talent Management',
  description: 'AstroWave Management — we build legacies for DJs, artists, and performers in Ghana. Brand deals, booking management, PR, career strategy, and social growth.',
  path: '/management',
});

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
