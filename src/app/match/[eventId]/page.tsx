'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Zap, 
  Award, 
  MapPin, 
  Star, 
  ChevronDown, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Crown
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import BookingRequestModal from '@/components/platform/BookingRequestModal';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function MatchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [matches, setMatches] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Analyzing event requirements...');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [bookingMatch, setBookingMatch] = useState<any>(null);

  const fetchMatches = async (force = false) => {
    if (force) setRunning(true);
    try {
      if (force) {
        setProgressMsg('Running matching engine...');
        const res = await fetch('/api/match/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
        if (!res.ok) throw new Error('Matching engine failed');
      }

      const matchSnap = await getDoc(doc(db, 'matches', eventId));
      if (matchSnap.exists()) {
        const data = matchSnap.data();
        // Check for expiry (24h)
        const now = new Date().getTime();
        const expiresAt = data.expiresAt?.toDate().getTime();
        
        if (expiresAt < now) {
          return fetchMatches(true);
        }
        setMatches(data);
      } else {
        return fetchMatches(true);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Match Error", description: "The engine encountered an issue while pairing talent." });
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    // Real-time listener for the event brief
    const unsubEvent = onSnapshot(doc(db, 'platform_events', eventId), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, ...snap.data() });
      } else {
        router.push('/organizer/dashboard');
      }
    });

    fetchMatches();

    return () => unsubEvent();
  }, [eventId, router]);

  // Cinematic loading sequence
  useEffect(() => {
    if (!loading && !running) return;
    const messages = [
      'Analyzing event requirements...',
      'Scanning local talent roster...',
      'Calculating match scores...',
      'Ranking by Wave Score...',
      'Finalizing ranked suggestions...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setProgressMsg(messages[i % messages.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, [loading, running]);

  if (loading || running) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="relative">
           <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border-2 border-white/5 border-t-cyan-500 border-b-purple-500 opacity-20" 
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl text-white tracking-[0.4em] animate-pulse uppercase">ASTROWAVE</span>
           </div>
        </div>
        <div className="space-y-4">
          <h1 className="display-sm text-white tracking-[0.2em] uppercase">Vibe Sync Active</h1>
          <p className="font-mono text-cyan-400 text-xs uppercase tracking-widest animate-pulse">{progressMsg}</p>
        </div>
        <div className="w-64">
           <Progress value={undefined} className="h-1 bg-white/5" />
        </div>
      </div>
    );
  }

  const results = matches?.results || [];

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="min-h-screen bg-black pb-24 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto space-y-10 pt-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <button onClick={() => router.back()} className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
                <ArrowLeft size={16} /> BACK
             </button>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[0.6rem] font-bold text-cyan-400 uppercase tracking-widest">
                   <ShieldCheck size={12} /> AI Verified Matches
                </div>
                <Button variant="ghost" size="sm" className="h-9 border-white/5 text-muted hover:text-white" onClick={() => fetchMatches(true)}>
                   <RefreshCw size={14} className="mr-2" /> REFRESH
                </Button>
             </div>
          </header>

          {/* Event Context Card */}
          <Card className="p-8 md:p-12 border-t-2 border-gold bg-[#111118]/80 backdrop-blur-3xl" glowColor="gold">
             <div className="flex flex-col md:flex-row gap-10 md:items-center">
                <div className="space-y-2 flex-1">
                   <SectionLabel className="mb-0">MATCHING FOR EVENT</SectionLabel>
                   <h1 className="display-md text-white text-glow-gold uppercase leading-tight">{event?.title}</h1>
                   <div className="flex flex-wrap gap-6 text-[0.7rem] font-bold text-muted uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-2"><Award size={14} className="text-gold" /> {event?.talentCategory}</span>
                      <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> {event?.city}, GHANA</span>
                      <span className="flex items-center gap-2 text-white"><Star size={14} className="text-gold fill-current" /> BUDGET: {event?.currency} {event?.talentBudget?.toLocaleString()}</span>
                   </div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right border-l border-white/5 pl-10">
                   <p className="text-5xl font-display text-white">{results.length}</p>
                   <p className="text-[0.6rem] label m-0">MATCHES FOUND</p>
                   <p className="text-[0.55rem] text-muted font-mono uppercase mt-2">Evaluated {matches?.totalTalentsEvaluated || 0} Talents</p>
                </div>
             </div>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
             <div className="space-y-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Ranked Suggestions</h2>
                <p className="text-[0.6rem] text-muted uppercase">Generated based on vibe sync algorithm</p>
             </div>
             <div className="flex gap-4">
                <select className="admin-input h-10 w-48 text-[0.65rem] font-bold uppercase tracking-widest">
                   <option>Best Match</option>
                   <option>Wave Score</option>
                   <option>Price: Low to High</option>
                </select>
             </div>
          </div>

          {/* Match Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {results.length > 0 ? (
              results.map((match: any, i: number) => (
                <motion.div key={match.talentId} variants={fadeUp}>
                  <Card className={cn(
                    "group relative overflow-hidden transition-all duration-500",
                    expandedMatch === match.talentId ? "border-gold shadow-2xl" : "border-white/5 hover:border-white/20"
                  )} glowColor={i < 3 ? 'gold' : 'muted'}>
                    
                    {/* Rank Badge */}
                    <div className={cn(
                      "absolute top-0 left-0 w-12 h-12 flex items-center justify-center font-display text-xl z-20",
                      i === 0 ? "bg-gold text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-amber-600 text-white" : "bg-white/5 text-muted"
                    )}>
                      {i === 0 ? <Crown size={16} /> : `#${i + 1}`}
                    </div>

                    <div className="p-8 space-y-8">
                      <div className="flex gap-6 items-start">
                         <div className="w-28 h-28 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                            <img src={match.photoURL || `https://picsum.photos/seed/${match.talentId}/100/100`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         </div>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <h3 className="text-3xl font-display text-white tracking-widest uppercase text-glow-gold">{match.stageName}</h3>
                               <div className={cn(
                                 "px-4 py-1.5 rounded-full font-display text-2xl leading-none shadow-lg border border-black/20",
                                 match.matchPercentage >= 90 ? "bg-green-500 text-black" : 
                                 match.matchPercentage >= 70 ? "bg-gold text-black" : "bg-white/10 text-white/60"
                               )}>
                                 {match.matchPercentage}%
                               </div>
                            </div>
                            <Badge variant="active" className="bg-purple-dim text-purple border-purple text-[0.6rem]">{match.category}</Badge>
                            <div className="flex items-center gap-4 text-[0.65rem] text-muted font-bold uppercase pt-2">
                               <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> {match.city}</span>
                               <span className="flex items-center gap-1.5"><Star size={12} className="text-gold fill-current" /> {(match.waveScore || 0).toFixed(1)}</span>
                               <span className="text-white">GHS {match.basePrice?.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>

                      {/* Breakdown Toggle */}
                      <button 
                        onClick={() => setExpandedMatch(expandedMatch === match.talentId ? null : match.talentId)}
                        className="w-full py-2 border-y border-white/5 flex items-center justify-between group-hover:bg-white/[0.02] transition-colors"
                      >
                         <span className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">View Match Breakdown</span>
                         <ChevronDown size={14} className={cn("text-muted transition-transform duration-300", expandedMatch === match.talentId && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                         {expandedMatch === match.talentId && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }} 
                             animate={{ height: 'auto', opacity: 1 }} 
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden space-y-6 pt-4"
                           >
                              <div className="grid grid-cols-1 gap-6">
                                 {/* Location Component */}
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                       <span className="flex items-center gap-2"><MapPin size={10} /> Location Score</span>
                                       <span className="text-white">{match.locationScore}/30</span>
                                    </div>
                                    <Progress value={(match.locationScore / 30) * 100} className="h-1.5 bg-white/5" />
                                    <p className="text-[0.55rem] text-muted italic">{match.breakdown?.locationReason}</p>
                                 </div>
                                 {/* Category Component */}
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                       <span className="flex items-center gap-2"><Award size={10} /> Category Fit</span>
                                       <span className="text-white">{match.categoryScore}/40</span>
                                    </div>
                                    <Progress value={(match.categoryScore / 40) * 100} className="h-1.5 bg-white/5" />
                                    <p className="text-[0.55rem] text-muted italic">{match.breakdown?.categoryReason}</p>
                                 </div>
                                 {/* Wave Component */}
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                       <span className="flex items-center gap-2"><Zap size={10} /> Wave Score Rank</span>
                                       <span className="text-white">{match.waveScoreContribution?.toFixed(1)}/30</span>
                                    </div>
                                    <Progress value={(match.waveScoreContribution / 30) * 100} className="h-1.5 bg-white/5" />
                                    <p className="text-[0.55rem] text-muted italic">Wave Score: {match.waveScore}/5</p>
                                 </div>
                              </div>
                              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[0.65rem] text-cyan-400 font-mono leading-relaxed">
                                 {match.breakdown?.explanation || "Vibe analysis complete."}
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>

                      <div className="flex gap-4">
                         <Button 
                           variant="ghost" className="flex-1 h-14 border-white/5 text-[0.65rem] font-bold"
                           onClick={() => router.push(`/organizer/talent/${match.talentId}`)}
                         >
                           VIEW PROFILE
                         </Button>
                         <Button 
                          className="flex-1 h-14 text-[0.65rem] font-bold tracking-widest shadow-[0_0_30px_rgba(255,209,102,0.1)]"
                          onClick={() => setBookingMatch(match)}
                         >
                           BOOK TALENT <ArrowLeft size={14} className="ml-2 rotate-180" />
                         </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
                 <div className="p-10 rounded-full bg-white/5 border border-dashed border-white/10 text-muted opacity-20">
                    <AlertCircle size={80} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="display-sm text-white uppercase tracking-widest">No Matches Found</h2>
                    <p className="body-md text-muted max-w-lg mx-auto">The algorithm couldn't find available talent for this category in your area. Try widening your location or check back later.</p>
                 </div>
                 <Button variant="ghost" className="mt-4 border-white/5" onClick={() => router.push('/organizer/search')}>BROWSE ALL TALENT</Button>
              </div>
            )}
          </motion.div>
        </div>

        <BookingRequestModal 
          isOpen={!!bookingMatch} 
          onClose={() => setBookingMatch(null)} 
          talent={bookingMatch}
          event={event}
        />
      </div>
    </PlatformGuard>
  );
}
