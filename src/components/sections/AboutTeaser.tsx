'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { NeonLine } from '@/components/ui/NeonLine';
import { fadeUp, fadeIn, staggerContainer, scaleIn } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';

export default function AboutTeaser() {
  const { content } = useCMSContent('home', 'about_teaser', {
    label: 'OUR STORY',
    heading: 'A Movement, Not Just A Brand.',
    body: 'AstroWave is a creative force redefining African entertainment. From immersive nightlife experiences to nurturing the continent\'s boldest talents — we exist where music, culture, and ambition collide.',
    cta: 'DISCOVER ASTROWAVE →'
  });

  const stats = [
    { value: '2+', label: 'DJs Managed' },
    { value: '1', label: 'Artist Signed' },
    { value: '∞', label: 'Vibes Delivered' },
  ];

  return (
    <section className="bg-[var(--color-surface)] py-[var(--space-2xl)] px-6 lg:px-12 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
        <motion.div 
          className="w-full lg:w-[60%] space-y-8 relative"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <NeonLine orientation="vertical" length="80px" color="green" className="absolute -left-8 top-0 opacity-50 hidden lg:block" />
          
          <div className="space-y-4">
            <SectionLabel>{content.label}</SectionLabel>
            <h2 className="display-lg">{content.heading}</h2>
          </div>

          <p className="body-lg text-[var(--color-muted)] max-w-xl">
            {content.body}
          </p>

          <Link href="/about">
            <Button variant="ghost" className="group flex items-center gap-2 hover:text-green">
              {content.cta}
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          className="w-full lg:w-[40%] relative flex flex-col items-center lg:items-end"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="hidden lg:block absolute -top-20 right-0 z-0 pointer-events-none">
            <span className="font-display text-[8rem] leading-[0.9] text-transparent" style={{ WebkitTextStroke: '1px rgba(0, 255, 135, 0.15)' }}>
              EST.<br />2024
            </span>
          </div>

          <motion.div 
            className="relative z-10 flex lg:flex-col gap-6 w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x"
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={scaleIn} className="snap-center min-w-[180px]">
                <Card className="p-6 border-t-2 border-t-[var(--color-green)]" glowColor="green">
                  <div className="font-display text-[2.5rem] text-[var(--color-green)] leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="font-body text-[0.75rem] uppercase tracking-widest text-[var(--color-muted)] font-semibold">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
