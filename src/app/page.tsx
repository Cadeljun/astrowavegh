'use client';

import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import AboutTeaser from '@/components/sections/AboutTeaser';
import EcosystemSection from '@/components/sections/EcosystemSection';
import FeaturedEvents from '@/components/sections/FeaturedEvents';
import TalentTeaser from '@/components/sections/TalentTeaser';
import CTABanner from '@/components/sections/CTABanner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <HeroSection />
      
      <div className="wave-divider-to-light" />
      <AboutTeaser />

      <EcosystemSection />
      
      <div className="wave-divider-to-dark" />
      <FeaturedEvents />

      <div className="wave-divider-to-light" />
      <TalentTeaser />

      <div className="wave-divider-to-dark" />
      <CTABanner />
      
      <ScrollToTop />
    </div>
  );
}