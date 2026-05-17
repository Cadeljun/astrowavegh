'use client';

import dynamic from 'next/dynamic';
import HeroSection from '@/components/sections/HeroSection';

const AboutTeaser = dynamic(() => import('@/components/sections/AboutTeaser'), {
  loading: () => <div className="h-[600px] bg-black" />,
  ssr: true,
});

const EcosystemSection = dynamic(() => import('@/components/sections/EcosystemSection'), {
  loading: () => <div className="h-[600px] bg-surface" />,
  ssr: true,
});

const VibeNavigator = dynamic(() => import('@/components/VibeNavigator'), {
  loading: () => <div className="h-[400px] bg-black" />,
  ssr: false, // AI interactions are client-side only
});

const FeaturedEvents = dynamic(() => import('@/components/sections/FeaturedEvents'), {
  loading: () => <div className="h-[800px] bg-black" />,
  ssr: true,
});

const TalentTeaser = dynamic(() => import('@/components/sections/TalentTeaser'), {
  loading: () => <div className="h-[600px] bg-surface" />,
  ssr: true,
});

const CTABanner = dynamic(() => import('@/components/sections/CTABanner'), {
  loading: () => <div className="h-[400px] bg-black" />,
  ssr: true,
});

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <h1 className="sr-only">ASTROWAVE | Ghana&apos;s Creative Entertainment Powerhouse</h1>
      <HeroSection />
      <AboutTeaser />
      <EcosystemSection />
      <VibeNavigator />
      <FeaturedEvents />
      <TalentTeaser />
      <CTABanner />
    </div>
  );
}
