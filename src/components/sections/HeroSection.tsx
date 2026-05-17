'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { heroTextReveal, fadeIn, fadeUp } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  
  const { content } = useCMSContent('home', 'hero', {
    label: "AFRICA'S CREATIVE POWERHOUSE",
    heading: "ASTROWAVE",
    tagline: "Vibes Beyond the Horizon.",
    cta1: "EXPLORE EVENTS",
    cta2: "OUR STORY"
  });

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-fallback');

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--color-black)]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroPlaceholder?.imageUrl}
          className="w-full h-full object-cover"
          data-ai-hint="cinematic nightlife"
        >
          <source src="https://player.vimeo.com/external/494163965.hd.mp4?s=78473e047ed6b785f79a29a101287c2b64a13e61&profile_id=175" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-black/65 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-black)] z-20" />
      </div>

      <div className="relative z-30 text-center px-6 max-w-5xl">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <span className="hidden sm:block h-[1px] w-12 bg-[var(--color-gold)]/50" />
          <span className="label text-[var(--color-gold)] tracking-[0.3em]">
            {content.label}
          </span>
          <span className="hidden sm:block h-[1px] w-12 bg-[var(--color-gold)]/50" />
        </motion.div>

        <motion.h1
          variants={heroTextReveal}
          initial="hidden"
          animate="show"
          className="display-2xl text-glow-gold mb-4"
        >
          {content.heading}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.9 }}
          className="font-body italic text-[1.1rem] md:text-[1.3rem] text-[var(--color-muted)] mb-12"
        >
          "{content.tagline}"
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/events">
            <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              {content.cta1}
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="lg">
              {content.cta2}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="animate-bounce">
          <ChevronDown size={28} className="text-[var(--color-muted)]" />
        </div>
      </motion.div>
    </section>
  );
}