'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Award, Star, Globe, Instagram, Music, Twitter, Youtube, ArrowLeft, Loader2, CheckCircle, ShieldCheck, Send, X } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

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
      } catch (e) { console.error(e); } finally { setLoading(false); }
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
        organizerId: user.uid,
        organizerName: user.displayName || 'Organizer',
        talentId: id,
        talentName: talent.displayName,
        talentStageName: talent.stageName,
        talentPhoto: talent.photoURL || '',
        agreedPrice: talent.basePrice,
        currency: talent.currency,
        message,
        status: 'pending',
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Booking Request Sent!" });
      setBookingModal(false);
    } catch (error: any) { toast({ variant: 'destructive', title: "Request Failed" }); } finally { setSending(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-gold" size={40} /></div>;

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="min-h-screen bg-black">
        <section className="relative h-[50vh] w-full overflow-hidden">
          <img src={talent.photoURL || 'https://picsum.photos/seed/talent/1200/800'} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 lg:p-20">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              <Badge variant="active" className="bg-gold text-black border-none">{talent.category}</Badge>
              <h1 className="display-2xl text-white text-glow-gold leading-none">{talent.stageName.toUpperCase()}</h1>
              <div className="flex gap-10 text-muted font-bold text-xs uppercase tracking-widest"><span className="flex items-center gap-2"><MapPin size={18} className="text-gold" /> {talent.city}, GHANA</span><span className="flex items-center gap-2 text-gold"><Zap size={18} /> {talent.waveScore?.toFixed(1)} Wave Score</span></div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
          <div className="lg:col-span-8 space-y-12">
             <SectionLabel>THE STORY</SectionLabel>
             <p className="body-lg text-white/90 leading-relaxed font-light">{talent.bio}</p>
          </div>
          <aside className="lg:col-span-4">
             <Card className="p-8 space-y-8 sticky top-32 bg-[#111118] border-t-2 border-t-gold" glowColor="gold">
                <div className="text-center space-y-1">
                   <p className="text-[0.6rem] label m-0 opacity-40">BASE RATE</p>
                   <h3 className="text-5xl font-display text-white">{talent.currency} {talent.basePrice?.toLocaleString()}</h3>
                </div>
                <Button size="lg" className="w-full h-16" disabled={!talent.available} onClick={() => setBookingModal(true)}>BOOK THIS TALENT</Button>
                <div className="pt-6 border-t border-white/5 flex justify-center gap-4 text-muted">
                   <Instagram size={20} /><Music size={20} /><Globe size={20} />
                </div>
             </Card>
          </aside>
        </section>

        <AnimatePresence>
           {bookingModal && (
              <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBookingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                 <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-lg">
                    <Card className="p-10 border-t-2 border-gold space-y-8">
                       <button onClick={() => setBookingModal(false)} className="absolute top-6 right-6 text-muted"><X size={24} /></button>
                       <div className="text-center space-y-2"><SectionLabel className="justify-center">NEW REQUEST</SectionLabel><h2 className="display-sm text-white">BOOK {talent.stageName}</h2></div>
                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="admin-label">SELECT EVENT</label>
                             <select className="admin-input h-14" value={selectedEvent?.id || ''} onChange={e => setSelectedEvent(myEvents.find(ev => ev.id === e.target.value))}>
                                <option value="">Choose an open brief...</option>
                                {myEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                             </select>
                          </div>
                          <textarea rows={4} className="admin-input py-4 resize-none" placeholder="Booking message..." value={message} onChange={e => setMessage(e.target.value)} />
                          <Button className="w-full h-16" onClick={handleBookingRequest} disabled={!selectedEvent || sending}>{sending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> SEND REQUEST</>}</Button>
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