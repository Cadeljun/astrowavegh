'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Waves, Sliders, Play, RotateCcw, Calculator, Users, RefreshCw, Loader2, Award } from 'lucide-react';
import { calculateWaveScore, getWaveRank } from '@/lib/algorithms/waveScore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function WaveScoreSimulatorPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Simulator State
  const [avgRating, setAvgRating] = useState(4.5);
  const [eventCount, setEventCount] = useState(12);
  const [daysSince, setDaysSince] = useState(10);
  
  // Roster State
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  const { data: roster, loading: rosterLoading } = useCollection(
    query(collection(db, 'talent_profiles'), orderBy('waveScore', 'desc'))
  );

  const breakdown = useMemo(() => {
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysSince);
    return calculateWaveScore(avgRating, eventCount, lastDate);
  }, [avgRating, eventCount, daysSince]);

  const rank = getWaveRank(breakdown.waveScore);

  const bulkRecalculate = async () => {
    if (!roster) return;
    setIsUpdatingAll(true);
    setUpdateProgress(0);
    
    let successCount = 0;
    for (let i = 0; i < roster.length; i++) {
      try {
        const res = await fetch('/api/wave-score/update', {
          method: 'POST',
          body: JSON.stringify({ talentId: roster[i].id })
        });
        if (res.ok) successCount++;
        setUpdateProgress(((i + 1) / roster.length) * 100);
      } catch (e) {
        console.error(e);
      }
    }
    
    toast({ title: "Bulk Update Complete", description: `${successCount} profiles synchronized.` });
    setIsUpdatingAll(false);
  };

  return (
    <div className="space-y-12">
      <SectionHeading 
        label="ALGORITHM_DEBUG"
        title="WAVE SCORE SIMULATOR"
        subtitle="Test component sensitivity and perform platform-wide talent synchronization."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator Controls */}
        <Card className="lg:col-span-1 p-8 space-y-10" glowColor="gold">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <Sliders size={18} className="text-gold" />
             <h3 className="font-display text-xl text-white uppercase tracking-wider">Input Parameters</h3>
          </div>

          <div className="space-y-8">
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="admin-label m-0">Average Rating</label>
                   <span className="text-gold font-bold text-lg">{avgRating.toFixed(1)} ★</span>
                </div>
                <input 
                  type="range" min="0" max="5" step="0.1" 
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-gold cursor-pointer"
                  value={avgRating} onChange={e => setAvgRating(parseFloat(e.target.value))}
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="admin-label m-0">Event Volume</label>
                   <span className="text-gold font-bold text-lg">{eventCount} Gigs</span>
                </div>
                <input 
                  type="range" min="0" max="50" step="1" 
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-gold cursor-pointer"
                  value={eventCount} onChange={e => setEventCount(parseInt(e.target.value))}
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="admin-label m-0">Days Since Last Event</label>
                   <span className="text-gold font-bold text-lg">{daysSince} Days</span>
                </div>
                <input 
                  type="range" min="0" max="120" step="1" 
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-gold cursor-pointer"
                  value={daysSince} onChange={e => setDaysSince(parseInt(e.target.value))}
                />
             </div>
          </div>

          <Button 
            variant="ghost" className="w-full border border-white/5 text-[0.6rem] font-bold"
            onClick={() => { setAvgRating(4.5); setEventCount(12); setDaysSince(10); }}
          >
            <RotateCcw size={12} className="mr-2" /> RESET TO NOMINAL
          </Button>
        </Card>

        {/* Simulator Results */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-10 bg-[#0A0A0F] border-t-2 border-gold" glowColor="gold">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                 <div className="space-y-2 text-center md:text-left">
                    <p className="text-[0.6rem] text-muted uppercase font-bold tracking-[0.4em]">CALCULATED_SCORE</p>
                    <h2 className="font-display text-[8rem] leading-none text-white text-glow-gold">{breakdown.waveScore.toFixed(2)}</h2>
                    <div 
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-[0.8rem] uppercase tracking-widest mt-4 shadow-xl"
                      style={{ backgroundColor: `${rank.color}15`, color: rank.color, border: `1px solid ${rank.color}40` }}
                    >
                      {rank.emoji} {rank.label}
                    </div>
                 </div>

                 <div className="p-8 rounded-2xl bg-black/40 border border-white/5 space-y-6 flex-1 max-w-sm">
                    <div className="flex justify-between items-center text-[0.7rem] font-bold uppercase">
                       <span className="text-white/40">Rating Pts</span>
                       <span className="text-gold">{breakdown.ratingComponent.toFixed(2)} / 3.0</span>
                    </div>
                    <div className="flex justify-between items-center text-[0.7rem] font-bold uppercase">
                       <span className="text-white/40">Experience Pts</span>
                       <span className="text-purple">{breakdown.experienceComponent.toFixed(2)} / 1.0</span>
                    </div>
                    <div className="flex justify-between items-center text-[0.7rem] font-bold uppercase">
                       <span className="text-white/40">Recency Pts</span>
                       <span className="text-cyan">{breakdown.recencyComponent.toFixed(2)} / 1.0</span>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <p className="text-[0.55rem] text-muted font-mono leading-relaxed">{breakdown.formula}</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-8 space-y-6 bg-black/20" glowColor="muted">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Users size={18} className="text-purple" />
                    <h3 className="font-display text-xl text-white uppercase tracking-wider">Talent Roster Sync</h3>
                 </div>
                 <Button size="sm" onClick={bulkRecalculate} disabled={isUpdatingAll || rosterLoading}>
                    {isUpdatingAll ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                    SYNC ALL SCORES
                 </Button>
              </div>

              {isUpdatingAll && (
                <div className="space-y-2">
                   <div className="flex justify-between text-[0.6rem] font-bold text-gold">
                      <span>PROCESSING BATCH...</span>
                      <span>{Math.round(updateProgress)}%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gold shadow-[0_0_10px_var(--color-gold)]" animate={{ width: `${updateProgress}%` }} />
                   </div>
                </div>
              )}

              <div className="overflow-x-auto">
                 <table className="admin-table text-[0.7rem]">
                    <thead>
                       <tr>
                          <th>Talent</th>
                          <th>Current Score</th>
                          <th>Rank</th>
                          <th>Avg Rating</th>
                          <th>Events</th>
                          <th className="text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {rosterLoading ? (
                         [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-12 bg-white/5" /></tr>)
                       ) : roster?.map(t => (
                         <tr key={t.id}>
                            <td className="font-bold text-white uppercase">{t.stageName}</td>
                            <td className="font-display text-lg text-gold tracking-widest">{(t.waveScore || 0).toFixed(1)}</td>
                            <td>{getWaveRank(t.waveScore || 0).label}</td>
                            <td className="text-muted">{t.averageRating || 0} ★</td>
                            <td className="text-muted">{t.eventCount || 0}</td>
                            <td className="text-right">
                               <button 
                                 onClick={async () => {
                                   await fetch('/api/wave-score/update', { method: 'POST', body: JSON.stringify({ talentId: t.id })});
                                   toast({ title: "Updated" });
                                 }}
                                 className="p-2 hover:bg-white/5 text-gold rounded-sm transition-all"
                               >
                                 <RefreshCw size={12} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
