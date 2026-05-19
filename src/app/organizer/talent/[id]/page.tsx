'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Award, 
  Star, 
  Globe, 
  Instagram, 
  Music, 
  Twitter, 
  Youtube, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Calendar,
  X,
  Send
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PublicTalentProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'talent_profiles', id));
        if (snap.exists()) setTalent(snap.data());
        
        if (user) {
          const q = query(collection(db, 'platform_events'), where('organizerId', '==', user.uid), where('status', '==', 'open'));
          const eSnap = await getDocs(q);
          setMyEvents(eSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, user]);

  const handleBookingRequest = async () => {
    if (!user || !selectedEvent) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        eventVenue: selectedEvent.venue,
        eventCity: selectedEvent.city,
        organizerId: user.uid,
        organizerName: user.displayName || 'Organizer',
        talentId: id,
        talentName: talent.displayName,
        talentStageName: talent.stageName,
        talentPhoto: talent.photoURL || '',
        talentCategory: talent.category,
        agreedPrice: talent.basePrice,
        currency: talent.currency,
        message,
        status: 'pending',
        matchPercentage: 0, // Manual booking
        waveScore: talent.waveScore || 0,
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Booking Request Sent!", description: `${talent.stageName} has been notified.` });
      setBookingModal(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Request Failed", description: error.message });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-gold" size={40} /></div>;

  if (!talent) return <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 text-center"><Zap size={64} className="text-muted opacity-20" /><h2 className="display-md text-white">Wave Lost</h2><Button onClick={() => router.back()}>GO BACK</Button></div>;

  return (
    <div className="min-h-screen bg-black">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <img src={talent.photoURL || 'https://picsum.photos/seed/talent/1200/800'} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 lg:p-20">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                 <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all mr-4">
                    <ArrowLeft size={20} />
                 </button>
                 <Badge variant="active" className="bg-gold text-black border-none px-4 py-1">{talent.category}</Badge>
                 {talent.verified && <div className="flex items-center gap-2 text-cyan-400 text-[0.65rem] font-bold uppercase tracking-[0.2em]"><ShieldCheck size={16} /> Verified Roster</div>}
              </div>
              <h1 className="display-2xl text-white text-glow-gold leading-none">{talent.stageName.toUpperCase()}</h1>
              <div className="flex flex-wrap items-center gap-10 text-muted font-bold text-xs uppercase tracking-[0.3em]">
                 <span className="flex items-center gap-2.5"><MapPin size={18} className="text-gold" /> {talent.city}, GHANA</span>
                 <span className="flex items-center gap-2.5 text-gold"><Zap size={18} className="text-gold" /> {talent.waveScore?.toFixed(1)} Wave Score</span>
                 <span className="flex items-center gap-2.5 text-white"><Star size={18} className="text-gold" fill="currentColor" /> {talent.averageRating?.toFixed(1)} Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Profile Details */}
      <section className="py-20 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
             {/* Bio */}
             <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
                <SectionLabel>THE STORY</SectionLabel>
                <p className="body-lg text-white/90 leading-relaxed font-light whitespace-pre-wrap">{talent.bio}</p>
                <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                   {talent.skills?.map((s: string) => <Badge key={s} variant="active" className="bg-white/5 border-white/10 text-muted">{s}</Badge>)}
                </div>
             </motion.div>

             {/* Portfolio */}
             <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
                <SectionLabel>PORTFOLIO REEL</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                   {(talent.portfolio || []).length > 0 ? (
                      talent.portfolio.map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all group relative bg-surface">
                           <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        </div>
                      ))
                   ) : (
                     <div className="col-span-full py-20 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 opacity-20">
                        <p className="text-xs uppercase font-bold tracking-widest">No gallery assets found</p>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
             {/* Booking Card */}
             <Card className="p-8 space-y-8 sticky top-32 bg-[#111118] border-t-2 border-t-gold shadow-2xl" glowColor="gold">
                <div className="space-y-6">
                   <div className="text-center space-y-1">
                      <p className="text-[0.6rem] label m-0 font-bold opacity-40">PERFORMANCE RATE</p>
                      <h3 className="text-5xl font-display text-white tracking-widest leading-none">
                         {talent.currency} {talent.basePrice?.toLocaleString()}
                      </h3>
                      <p className="text-[0.6rem] text-muted font-bold uppercase tracking-widest">{talent.priceNegotiable ? 'Negotiable' : 'Flat Fee'}</p>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-xs font-bold text-muted uppercase">Status</span>
                      <Badge variant="live" className={cn(talent.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                        {talent.available ? 'OPEN FOR GIGS' : 'UNAVAILABLE'}
                      </Badge>
                   </div>
                </div>

                <div className="space-y-3">
                   <Button size="lg" className="w-full h-16 text-sm font-bold tracking-[0.2em]" disabled={!talent.available} onClick={() => setBookingModal(true)}>
                      BOOK THIS TALENT
                   </Button>
                   <Button variant="ghost" className="w-full h-14 text-[0.6rem] font-bold border border-white/5 opacity-60">
                      SAVE TO WISHLIST
                   </Button>
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-5 gap-4">
                   {[
                     { icon: Instagram, url: talent.instagram },
                     { icon: Music, url: talent.soundcloud },
                     { icon: Globe, url: talent.spotify },
                     { icon: Youtube, url: talent.youtube },
                     { icon: Twitter, url: talent.twitter },
                   ].map((s, i) => s.url ? <a key={i} href={s.url} target="_blank" className="p-3 rounded-lg bg-white/5 text-muted hover:text-gold hover:bg-white/10 transition-all flex items-center justify-center"><s.icon size={16} /></a> : null)}
                </div>
             </Card>

             <Card className="p-8 space-y-6 bg-white/[0.02]" glowColor="muted">
                <SectionLabel>WAVE INSIGHTS</SectionLabel>
                <div className="space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-widest">
                         <span className="text-muted">Community Trust</span>
                         <span className="text-white">{(talent.averageRating || 0) * 20}%</span>
                      </div>
                      <Progress value={(talent.averageRating || 0) * 20} className="h-1 bg-white/5" />
                   </div>
                   <div className="flex items-center gap-4 text-xs text-muted leading-relaxed italic">
                      <Zap size={14} className="text-gold shrink-0" />
                      "Consistently top-rated for professionalism and high-energy crowd control."
                   </div>
                </div>
             </Card>
          </aside>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
         {bookingModal && (
            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBookingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-lg">
                  <Card className="p-10 border-t-2 border-gold shadow-2xl space-y-8">
                     <button onClick={() => setBookingModal(false)} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
                     
                     <div className="text-center space-y-2">
                        <SectionLabel className="justify-center">NEW REQUEST</SectionLabel>
                        <h2 className="display-sm text-white tracking-widest uppercase">BOOK {talent.stageName}</h2>
                        <p className="text-xs text-muted">Select an event to invite this artist to your wave.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="admin-label">WHICH EVENT?</label>
                           {myEvents.length > 0 ? (
                              <select className="admin-input h-14 uppercase font-bold text-[0.7rem]" value={selectedEvent?.id || ''} onChange={e => setSelectedEvent(myEvents.find(ev => ev.id === e.target.value))}>
                                 <option value="">Choose an open event brief...</option>
                                 {myEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                              </select>
                           ) : (
                              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
                                 You don't have any open event briefs.
                                 <Link href="/organizer/post-event" className="block mt-2 underline">Post an event first →</Link>
                              </div>
                           )}
                        </div>

                        <div className="space-y-3">
                           <label className="admin-label">OFFER MESSAGE</label>
                           <textarea rows={4} className="admin-input py-4 resize-none" placeholder="Details about the gig, specific expectations, and why you want them..." value={message} onChange={e => setMessage(e.target.value)} />
                        </div>

                        <Button className="w-full h-16 text-sm font-bold tracking-[0.2em]" onClick={handleBookingRequest} disabled={!selectedEvent || sending}>
                           {sending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> SEND BOOKING REQUEST</>}
                        </Button>
                     </div>
                  </Card>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
