'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Info } from 'lucide-react';
import { calculateWaveScore, getWaveRank } from '@/lib/algorithms/waveScore';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface WaveScoreCardProps {
  waveScore: number;
  averageRating: number;
  eventCount: number;
  ratingCount: number;
  lastEventDate: any;
  recencyFactor: number;
  compact?: boolean;
}

export default function WaveScoreCard({
  waveScore,
  averageRating,
  eventCount,
  ratingCount,
  lastEventDate,
  recencyFactor,
  compact = false
}: WaveScoreCardProps) {
  const breakdown = calculateWaveScore(averageRating, eventCount, lastEventDate);
  const rank = getWaveRank(waveScore);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest">
        <Star size={12} fill="currentColor" className="text-gold" />
        <span>{waveScore.toFixed(1)}</span>
        <span className="text-white/20">•</span>
        <span>{rank.emoji} {rank.label}</span>
      </div>
    );
  }

  // Circular arc math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (waveScore / 5) * circumference;

  return (
    <Card className="p-8 space-y-10 relative overflow-hidden" glowColor="gold">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left: Big Score */}
        <div className="space-y-4 text-center md:text-left">
          <p className="font-mono text-[0.65rem] text-muted uppercase tracking-[0.3em] font-bold">WAVE SCORE</p>
          <div className="space-y-1">
            <h2 className="font-display text-[6rem] leading-none text-white text-glow-gold">
              {waveScore.toFixed(1)}
            </h2>
            <p className="text-muted text-[0.65rem] uppercase font-bold tracking-widest">out of 5.0</p>
          </div>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[0.7rem] uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: `${rank.color}15`, color: rank.color, border: `1px solid ${rank.color}30` }}
          >
            {rank.emoji} {rank.label}
          </div>
        </div>

        {/* Right: Circular Arc */}
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              stroke="currentColor" strokeWidth="8"
              fill="transparent" className="text-white/5"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="60" cy="60" r={radius}
              stroke="url(#score-gradient)" strokeWidth="10"
              fill="transparent" strokeDasharray={circumference}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD166" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="font-display text-4xl text-white">{waveScore.toFixed(1)}</span>
             <p className="text-[0.5rem] label m-0">POWER</p>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h4 className="text-[0.65rem] font-bold text-white uppercase tracking-widest">How it's calculated</h4>
           <div className="h-px flex-1 bg-white/5 mx-4" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
           {/* Row 1: Rating */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Rating Component (60%)</span>
                 <span className="text-gold">{breakdown.ratingComponent.toFixed(2)} pts</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.ratingComponent/3)*100}%` }}
                   className="h-full bg-gold" 
                 />
              </div>
              <p className="text-[0.55rem] text-muted font-mono uppercase tracking-tighter">
                Formula: ({averageRating} ÷ 5) × 3.0
              </p>
           </div>

           {/* Row 2: Experience */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Experience Component (20%)</span>
                 <span className="text-purple">{breakdown.experienceComponent.toFixed(2)} pts</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.experienceComponent/1)*100}%` }}
                   className="h-full bg-purple" 
                 />
              </div>
              <p className="text-[0.55rem] text-muted font-mono uppercase tracking-tighter">
                Formula: Min({eventCount} ÷ 20, 1) × 1.0
              </p>
           </div>

           {/* Row 3: Recency */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Recency Component (20%)</span>
                 <span className="text-cyan">{breakdown.recencyComponent.toFixed(2)} pts</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.recencyComponent/1)*100}%` }}
                   className="h-full bg-cyan" 
                 />
              </div>
              <p className="text-[0.55rem] text-muted font-mono uppercase tracking-tighter">
                {breakdown.recencyLabel} (Factor: {recencyFactor})
              </p>
           </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
           <div className="flex justify-between items-center text-sm font-display tracking-widest">
              <span className="text-muted uppercase">Total Wave Score</span>
              <span className="text-gold text-2xl">{waveScore.toFixed(2)}</span>
           </div>
           <p className="text-[0.55rem] text-white/20 font-mono leading-relaxed truncate">
             {breakdown.formula}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 text-center border-t border-white/5">
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{ratingCount}</p>
            <p className="text-[0.5rem] label m-0">REVIEWS</p>
         </div>
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{eventCount}</p>
            <p className="text-[0.5rem] label m-0">EVENTS</p>
         </div>
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{recencyFactor.toFixed(1)}</p>
            <p className="text-[0.5rem] label m-0">RECENCY</p>
         </div>
      </div>
    </Card>
  );
}
