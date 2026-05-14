import HeroSection from '@/components/sections/HeroSection';
import AboutTeaser from '@/components/sections/AboutTeaser';
import EcosystemSection from '@/components/sections/EcosystemSection';
import FeaturedEvents from '@/components/sections/FeaturedEvents';
import TalentTeaser from '@/components/sections/TalentTeaser';
import CTABanner from '@/components/sections/CTABanner';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <AboutTeaser />
      <EcosystemSection />
      <FeaturedEvents />
      <TalentTeaser />
      <CTABanner />
    </div>
  );
}
