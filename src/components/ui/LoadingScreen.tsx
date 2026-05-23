'use client';

import React, { border, motion } from 'framer-motion';
import { heroTextReveal, fadeIn } from '@/lib/animations';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeIn' }}
      className="fixed inset-0 z-[9998] bg-[var(--color-black)] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Grain Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          variants={heroTextReveal}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <Logo height={56} linkTo="" />
        </motion.div>
        
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
          className="font-body italic text-[1rem] text-[var(--color-muted)] mt-2"
        >
          "Vibes Beyond the Horizon."
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
          className="h-full bg-[var(--color-green)] shadow-[0_0_15px_var(--color-green)]"
        />
      </div>
    </motion.div>
  );
}
