'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import { heroTextReveal, fadeIn, fadeUp } from '@/lib/animations';
import { useCMSContent, useCMSSettings } from '@/lib/cms/useCMS';
import { CloudinaryPresets } from '@/lib/cloudinary/getUrl';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  const { settings } = useCMSSettings();
  
  const { content } = useCMSContent('home', 'hero', {
    label: "AFRICA'S CREATIVE POWERHOUSE",
    heading: "ASTROWAVE",
    tagline: "Vibes Beyond the Horizon.",
    cta1: "EXPLORE EVENTS",
    cta2: "OUR STORY"
  });

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--color-black)]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {settings?.heroVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={settings.heroPosterUrl ? CloudinaryPresets.heroBg(settings.heroPosterUrl) : ''}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={settings.heroVideoUrl} type="video/mp4" />
          </video>
        ) : settings?.heroImageUrl ? (
          <CloudinaryImage
            src={settings.heroImageUrl}
            alt="AstroWave hero background"
            fill
            priority
            transforms={{
              width: 1920,
              height: 1080,
              crop: 'fill',
              quality: 'auto'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple/20 via-black to-gold/10" />
        )}
        
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
