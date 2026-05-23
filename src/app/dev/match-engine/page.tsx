'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin, Award, Star, RefreshCw, Loader2, Activity, Terminal, CheckCircle, Info, Database } from 'lucide-react';
import { calculateMatchPercentage, runMatchingEngine } from '@/lib/algorithms/matchEngine';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GHANA_CITIES } from '@/lib/constants/ghana';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function MatchEngineDevPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Simulator State
  const [simEvent, setSimEvent] = useState({ city: 'Accra', region: 'Greater Accra', talentCategory: 'DJ' });
  const [simTalent, setSimTalent] = useState({ city: 'Accra', region: 'Greater Accra', category: 'DJ', waveScore: 4.5 });

  // Live Match State
  const [selectedEventId, setSelectedEventId] = useState('');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const { data: openEvents } = useCollection(query(collection(db, 'platform_events'), where('status', '==', 'open')));

  const simResult = useMemo(() => {
    return calculateMatchPercentage(simTalent as any, simEvent as any);
  }, [simEvent, simTalent]);

  const handleRunLiveMatch = async () => {
    if (!selectedEventId) return;
    setRunning(true);
    try {
      const res = await fetch('/api/match/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId })
      });
      const data = await res.json();
      
      if (data.success) {
        // Fetch the fresh results from Firestore matches collection
        const matchSnap = await getDoc(doc(db, 'matches', selectedEventId));
        if (matchSnap.exists()) {
          setLiveResults(matchSnap.data().results);
          toast({ title: 'Engine Success', description: `Matched ${data.matchCount} talents.` });
        }
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Engine Failure' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-12">
      <SectionHeading 
        label="CORE_ALGORITHM"
        title="MATCH ENGINE AUDIT"
        subtitle="Real-time simulation and live event matching for the Vibe Sync algorithm."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator */}
        <Card className="p-8 space-y-10 border-t-2 border-cyan-500" glowColor="cyan">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Activity size={18} className="text-cyan-400" />
              <h3 className="font-display text-xl text-white uppercase tracking-wider">Vibe Sync Simulator</h3>
           </div>

           <div className="grid grid-cols-2 gap-10">
              <div className="space-y-6">
                 <p className="text-[0.6rem] label m-0 opacity-40">EVENT PARAMETERS</p>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="admin-label">Event City</label>
                       <select className="admin-input h-10 text-xs" value={simEvent.city} onChange={e => setSimEvent({...simEvent, city: e.target.value})}>
                          {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="admin-label">Talent Needed</label>
                       <select className="admin-input h-10 text-xs" value={simEvent.talentCategory} onChange={e => setSimEvent({...simEvent, talentCategory: e.target.value})}>
                          <option value="DJ">DJ</option>
                          <option value="MC">MC</option>
                          <option value="Band">Band</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <p className="text-[0.6rem] label m-0 opacity-40">TALENT DATA</p>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="admin-label">Talent City</label>
                       <select className="admin-input h-10 text-xs" value={simTalent.city} onChange={e => setSimTalent({...simTalent, city: e.target.value})}>
                          {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="admin-label">Wave Score (0-5)</label>
                       <div className="flex items-center gap-4">
                          <input type="range" min="0" max="5" step="0.1" className="flex-1 accent-gold" value={simTalent.waveScore} onChange={e => setSimTalent({...simTalent, waveScore: parseFloat(e.target.value)})} />
                          <span className="text-gold font-bold">{simTalent.waveScore.toFixed(1)}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-2xl bg-black/40 border border-white/5 space-y-6">
              <div className="flex justify-between items-end">
                 <div className="space-y-1">
                    <p className="text-[0.6rem] text-muted uppercase font-bold tracking-widest">CALCULATED_SYNC</p>
                    <h2 className="font-display text-6xl text-white text-glow-cyan">{simResult.matchPercentage}%</h2>
                 </div>
                 <div className="text-right space-y-2">
                    <div className="flex flex-col gap-1 text-[0.6rem] font-bold text-white/40 uppercase">
                       <span>📍 Location: {simResult.locationScore}/30</span>
                       <span>🎵 Category: {simResult.categoryScore}/40</span>
                       <span>⭐ Wave Rank: {simResult.waveContribution.toFixed(1)}/30</span>
                    </div>
                 </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                 <p className="font-mono text-[10px] text-cyan-400/60 leading-relaxed whitespace-pre-wrap">{simResult.explanation}</p>
              </div>
           </div>
        </Card>

        {/* Live Matcher */}
        <Card className="p-8 space-y-8 border-t-2 border-gold" glowColor="gold">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                 <Database size={18} className="text-gold" />
                 <h3 className="font-display text-xl text-white uppercase tracking-wider">Live Event Matcher</h3>
              </div>
           </div>

           <div className="space-y-4">
              <label className="admin-label">Select Open Event</label>
              <div className="flex gap-4">
                 <select 
                   className="admin-input h-12 flex-1" 
                   value={selectedEventId} 
                   onChange={e => setSelectedEventId(e.target.value)}
                 >
                   <option value="">Choose an event brief...</option>
                   {openEvents?.map(e => <option key={e.id} value={e.id}>{e.title.toUpperCase()} ({e.city})</option>)}
                 </select>
                 <Button disabled={!selectedEventId || running} onClick={handleRunLiveMatch} className="h-12 px-8">
                   {running ? <Loader2 className="animate-spin" /> : 'RUN ENGINE'}
                 </Button>
              </div>
           </div>

           <div className="flex-1 overflow-auto max-h-[400px] border border-white/5 rounded-md scrollbar-hide">
              <table className="admin-table">
                 <thead>
                    <tr>
                       <th>Rank</th>
                       <th>Talent</th>
                       <th>Match %</th>
                       <th>Loc</th>
                       <th>Cat</th>
                       <th>Wave</th>
                    </tr>
                 </thead>
                 <tbody>
                    {liveResults.length > 0 ? liveResults.map((r, i) => (
                      <tr key={r.talentId} className="group hover:bg-white/[0.02]">
                         <td className="font-display text-lg text-white/20">#{i + 1}</td>
                         <td className="font-bold text-white text-xs">{r.stageName}</td>
                         <td><Badge variant="active" className="text-gold border-gold">{r.matchPercentage}%</Badge></td>
                         <td className="text-muted text-[0.6rem]">{r.locationScore}</td>
                         <td className="text-muted text-[0.6rem]">{r.categoryScore}</td>
                         <td className="text-muted text-[0.6rem]">{r.waveScoreContribution.toFixed(1)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="py-20 text-center opacity-10"><Terminal size={48} className="mx-auto" /></td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>
    </div>
  );
}
