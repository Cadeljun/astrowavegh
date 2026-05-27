'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[2000] bg-dark-bg flex flex-col items-center justify-center">
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Logo height={60} />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-body italic text-[0.95rem] text-dark-subtext tracking-wide"
        >
          "Vibes Beyond the Horizon."
        </motion.p>
      </div>

      {/* Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
          className="h-full bg-green shadow-[0_0_12px_rgba(0,201,107,0.6)]"
        />
      </div>
    </div>
  );
}
