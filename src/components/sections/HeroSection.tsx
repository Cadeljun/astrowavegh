'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { heroTextReveal, fadeIn, fadeUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Cinematic media assets for the hero cycle
const HERO_MEDIA = [
  {
    type: 'video',
    url: 'https://res.cloudinary.com/dmd5bq3va/video/upload/v1740003000/astrowave/hero-nightlife.mp4',
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1920&h=1080&auto=format&fit=crop',
    label: 'Experience the Vibe'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=1920&h=1080&auto=format&fit=crop',
    label: 'Discover the Wave'
  },
  {
    type: 'video',
    url: 'https://res.cloudinary.com/dmd5bq3va/video/upload/v1740003001/astrowave/hero-talent.mp4',
    poster: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=1920&h=1080&auto=format&fit=crop',
    label: 'Elite Roster'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1920&h=1080&auto=format&fit=crop',
    label: 'Unforgettable Moments'
  }
];

const CYCLE_TIME = 8000; // 8 seconds per slide

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_MEDIA.length);
    }, CYCLE_TIME);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-dark-bg grain px-6">
      {/* Dynamic Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {HERO_MEDIA[index].type === 'video' ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={HERO_MEDIA[index].poster}
                className="w-full h-full object-cover grayscale-[20%] opacity-40"
              >
                <source src={HERO_MEDIA[index].url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={HERO_MEDIA[index].url}
                alt={HERO_MEDIA[index].label}
                className="w-full h-full object-cover grayscale-[20%] opacity-40"
              />
            )}
            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-transparent to-dark-bg z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/60 via-transparent to-dark-bg/60 z-10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Animated Orbs (Clean Wave Signature) */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,201,107,0.1),transparent_70%)] animate-float-1 z-1 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(5,130,255,0.08),transparent_70%)] animate-float-2 z-1 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 text-center max-w-4xl space-y-10">
        <motion.div variants={fadeIn} initial="hidden" animate="show">
          <SectionLabel theme="dark">Africa's Creative Powerhouse</SectionLabel>
        </motion.div>
        
        <div className="space-y-2">
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-2xl text-white">
            Vibes Beyond
          </motion.h1>
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-2xl text-gradient">
            the Horizon.
          </motion.h1>
        </div>
        
        <motion.p 
          variants={fadeUp} 
          initial="hidden" 
          animate="show" 
          transition={{ delay: 0.8 }} 
          className="body-lg text-dark-subtext max-w-2xl mx-auto"
        >
          AstroWave connects event organizers with Ghana's best talent through 
          intelligent matching. Powered by the Wave Score algorithm.
        </motion.p>

        <motion.div 
          variants={fadeUp} 
          initial="hidden" 
          animate="show" 
          transition={{ delay: 1.1 }} 
          className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6"
        >
          <Link href="/events" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:min-w-[200px]">Explore Events</Button>
          </Link>
          <Link href="/organizer/search" className="w-full sm:w-auto">
            <Button variant="outline-dark" size="lg" className="w-full sm:min-w-[200px]">Find Talent</Button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.4 }}
          className="pt-16 max-w-lg mx-auto"
        >
          <div className="divider-dark mb-8 opacity-20" />
          <div className="flex justify-between items-center px-4">
             <div className="text-center group cursor-default">
                <p className="font-display text-3xl text-green group-hover:text-glow-green transition-all">250+</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Talents</p>
             </div>
             <div className="w-px h-8 bg-dark-border opacity-30" />
             <div className="text-center group cursor-default">
                <p className="font-display text-3xl text-green group-hover:text-glow-green transition-all">180+</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Events</p>
             </div>
             <div className="w-px h-8 bg-dark-border opacity-30" />
             <div className="text-center group cursor-default">
                <p className="font-display text-3xl text-green group-hover:text-glow-green transition-all">98%</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Match Rate</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {HERO_MEDIA.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="group relative p-2"
          >
            <div className={cn(
              "h-1 transition-all duration-500 rounded-full",
              index === i ? "w-8 bg-green" : "w-4 bg-white/20 group-hover:bg-white/40"
            )} />
          </button>
        ))}
      </div>

      {/* Scroll Hint */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-dark-muted opacity-40 z-30"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}
