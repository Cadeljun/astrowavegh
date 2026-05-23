'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Zap, 
  Users, 
  Award, 
  Star, 
  Loader2, 
  ArrowLeft, 
  Trash2, 
  CheckCircle, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn } from '@/lib/animations';
import PlatformGuard from '@/components/platform/PlatformGuard';
import { completeEvent, cancelEvent } from '@/lib/platform/eventService';

export default function OrganizerEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'platform_events', id), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, ...snap.data() });
      } else {
        toast({ variant: 'destructive', title: "Event not found" });
        router.push('/organizer/dashboard');
      }
      setLoading(false);
    });
    return unsub;
  }, [id, router, toast]);

  const handleComplete = async () => {
    if (!event.bookedTalentId) return;
    setActionLoading(true);
    try {
      await completeEvent(event.id, event.bookedTalentId);
      toast({ title: "Event Completed!", description: "Wave Scores have been synchronized." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    setActionLoading(true);
    try {
      await cancelEvent(event.id, user!.uid);
      toast({ title: "Event Cancelled" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Cancellation Failed", description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-gold" size={40} /></div>;

  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        <header className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
            <ArrowLeft size={16} /> BACK
          </button>
          <div className="flex items-center gap-4">
             <Badge variant={
               event.status === 'open' ? 'live' : 
               event.status === 'booked' ? 'active' : 
               event.status === 'completed' ? 'free' : 'coming-soon'
             }>
               {event.status.toUpperCase()}
             </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
             <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
                <div className="space-y-2">
                   <SectionLabel className="mb-0">{event.category.toUpperCase()}</SectionLabel>
                   <h1 className="display-lg text-white text-glow-gold leading-tight">{event.title.toUpperCase()}</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                   <div className="space-y-4">
                      <p className="text-[0.6rem] label m-0">WHEN & WHERE</p>
                      <div className="space-y-2 text-white font-bold text-sm uppercase tracking-widest">
                         <p className="flex items-center gap-2.5"><Calendar size={16} className="text-gold" /> {eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                         <p className="flex items-center gap-2.5"><Clock size={16} className="text-gold" /> {event.startTime} - {event.endTime || 'Late'}</p>
                         <p className="flex items-center gap-2.5"><MapPin size={16} className="text-gold" /> {event.venue}, {event.city}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[0.6rem] label m-0">TALENT BRIEF</p>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <Badge variant="active" className="bg-purple-dim text-purple border-purple">{event.talentCategory}</Badge>
                            <span className="text-xs font-bold text-gold">{event.currency} {event.talentBudget.toLocaleString()}</span>
                         </div>
                         <p className="text-xs text-muted font-bold uppercase tracking-widest">{event.guestCount} Expected Guests</p>
                      </div>
                   </div>
                </div>
             </motion.div>

             <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="space-y-6">
                <SectionLabel>DESCRIPTION</SectionLabel>
                <p className="body-md text-white/80 leading-relaxed whitespace-pre-wrap">{event.description || "No description provided."}</p>
                
                {event.requirements && (
                  <div className="space-y-4 pt-6">
                    <p className="text-[0.6rem] label m-0">SPECIFIC REQUIREMENTS</p>
                    <div className="p-6 rounded-xl bg-black/40 border border-white/5 italic text-sm text-muted leading-relaxed">
                      "{event.requirements}"
                    </div>
                  </div>
                )}
             </motion.div>
          </div>

          {/* Sidebar Actions */}
          <aside className="lg:col-span-4 space-y-8">
             {event.status === 'open' && (
               <Card className="p-8 space-y-8 border-t-2 border-gold" glowColor="gold">
                  <div className="text-center space-y-2">
                     <Zap size={32} className="text-gold mx-auto animate-pulse" />
                     <h3 className="font-display text-2xl text-white tracking-widest uppercase">Matching Engine</h3>
                     <p className="text-xs text-muted">AstroWave is scanning the roster for your perfect vibe.</p>
                  </div>
                  <Button className="w-full h-14 text-[0.7rem] font-bold" onClick={() => router.push(`/match/${event.id}`)}>
                     VIEW TALENT MATCHES <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 border border-white/5" onClick={handleCancel} disabled={actionLoading}>
                     CANCEL EVENT
                  </Button>
               </Card>
             )}

             {event.status === 'booked' && (
               <Card className="p-8 space-y-8 border-t-2 border-purple" glowColor="purple">
                  <div className="text-center space-y-4">
                     <SectionLabel className="justify-center">TALENT SECURED</SectionLabel>
                     <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-purple/30 bg-surface">
                        <img src={event.bookedTalentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                     </div>
                     <p className="text-xl font-display text-white tracking-widest uppercase">{event.bookedTalentName}</p>
                  </div>
                  <div className="space-y-3">
                     <Button className="w-full h-14 bg-purple hover:bg-purple/80 text-white border-none" onClick={handleComplete} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} className="mr-2" /> MARK COMPLETED</>}
                     </Button>
                     <p className="text-[0.55rem] text-center text-muted font-bold uppercase tracking-widest">
                       MARKING COMPLETE RECALCULATES WAVE SCORES
                     </p>
                  </div>
               </Card>
             )}

             {event.status === 'completed' && (
               <Card className="p-8 text-center space-y-6 bg-green-500/5 border-green-500/20" glowColor="muted">
                  <div className="p-3 rounded-full bg-green-500/10 text-green-500 w-fit mx-auto"><CheckCircle size={32} /></div>
                  <div className="space-y-1">
                     <h3 className="font-display text-2xl text-white uppercase tracking-widest">Experience Archived</h3>
                     <p className="text-xs text-muted">This event was successfully completed.</p>
                  </div>
                  {event.rated ? (
                    <div className="p-4 rounded bg-white/5 border border-white/5 text-[0.6rem] font-bold text-gold uppercase tracking-widest">
                       ★ RATING SUBMITTED
                    </div>
                  ) : (
                    <Button variant="primary" className="w-full h-12 text-[0.65rem] border-gold" onClick={() => router.push('/organizer/bookings')}>
                       RATE PERFORMANCE
                    </Button>
                  )}
               </Card>
             )}
          </aside>
        </div>
      </div>
    </PlatformGuard>
  );
}
