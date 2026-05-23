'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import TalentCard from '@/components/talent/TalentCard';
import { staggerContainer, scaleIn } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function TalentTeaser() {
  const { content } = useCMSContent('home', 'talent', {
    label: 'OUR ROSTER',
    heading: 'THE TALENT',
    subtitle: 'The faces behind the wave.'
  });

  const dj1 = PlaceHolderImages.find(img => img.id === 'dj-roster-1')?.imageUrl || '';
  const dj2 = PlaceHolderImages.find(img => img.id === 'dj-roster-2')?.imageUrl || '';
  const art1 = PlaceHolderImages.find(img => img.id === 'artist-roster-1')?.imageUrl || '';

  const talent = [
    { name: 'DJ Horizon', role: 'DJ' as const, bio: 'Accra-based DJ delivering high-energy sets across Ghana. Known for seamless Amapiano and Afrobeats mixes.', imageUrl: dj1 },
    { name: 'DJ Void', role: 'DJ' as const, bio: 'Pushing boundaries with futuristic house and electronic rhythms. A staple of the AstroWave night.', imageUrl: dj2 },
    { name: 'Uzy', role: 'Artist' as const, bio: 'The creative pulse of the brand. A fresh voice redefining the sound of modern African storytelling.', imageUrl: art1 }
  ];

  return (
    <section 
      className="bg-[var(--color-surface)] py-32 px-6 lg:px-12 relative"
      style={{ clipPath: 'polygon(0 0, 100% 40px, 100% 100%, 0 100%)' }}
    >
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading 
          label={content.label}
          title={content.heading}
          subtitle={content.subtitle}
          align="center"
          className="mb-20"
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {talent.map((item, i) => (
            <motion.div key={i} variants={scaleIn}>
              <TalentCard {...item} />
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center">
          <Link href="/management">
            <Button variant="ghost" className="hover:text-green">MEET THE FULL ROSTER &rarr;</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
