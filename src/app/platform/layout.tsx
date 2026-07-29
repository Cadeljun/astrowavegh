import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Find Talent',
  description: 'Use AstroWave\'s AI-powered platform to find and book DJs, MCs, singers, dancers, and performers in Ghana. Ranked by Wave Score — the trust index for creative talent.',
  path: '/platform',
});

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
