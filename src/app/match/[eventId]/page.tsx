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
import { fadeUp, staggerContainer, scaleIn, fadeIn } from '@/lib/animations';
import BookingRequestModal from '@/components/platform/BookingRequestModal';
import { cn } from '@/lib/utils';

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
        setProgressMsg('Running matching algorithm...');
        const res = await fetch('/api/match/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
        if (!res.ok) throw new Error('Engine failed');
      }

      const matchSnap = await getDoc(doc(db, 'matches', eventId));
      if (matchSnap.exists()) {
        const data = matchSnap.data();
        // Check expiry
        if (data.expiresAt?.toDate() < new Date()) {
          return fetchMatches(true);
        }
        setMatches(data);
      } else {
        return fetchMatches(true);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Match Error", description: "The engine encountered an issue." });
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    // Load Event
    const unsubEvent = onSnapshot(doc(db, 'platform_events', eventId), (snap) => {
      if (snap.exists()) {
        setEvent(snap.data());
      } else {
        router.push('/organizer/dashboard');
      }
    });

    fetchMatches();

    return () => unsubEvent();
  }, [eventId, router]);

  // Loading sequence messages
  useEffect(() => {
    if (!loading && !running) return;
    const messages = [
      'Scanning local roster...',
      'Evaluating city proximity...',
      'Checking talent Wave Scores...',
      'Optimizing for best vibe match...',
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
            className="w-32 h-32 rounded-full border-2 border-white/5 border-t-gold border-b-purple opacity-20" 
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-gold animate-pulse" size={40} />
           </div>
        </div>
        <div className="space-y-4">
          <h1 className="display-md text-white tracking-[0.2em]">ENGINE ACTIVE</h1>
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
    <div className="min-h-screen bg-black pb-24 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto space-y-10 pt-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <button onClick={() => router.back()} className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
              <ArrowLeft size={16} /> BACK TO EVENTS
           </button>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[0.6rem] font-bold text-cyan-400 uppercase tracking-widest">
                 <ShieldCheck size={12} /> AI Engine Verified
              </div>
              <Button variant="ghost" size="sm" className="h-9 border-white/5 text-muted hover:text-white" onClick={() => fetchMatches(true)}>
                 <RefreshCw size={14} className="mr-2" /> REFRESH
              </Button>
           </div>
        </header>

        {/* Event Context */}
        <Card className="p-8 md:p-12 border-t-2 border-gold bg-[#111118]/80 backdrop-blur-3xl" glowColor="gold">
           <div className="flex flex-col md:flex-row gap-10 md:items-center">
              <div className="space-y-2 flex-1">
                 <SectionLabel className="mb-0">MATCHING PROTOCOL FOR</SectionLabel>
                 <h1 className="display-md text-white text-glow-gold uppercase leading-tight">{event?.title}</h1>
                 <div className="flex flex-wrap gap-6 text-[0.7rem] font-bold text-muted uppercase tracking-widest pt-2">
                    <span className="flex items-center gap-2"><Award size={14} className="text-gold" /> {event?.talentCategory}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> {event?.city}, GHANA</span>
                    <span className="flex items-center gap-2 text-white"><Star size={14} className="text-gold fill-current" /> BUDGET: {event?.currency} {event?.talentBudget?.toLocaleString()}</span>
                 </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                 <p className="text-4xl font-display text-white">{results.length}</p>
                 <p className="text-[0.6rem] label m-0">MATCHES FOUND</p>
                 <p className="text-[0.55rem] text-muted font-mono uppercase mt-2">Ranked by AstroWave Vibe Sync</p>
              </div>
           </div>
        </Card>

        {/* Results Grid */}
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
                  expandedMatch === match.talentId ? "border-gold/50 shadow-2xl" : "border-white/5"
                )} glowColor={i < 3 ? 'gold' : 'muted'}>
                  {/* Rank Indicator */}
                  <div className={cn(
                    "absolute top-0 left-0 w-12 h-12 flex items-center justify-center font-display text-xl z-20",
                    i === 0 ? "bg-gold text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-amber-600 text-white" : "bg-white/5 text-muted"
                  )}>
                    {i === 0 ? <Crown size={16} /> : `#${i + 1}`}
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="flex gap-6 items-start">
                       <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                          <img src={match.photoURL || `https://picsum.photos/seed/${match.talentId}/100/100`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                             <h3 className="text-2xl font-display text-white tracking-widest uppercase">{match.stageName}</h3>
                             <div className={cn(
                               "px-4 py-1.5 rounded-full font-display text-xl leading-none",
                               match.matchPercentage >= 90 ? "bg-green-500 text-black" : 
                               match.matchPercentage >= 70 ? "bg-gold text-black" : "bg-white/5 text-white/40"
                             )}>
                               {match.matchPercentage}%
                             </div>
                          </div>
                          <Badge variant="active" className="bg-purple-dim text-purple border-purple text-[0.6rem]">{match.category}</Badge>
                          <div className="flex items-center gap-4 text-[0.65rem] text-muted font-bold uppercase pt-2">
                             <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> {match.city}</span>
                             <span className="flex items-center gap-1.5"><Star size={12} className="text-gold fill-current" /> {(match.waveScore || 0).toFixed(1)}</span>
                             <span>{match.currency} {match.basePrice?.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    {/* Breakdown Toggle */}
                    <button 
                      onClick={() => setExpandedMatch(expandedMatch === match.talentId ? null : match.talentId)}
                      className="w-full py-2 border-y border-white/5 flex items-center justify-between group-hover:bg-white/[0.02] transition-colors"
                    >
                       <span className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">Vibe Sync Breakdown</span>
                       <ChevronDown size={14} className={cn("text-muted transition-transform", expandedMatch === match.talentId && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                       {expandedMatch === match.talentId && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden space-y-6"
                         >
                            <div className="grid grid-cols-1 gap-4 pt-4">
                               {/* Location */}
                               <div className="space-y-1.5">
                                  <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                     <span>Location Proximity</span>
                                     <span className="text-white">{match.locationScore}/30</span>
                                  </div>
                                  <Progress value={(match.locationScore / 30) * 100} className="h-1 bg-white/5" />
                               </div>
                               {/* Category */}
                               <div className="space-y-1.5">
                                  <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                     <span>Role Relevance</span>
                                     <span className="text-white">{match.categoryScore}/40</span>
                                  </div>
                                  <Progress value={(match.categoryScore / 40) * 100} className="h-1 bg-white/5" />
                               </div>
                               {/* Wave */}
                               <div className="space-y-1.5">
                                  <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                     <span>Wave Score Rank</span>
                                     <span className="text-white">{match.waveScoreContribution?.toFixed(1)}/30</span>
                                  </div>
                                  <Progress value={(match.waveScoreContribution / 30) * 100} className="h-1 bg-white/5" />
                               </div>
                            </div>
                            <div className="p-4 rounded bg-black/40 border border-white/5 text-[0.65rem] text-muted italic leading-relaxed">
                               {match.explanation || "Algorithm analysis pending..."}
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>

                    <div className="flex gap-4">
                       <Button 
                         variant="ghost" className="flex-1 h-12 border-white/5 text-[0.65rem] font-bold"
                         onClick={() => router.push(`/organizer/talent/${match.talentId}`)}
                       >
                         VIEW PROFILE
                       </Button>
                       <Button 
                        className="flex-1 h-12 text-[0.65rem] font-bold tracking-widest shadow-xl"
                        onClick={() => setBookingMatch(match)}
                       >
                         BOOK NOW <Zap size={14} className="ml-2" />
                       </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
               <div className="p-8 rounded-full bg-white/5 border border-dashed border-white/10 text-muted opacity-20">
                  <AlertCircle size={64} />
               </div>
               <div className="space-y-2">
                  <h2 className="display-md text-muted">NO MATCHES YET</h2>
                  <p className="body-md text-muted max-w-lg mx-auto">The engine didn't find high-probability matches in this area. Try refining your category or location.</p>
               </div>
               <Link href="/organizer/search">
                  <Button variant="ghost" className="mt-4 border-white/5">BROWSE ALL ROSTER</Button>
               </Link>
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
  );
}

function Link({ href, children, ...props }: any) {
  return <a href={href} {...props}>{children}</a>;
}
