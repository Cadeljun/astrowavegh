'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NeonLine } from '@/components/ui/NeonLine';
import { heroTextReveal, fadeIn, fadeUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--color-black)]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=800&auto=format&fit=crop"
          className="w-full h-full object-cover"
        >
          {/* Using a high-quality nightlife stock video placeholder */}
          <source src="https://player.vimeo.com/external/494163965.hd.mp4?s=78473e047ed6b785f79a29a101287c2b64a13e61&profile_id=175" type="video/mp4" />
        </video>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/65 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-black)] z-20" />
      </div>

      {/* Decorative Lines */}
      <div className="hidden lg:block absolute left-[10%] top-1/2 -translate-y-1/2 z-30 opacity-30">
        <NeonLine orientation="vertical" color="purple" length="180px" />
      </div>
      <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 z-30 opacity-20">
        <NeonLine orientation="vertical" color="cyan" length="120px" />
      </div>

      {/* Radial Glow */}
      <div className="absolute inset-0 z-20 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 209, 102, 0.08), transparent)' 
        }} 
      />

      {/* Content */}
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
            <span className="hidden sm:inline">AFRICA'S </span>CREATIVE POWERHOUSE
          </span>
          <span className="hidden sm:block h-[1px] w-12 bg-[var(--color-gold)]/50" />
        </motion.div>

        <motion.h1
          variants={heroTextReveal}
          initial="hidden"
          animate="show"
          className="display-2xl text-glow-gold mb-4"
        >
          ASTROWAVE
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.9 }}
          className="font-body italic text-[1.1rem] md:text-[1.3rem] text-[var(--color-muted)] mb-12"
        >
          "Vibes Beyond the Horizon."
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button variant="primary" size="lg" asChild className="group w-full sm:w-auto">
            <Link href="/events" className="flex items-center gap-2">
              Explore Events
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto">
            <Link href="/about">Our Story</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
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
