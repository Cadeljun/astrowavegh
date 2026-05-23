'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { fadeUp } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';

interface CTABannerProps {
  overrideHeading?: string;
  overrideSubtext?: string;
}

export default function CTABanner({ overrideHeading, overrideSubtext }: CTABannerProps) {
  const { content } = useCMSContent('home', 'cta_banner', {
    heading: 'READY TO WAVE?',
    subtext: "Whether you're an artist, event lover, or brand — AstroWave has a space for you. Let's create something unforgettable.",
    cta1: 'BOOK AN EVENT',
    cta2: 'JOIN THE MOVEMENT'
  });

  const heading = overrideHeading || content.heading;
  const subtext = overrideSubtext || content.subtext;

  return (
    <section className="relative w-full py-[var(--space-2xl)] px-6 lg:px-12 overflow-hidden bg-[var(--color-black)] border-y border-[var(--color-border)]">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(5, 5, 5, 0.95) 40%, rgba(255, 209, 102, 0.08) 100%)' }} />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--color-purple)] opacity-[0.15] blur-[120px] rounded-full z-0" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--color-gold)] opacity-[0.15] blur-[120px] rounded-full z-0" />

      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
        <span className="font-display text-[12vw] lg:text-[18rem] text-white opacity-[0.03] leading-none tracking-tighter">ASTROWAVE</span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <motion.h2 className="display-xl text-glow-gold" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {heading}
        </motion.h2>
        <motion.p className="body-lg text-[var(--color-muted)] max-w-[560px] mx-auto" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }}>
          {subtext}
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.4 }}>
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              {overrideHeading ? 'FIND TALENT' : content.cta1}
            </Button>
          </Link>
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              {overrideHeading ? 'JOIN AS TALENT' : content.cta2}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
