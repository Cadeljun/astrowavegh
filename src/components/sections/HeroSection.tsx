'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { heroTextReveal, fadeIn, fadeUp } from '@/lib/animations';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-dark-bg grain px-6">
      {/* Floating Animated Orbs */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,201,107,0.12),transparent_70%)] animate-float-1 z-0 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(5,130,255,0.1),transparent_70%)] animate-float-2 z-0 pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl space-y-10">
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
            <Button size="lg" className="w-full sm:min-w-[200px]">EXPLORE EVENTS</Button>
          </Link>
          <Link href="/organizer/search" className="w-full sm:w-auto">
            <Button variant="outline-dark" size="lg" className="w-full sm:min-w-[200px]">FIND TALENT</Button>
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
          <div className="divider-dark mb-8" />
          <div className="flex justify-between items-center px-4">
             <div className="text-center">
                <p className="font-display text-2xl text-green">250+</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Talents</p>
             </div>
             <div className="w-px h-8 bg-dark-border" />
             <div className="text-center">
                <p className="font-display text-2xl text-green">180+</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Events</p>
             </div>
             <div className="w-px h-8 bg-dark-border" />
             <div className="text-center">
                <p className="font-display text-2xl text-green">98%</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-dark-muted">Match Rate</p>
             </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-dark-muted opacity-40"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
