'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { fadeUp } from '@/lib/animations';

export default function CTABanner() {
  return (
    <section className="relative w-full py-32 px-6 lg:px-12 bg-dark-bg overflow-hidden border-t border-dark-border">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#050E1A_0%,#081525_100%)] z-0" />
      
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[linear-gradient(90deg,transparent_0%,var(--green)_30%,var(--cyan)_60%,transparent_100%)] z-10" />

      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.03]">
        <span className="font-display text-[20vw] leading-none tracking-tighter text-white">ASTROWAVE</span>
      </div>

      <div className="relative z-20 max-w-4xl mx-auto text-center space-y-10">
        <motion.h2 
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="display-xl text-gradient"
        >
          Ready to Wave?
        </motion.h2>
        
        <motion.p 
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="body-lg text-dark-subtext max-w-xl mx-auto"
        >
          Whether you're an artist, event lover, or brand — AstroWave has a space for you. Let's create something unforgettable.
        </motion.p>

        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/organizer/post-event" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:min-w-[240px]">BOOK AN EVENT</Button>
          </Link>
          <Link href="/management" className="w-full sm:w-auto">
            <Button variant="outline-dark" size="lg" className="w-full sm:min-w-[240px]">JOIN THE MOVEMENT</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
