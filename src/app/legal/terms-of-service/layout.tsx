import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms of Service',
  description: 'AstroWave Terms of Service — the rules and guidelines for using our entertainment platform, talent booking, and event management services.',
  path: '/legal/terms-of-service',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
