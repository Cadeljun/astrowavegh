
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Zap, Users, ShieldCheck, Star, Music, Award, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { calculateTalentMatch, type TalentMatchOutput } from '@/ai/flows/talent-match-flow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';

export default function MatchingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [results, setResults] = useState<TalentMatchOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [existingBookings, setExistingBookings] = useState<string[]>([]);
  const [talentMap, setTalentMap] = useState<Record<string, any>>({});

  useEffect(() => {
    async function initMatching() {
      try {
        // 1. Fetch Event
        const eventSnap = await getDoc(doc(db, 'events', eventId));
        if (!eventSnap.exists()) {
          toast({ variant: 'destructive', title: "Event not found" });
          router.push('/organizer/dashboard');
          return;
        }
        const eventData = eventSnap.data();
        setEvent(eventData);

        // 2. Fetch all Talent
        const talentSnap = await getDocs(collection(db, 'talent_profiles'));
        const roster = talentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const tMap: Record<string, any> = {};
        roster.forEach(t => tMap[t.id] = t);
        setTalentMap(tMap);

        // 3. Fetch existing bookings for this event
        const bookingsSnap = await getDocs(query(collection(db, 'bookings'), where('eventId', '==', eventId)));
        const bookingTalentIds = bookingsSnap.docs.map(d => d.data().talentId);
        setExistingBookings(bookingTalentIds);

        // 4. Run Matching
        const matchResults = await calculateTalentMatch({
          event: {
            name: eventData.name,
            description: eventData.description,
            category: eventData.category,
            venue: eventData.venue,
          },
          roster: roster.map(t => ({
            id: t.id,
            name: t.name,
            stageName: t.stageName,
            role: t.role,
            bio: t.bio,
          }))
        });

        setResults(matchResults);
      } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: "Matching Error", description: error.message });
      } finally {
        setLoading(false);
      }
    }

    if (eventId) initMatching();
  }, [eventId, router, toast]);

  const handleBookTalent = async (match: any) => {
    if (!user || !event) return;
    setBookingLoading(match.talentId);

    const talent = talentMap[match.talentId];
    
    try {
      await addDoc(collection(db, 'bookings'), {
        eventId,
        eventName: event.name,
        eventDate: event.date,
        talentId: match.talentId,
        talentName: talent.stageName || talent.name,
        organizerId: user.uid,
        organizerName: user.displayName || 'Organizer',
        status: 'PENDING',
        timestamp: serverTimestamp()
      });

      setExistingBookings(prev => [...prev, match.talentId]);
      toast({ title: "Request Sent!", description: `Inquiry sent to ${talent.stageName}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking Failed", description: err.message });
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="text-gold" size={64} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="display-md text-white">WAVE SCAN IN PROGRESS</h1>
          <p className="body-md text-muted">Analyzing artist DNA against your event requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 lg:p-12">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <Link href="/organizer/dashboard" className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
            <ArrowLeft size={16} /> BACK TO DASHBOARD
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
             <span className="label text-[0.6rem] text-cyan-500">AI ENGINE ACTIVE</span>
          </div>
        </header>

        <div className="text-center space-y-4">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <SectionLabel className="justify-center">MATCH RESULTS</SectionLabel>
            <h1 className="display-xl text-white">{event?.name.toUpperCase()}</h1>
            <div className="flex items-center justify-center gap-6 text-muted text-sm uppercase tracking-widest font-bold">
               <span className="flex items-center gap-2"><Music size={14} className="text-gold" /> {event?.category}</span>
               <span className="opacity-20">•</span>
               <span className="flex items-center gap-2"><Award size={14} className="text-gold" /> {results?.matches.length} POTENTIAL MATCHES</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {results?.matches.map((match, i) => {
            const talent = talentMap[match.talentId];
            if (!talent) return null;
            const isBooked = existingBookings.includes(match.talentId);

            return (
              <motion.div key={match.talentId} variants={scaleIn}>
                <Card className="p-8 h-full flex flex-col justify-between relative group" glowColor={i === 0 ? 'gold' : 'muted'}>
                  {i === 0 && (
                    <div className="absolute -top-3 -right-3 bg-gold text-black px-4 py-1.5 rounded-full font-bold text-[0.65rem] tracking-[0.2em] shadow-xl z-20">
                      TOP MATCH
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                         <img src={talent.imageUrl || `https://picsum.photos/seed/${match.talentId}/100/100`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="text-right">
                         <p className="text-4xl font-display text-white leading-none">{match.matchPercentage}%</p>
                         <p className="text-[0.6rem] label m-0">MATCH</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-2xl text-white tracking-widest uppercase">{talent.stageName}</h3>
                      <Badge variant="active" className="bg-purple-dim text-purple border-purple">{talent.role}</Badge>
                    </div>

                    <div className="space-y-3 p-4 rounded-sm bg-black/40 border border-white/5">
                       <div className="flex items-center gap-2 mb-2">
                          <Zap size={14} className="text-gold" />
                          <span className="text-[0.65rem] font-bold text-white uppercase tracking-widest">Vibe Score: {match.waveScore}/10</span>
                       </div>
                       <p className="text-xs text-muted leading-relaxed italic">
                         "{match.reasoning}"
                       </p>
                    </div>
                  </div>

                  <div className="pt-8 grid grid-cols-2 gap-4">
                    <Button variant="ghost" className="text-[0.65rem] border-white/10" onClick={() => router.push(`/talent/${match.talentId}`)}>
                       VIEW PROFILE
                    </Button>
                    <Button 
                      disabled={isBooked || bookingLoading === match.talentId}
                      onClick={() => handleBookTalent(match)}
                      className={`text-[0.65rem] h-11 ${isBooked ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
                    >
                       {bookingLoading === match.talentId ? <Loader2 className="animate-spin" size={14} /> : isBooked ? <><Check size={14} className="mr-2" /> REQUESTED</> : 'BOOK NOW'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {results?.matches.length === 0 && (
          <div className="py-32 text-center space-y-6">
            <Users size={64} className="mx-auto text-muted opacity-20" />
            <div className="space-y-2">
              <h2 className="display-md text-muted">NO DIRECT MATCHES</h2>
              <p className="body-md text-muted max-w-lg mx-auto">Our current roster doesn't quite hit this specific wave yet. Try refining your event description or invite more talent to join the platform.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
