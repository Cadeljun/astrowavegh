
'use client';

import React from 'react';
import { MapPin, Tag, Waves } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MatchBreakdownProps {
  matchPercentage: number;
  locationScore: number;
  categoryScore: number;
  waveContribution: number;
  locationReason?: string;
  categoryReason?: string;
  compact?: boolean;
}

export function MatchBreakdown({
  matchPercentage,
  locationScore,
  categoryScore,
  waveContribution,
  locationReason,
  categoryReason,
  compact = false
}: MatchBreakdownProps) {
  
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 w-full max-w-[200px]">
        <div className="flex-1 flex gap-0.5 h-1">
          <div className="h-full bg-cyan-500" style={{ width: `${(locationScore/30)*100}%` }} />
          <div className="h-full bg-gold" style={{ width: `${(categoryScore/40)*100}%` }} />
          <div className="h-full bg-purple" style={{ width: `${(waveContribution/30)*100}%` }} />
        </div>
        <span className="text-[0.6rem] font-bold text-white">{matchPercentage}%</span>
      </div>
    );
  }

  const scoreColor = 
    matchPercentage >= 90 ? 'text-green-400' :
    matchPercentage >= 70 ? 'text-gold' :
    matchPercentage >= 50 ? 'text-orange-400' :
    'text-muted';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h4 className="text-[0.65rem] font-bold text-white uppercase tracking-[0.2em]">MATCH BREAKDOWN</h4>
        <p className={cn("text-2xl font-display tracking-widest", scoreColor)}>{matchPercentage}% VIBE SYNC</p>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[0.6rem] font-bold uppercase">
            <span className="flex items-center gap-2 text-cyan-400"><MapPin size={12} /> Location Alignment</span>
            <span className="text-white">{locationScore}/30 pts</span>
          </div>
          <Progress value={(locationScore / 30) * 100} className="h-1 bg-white/5" />
          <p className="text-[0.55rem] text-muted italic">{locationReason || 'Scored based on geographic proximity.'}</p>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[0.6rem] font-bold uppercase">
            <span className="flex items-center gap-2 text-gold"><Tag size={12} /> Category Fit</span>
            <span className="text-white">{categoryScore}/40 pts</span>
          </div>
          <Progress value={(categoryScore / 40) * 100} className="h-1 bg-white/5" />
          <p className="text-[0.55rem] text-muted italic">{categoryReason || 'Scored based on artist specialty match.'}</p>
        </div>

        {/* Wave Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[0.6rem] font-bold uppercase">
            <span className="flex items-center gap-2 text-purple"><Waves size={12} /> Wave Score Contribution</span>
            <span className="text-white">{waveContribution.toFixed(1)}/30 pts</span>
          </div>
          <Progress value={(waveContribution / 30) * 100} className="h-1 bg-white/5" />
          <p className="text-[0.55rem] text-muted italic">Professional standing factor derived from community ratings.</p>
        </div>
      </div>
    </div>
  );
}
