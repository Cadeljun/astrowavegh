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
import { NeonLine } from '@/components/ui/NeonLine';

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue/20 via-black to-green/10" />
        )}
        
        <div className="absolute inset-0 bg-black/65 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[var(--color-black)] z-20" />
      </div>

      <div className="relative z-30 text-center px-6 max-w-5xl">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <NeonLine orientation="horizontal" color="blue" length="48px" className="opacity-50" />
          <span className="label text-[var(--color-green)] tracking-[0.3em] font-bold">
            {content.label}
          </span>
          <NeonLine orientation="horizontal" color="sky" length="48px" className="opacity-50" />
        </motion.div>

        <motion.h1
          variants={heroTextReveal}
          initial="hidden"
          animate="show"
          className="display-2xl text-green text-glow-green mb-4"
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
            <Button variant="ghost" size="lg" className="hover:text-green">
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
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-10 opacity-10" style={{ background: 'radial-gradient(circle, #00FF87 0%, transparent 70%)' }} />
    </section>
  );
}
