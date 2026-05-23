'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, MapPin, Award, Star, Globe, Instagram, Music, Twitter, Youtube, 
  ArrowLeft, Loader2, CheckCircle, ShieldCheck, Send, X, Calendar, 
  DollarSign, MessageSquare, Quote 
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';
import ReviewCard from '@/components/platform/ReviewCard';
import Link from 'next/link';

export default function PublicTalentProfile() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  const [talent, setTalent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(searchParams.get('action') === 'book');
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'talent_profiles', id));
        if (snap.exists()) {
          setTalent(snap.data());
        } else {
          toast({ variant: 'destructive', title: "Artist not found" });
          router.push('/organizer/search');
          return;
        }

        // Fetch Reviews
        const rQuery = query(
          collection(db, 'ratings'),
          where('talentId', '==', id),
          orderBy('submittedAt', 'desc'),
          limit(5)
        );
        const rSnap = await getDocs(rQuery);
        setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

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
  }, [id, user, router, toast]);

  const ratingDistribution = useMemo(() => {
    if (!talent) return [];
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.overall >= 1 && r.overall <= 5) dist[r.overall - 1]++;
    });
    return dist.reverse().map((count, i) => ({
      stars: 5 - i,
      count,
      percent: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    }));
  }, [reviews, talent]);

  const handleBookingRequest = async () => {
    if (!user || !selectedEvent || !talent) return;
    setSending(true);
    try {
      const bookingData = {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        eventVenue: selectedEvent.venue,
        eventCity: selectedEvent.city || 'Accra',
        organizerId: user.uid,
        organizerName: user.displayName || 'Organizer',
        talentId: id,
        talentName: talent.displayName || talent.stageName,
        talentStageName: talent.stageName,
        talentPhoto: talent.photoURL || '',
        talentCategory: talent.category,
        agreedPrice: talent.basePrice,
        currency: talent.currency,
        message,
        status: 'pending',
        matchPercentage: 92,
        waveScore: talent.waveScore || 0,
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      await addDoc(collection(db, 'notifications'), {
        userId: id,
        type: 'booking_request',
        title: 'New Booking Request! 🌊',
        message: `${user.displayName || 'An organizer'} wants to book you for ${selectedEvent.title}.`,
        read: false,
        actionUrl: '/talent/bookings',
        relatedId: selectedEvent.id,
        createdAt: serverTimestamp()
      });

      toast({ title: "Booking Request Sent!", description: `${talent.stageName} will be notified immediately.` });
      setBookingModal(false);
      router.push('/organizer/bookings');
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Request Failed", description: error.message });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-gold" size={40} /></div>;

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="min-h-screen bg-black -m-8">
        {/* Banner Section */}
        <section className="relative h-[60vh] w-full overflow-hidden">
          <img 
            src={talent.photoURL || 'https://picsum.photos/seed/talent/1200/800'} 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 transition-transform duration-1000 hover:scale-105" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 lg:p-20">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                 <Badge variant="active" className="bg-gold text-black border-none px-6 py-2 text-[0.8rem] font-bold">{talent.category.toUpperCase()}</Badge>
                 <Badge variant={talent.available ? 'live' : 'coming-soon'}>{talent.available ? 'AVAILABLE' : 'BOOKED'}</Badge>
              </div>
              <h1 className="display-2xl text-white text-glow-gold leading-none">{talent.stageName.toUpperCase()}</h1>
              <div className="flex flex-wrap gap-10 text-muted font-bold text-xs uppercase tracking-[0.3em]">
                 <span className="flex items-center gap-2.5"><MapPin size={20} className="text-gold" /> {talent.city}, GHANA</span>
                 <span className="flex items-center gap-2.5 text-gold"><Zap size={20} className="fill-current" /> {talent.waveScore?.toFixed(1)} Wave Score</span>
                 <span className="flex items-center gap-2.5 text-white"><Star size={20} className="text-gold fill-current" /> {talent.averageRating?.toFixed(1)} Rating</span>
              </div>
            </motion.div>
          </div>
          <button 
            onClick={() => router.back()}
            className="absolute top-10 left-10 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-gold hover:text-black transition-all z-50 shadow-2xl"
          >
             <ArrowLeft size={24} />
          </button>
        </section>

        <section className="py-20 px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
          {/* Details Column */}
          <div className="lg:col-span-8 space-y-20">
             <div className="space-y-8">
                <SectionLabel>THE STORY</SectionLabel>
                <p className="body-lg text-white/90 leading-relaxed font-light whitespace-pre-wrap">{talent.bio}</p>
                {talent.skills && (
                  <div className="flex flex-wrap gap-3 pt-4">
                     {talent.skills.map((s: string) => <Badge key={s} variant="active" className="bg-white/5 border-white/10 text-white/60">{s}</Badge>)}
                  </div>
                )}
             </div>

             {/* Rating Summary */}
             <div className="space-y-10">
                <SectionLabel>REVIEWS & PERFORMANCE</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                   <div className="md:col-span-4 space-y-6 text-center md:text-left">
                      <div className="space-y-1">
                        <p className="text-6xl font-display text-white">{(talent.averageRating || 0).toFixed(1)}</p>
                        <div className="flex justify-center md:justify-start gap-1 text-gold">
                           {[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s <= Math.round(talent.averageRating || 0) ? 'currentColor' : 'none'} />)}
                        </div>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest pt-2">{talent.ratingCount || 0} Professional Reviews</p>
                      </div>
                      
                      <div className="pt-6 space-y-4 border-t border-white/5">
                         {[
                           { label: 'Performance', val: 4.8 },
                           { label: 'Professionalism', val: 4.9 },
                           { label: 'Communication', val: 4.7 }
                         ].map(stat => (
                           <div key={stat.label} className="space-y-1.5">
                              <div className="flex justify-between text-[0.6rem] font-bold uppercase text-white/40">
                                 <span>{stat.label}</span>
                                 <span>{stat.val} ★</span>
                              </div>
                              <Progress value={stat.val * 20} className="h-1 bg-white/5" />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="md:col-span-8 space-y-4">
                      {ratingDistribution.map((d) => (
                        <div key={d.stars} className="flex items-center gap-4">
                           <span className="text-[0.65rem] font-bold text-muted w-10">{d.stars} Stars</span>
                           <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${d.percent}%` }} transition={{ duration: 1 }} className="h-full bg-gold" />
                           </div>
                           <span className="text-[0.65rem] font-bold text-white w-10 text-right">{d.count}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-10">
                   {reviews.length > 0 ? (
                     reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                   ) : (
                     <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                        <MessageSquare size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No detailed reviews yet</p>
                     </div>
                   )}
                </div>
             </div>

             {talent.portfolio && talent.portfolio.length > 0 && (
               <div className="space-y-8">
                  <SectionLabel>PORTFOLIO REEL</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {talent.portfolio.map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-surface group relative shadow-2xl">
                           <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:col-span-4">
             <Card className="p-10 space-y-8 sticky top-32 bg-[#111118] border-t-2 border-t-gold shadow-2xl" glowColor="gold">
                <div className="text-center space-y-2">
                   <p className="text-[0.6rem] label m-0 opacity-40 uppercase tracking-[0.2em]">ENGAGEMENT RATE</p>
                   <h3 className="text-6xl font-display text-white tracking-widest">{talent.currency} {talent.basePrice?.toLocaleString()}</h3>
                   <p className="text-[0.6rem] text-gold font-bold uppercase tracking-widest">{talent.priceNegotiable ? 'Negotiable for big events' : 'Fixed Performance Fee'}</p>
                </div>
                
                <div className="space-y-4">
                   <Button 
                    size="lg" 
                    className="w-full h-20 text-lg font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(255,209,102,0.3)]" 
                    disabled={!talent.available} 
                    onClick={() => setBookingModal(true)}
                   >
                     {talent.available ? 'BOOK THIS ARTIST' : 'ARTIST UNAVAILABLE'}
                   </Button>
                   <p className="text-[0.55rem] text-center text-muted font-bold uppercase tracking-widest italic leading-relaxed">
                     SECURE PAYMENTS & DIRECT COMMUNICATION <br/> THROUGH THE ASTROWAVE NETWORK
                   </p>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col gap-6">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted font-bold uppercase">Wave Score Rank</span>
                      <span className="text-gold font-display text-xl uppercase tracking-widest">Master</span>
                   </div>
                   <div className="flex justify-center gap-6 text-muted">
                      {[Instagram, Music, Globe, Twitter].map((Icon, i) => <Icon key={i} size={22} className="hover:text-gold cursor-pointer transition-colors" />)}
                   </div>
                </div>
             </Card>
          </aside>
        </section>

        {/* Booking Modal (Omitted for brevity, logic exists in original file) */}
        <AnimatePresence>
           {bookingModal && (
              <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBookingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                 <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative z-10 w-full max-w-lg">
                    <Card className="p-10 border-t-2 border-gold shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                       <button onClick={() => setBookingModal(false)} className="absolute top-6 right-6 text-muted hover:text-white transition-colors z-20"><X size={28} /></button>
                       
                       <div className="space-y-10 relative z-10">
                          <div className="text-center space-y-3">
                             <SectionLabel className="justify-center">NEW ENGAGEMENT</SectionLabel>
                             <h2 className="display-sm text-3xl text-white tracking-widest">BOOK {talent.stageName.toUpperCase()}</h2>
                             <p className="text-xs text-muted font-bold uppercase tracking-widest italic opacity-60">Initializing match protocol...</p>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-3">
                                <label className="admin-label">SELECT YOUR EVENT</label>
                                {myEvents.length > 0 ? (
                                  <select 
                                    className="admin-input h-14 bg-white/5 border-white/10 text-white font-bold" 
                                    value={selectedEvent?.id || ''} 
                                    onChange={e => setSelectedEvent(myEvents.find(ev => ev.id === e.target.value))}
                                  >
                                    <option value="" className="bg-dark">Choose an open brief...</option>
                                    {myEvents.map(e => <option key={e.id} value={e.id} className="bg-dark">{e.title.toUpperCase()}</option>)}
                                  </select>
                                ) : (
                                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center space-y-2">
                                     <p className="text-xs text-red-400 font-bold uppercase">No Open Events Found</p>
                                     <Link href="/organizer/post-event" className="text-[0.6rem] text-gold underline block">Create a brief first</Link>
                                  </div>
                                )}
                             </div>

                             <div className="space-y-3">
                                <label className="admin-label">ADDITIONAL MESSAGE</label>
                                <textarea 
                                  rows={4} 
                                  className="admin-input py-4 resize-none bg-white/5 border-white/10" 
                                  placeholder="Describe the role or specify requirements..." 
                                  value={message} 
                                  onChange={e => setMessage(e.target.value)} 
                                />
                             </div>

                             <div className="pt-4">
                                <Button 
                                  className="w-full h-16 text-lg font-bold tracking-[0.2em] shadow-2xl" 
                                  onClick={handleBookingRequest} 
                                  disabled={!selectedEvent || sending || !talent.available}
                                >
                                  {sending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-3" /> INITIALIZE REQUEST</>}
                                </Button>
                             </div>
                          </div>
                       </div>
                    </Card>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </PlatformGuard>
  );
}
