'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeUp, 
  fadeIn, 
  scaleIn, 
  heroTextReveal, 
  staggerContainer,
  cardHover 
} from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Play, RotateCcw } from 'lucide-react';

const animations = [
  { name: 'fadeUp', variants: fadeUp },
  { name: 'fadeIn', variants: fadeIn },
  { name: 'scaleIn', variants: scaleIn },
  { name: 'heroTextReveal', variants: heroTextReveal },
];

export default function DevAnimationsPage() {
  const [keys, setKeys] = useState<Record<string, number>>({
    fadeUp: 0,
    fadeIn: 0,
    scaleIn: 0,
    heroTextReveal: 0,
    stagger: 0
  });

  const replay = (name: string) => {
    setKeys(prev => ({ ...prev, [name]: prev[name] + 1 }));
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {animations.map((anim) => (
          <section key={anim.name} className="p-8 rounded-md bg-[#0A0A0F] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gold uppercase">{anim.name}</span>
              <button onClick={() => replay(anim.name)} className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-all">
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="h-40 flex items-center justify-center bg-black/40 rounded-sm border border-white/5 relative overflow-hidden">
               <motion.div
                 key={`${anim.name}-${keys[anim.name]}`}
                 variants={anim.variants}
                 initial="hidden"
                 animate="show"
                 className="p-6 glass border-gold text-white font-bold tracking-widest text-center"
               >
                 ANIMATION PREVIEW
               </motion.div>
            </div>

            <Button size="sm" variant="ghost" className="w-full border border-white/5" onClick={() => replay(anim.name)}>
              <Play size={14} className="mr-2" /> PLAY
            </Button>
          </section>
        ))}
      </div>

      <section className="p-8 rounded-md bg-[#0A0A0F] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gold uppercase">staggerContainer + scaleIn</span>
          <button onClick={() => replay('stagger')} className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-all">
            <RotateCcw size={14} />
          </button>
        </div>

        <motion.div
          key={`stagger-${keys['stagger']}`}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-4"
        >
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} variants={scaleIn} className="aspect-square glass flex items-center justify-center text-gold font-bold border-white/10">
              {i}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="p-8 rounded-md bg-[#0A0A0F] border border-white/5 space-y-6">
        <span className="text-xs font-bold text-gold uppercase">cardHover (Interactive)</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-12 text-center" glowColor="gold">
            HOVER ME (GOLD)
          </Card>
          <Card className="p-12 text-center" glowColor="purple">
            HOVER ME (PURPLE)
          </Card>
          <Card className="p-12 text-center" glowColor="cyan">
            HOVER ME (CYAN)
          </Card>
        </div>
      </section>
    </div>
  );
}
