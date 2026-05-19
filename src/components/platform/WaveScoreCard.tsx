'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Award, Info, Activity } from 'lucide-react';
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
        <Star size={12} fill="currentColor" />
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
    <Card className="p-8 space-y-8 relative overflow-hidden" glowColor="gold">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left: Big Score */}
        <div className="space-y-4 text-center md:text-left">
          <p className="font-mono text-[0.65rem] text-muted uppercase tracking-[0.3em]">PLATFORM_WAVE_SCORE</p>
          <div className="space-y-1">
            <h2 className="font-display text-[6rem] leading-none text-white text-glow-gold">
              {waveScore.toFixed(1)}
            </h2>
            <p className="text-muted text-xs uppercase font-bold tracking-widest">Community Reliability Metric</p>
          </div>
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[0.7rem] uppercase tracking-widest"
            style={{ backgroundColor: `${rank.color}15`, color: rank.color, border: `1px solid ${rank.color}30` }}
          >
            {rank.emoji} {rank.label}
          </div>
        </div>

        {/* Right: Circular Arc */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80" cy="80" r={radius}
              stroke="currentColor" strokeWidth="8"
              fill="transparent" className="text-white/5"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="80" cy="80" r={radius}
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
             <Zap size={32} className="text-gold mb-1 opacity-20" />
             <p className="text-xs font-display text-white">TOP {Math.round((waveScore/5)*100)}%</p>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <p className="text-[0.6rem] label flex items-center gap-2 text-muted uppercase">
          <Info size={12} /> Calculation Breakdown
        </p>
        
        <div className="space-y-6">
           {/* Row 1: Rating */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Community Feedback (60%)</span>
                 <span className="text-gold">{breakdown.ratingComponent.toFixed(2)} / 3.00</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.ratingComponent/3)*100}%` }}
                   className="h-full bg-gold" 
                 />
              </div>
           </div>

           {/* Row 2: Experience */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Event Volume (20%)</span>
                 <span className="text-purple">{breakdown.experienceComponent.toFixed(2)} / 1.00</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.experienceComponent/1)*100}%` }}
                   className="h-full bg-purple" 
                 />
              </div>
           </div>

           {/* Row 3: Recency */}
           <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight">
                 <span className="text-white/60">Market Consistency (20%)</span>
                 <span className="text-cyan">{breakdown.recencyComponent.toFixed(2)} / 1.00</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${(breakdown.recencyComponent/1)*100}%` }}
                   className="h-full bg-cyan" 
                 />
              </div>
           </div>
        </div>

        <div className="p-4 rounded-lg bg-black/40 border border-white/5">
           <p className="font-mono text-[0.6rem] text-muted leading-relaxed uppercase">
             <span className="text-gold">Formula:</span> {breakdown.formula}
           </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 text-center">
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{ratingCount}</p>
            <p className="text-[0.55rem] label m-0">REVIEWS</p>
         </div>
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{eventCount}</p>
            <p className="text-[0.55rem] label m-0">EVENTS</p>
         </div>
         <div className="space-y-1">
            <p className="text-lg font-display text-white">{breakdown.recencyLabel.split(' ')[1] || 'N/A'}</p>
            <p className="text-[0.55rem] label m-0">RECENCY</p>
         </div>
      </div>
    </Card>
  );
}
