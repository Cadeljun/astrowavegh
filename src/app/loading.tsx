'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full border-[2px] border-white/5 border-t-gold shadow-[0_0_10px_rgba(255,209,102,0.3)]"
        />
      </div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="font-display text-[1.2rem] text-muted tracking-[0.3em]"
      >
        LOADING...
      </motion.span>
    </div>
  );
}
