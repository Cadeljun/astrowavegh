'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, User, Clock, CheckCircle, XCircle, Star, AlertCircle, Loader2, MapPin, Award, ArrowRight, Zap, Info, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import ReviewModal from '@/components/bookings/ReviewModal';
import { cn } from '@/lib/utils';

const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Declined'];

export default function OrganizerBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReviewOpen, setReviewOpen] = useState(false);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('organizerId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    return bookings.filter(b => b.status === activeTab.toLowerCase());
  }, [bookings, activeTab]);

  const openReview = (booking: any) => {
    setSelectedBooking(booking);
    setReviewOpen(true);
  };

  const cancelRequest = async (id: string) => {
    if (!confirm('Cancel this booking request?')) return;
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled', updatedAt: serverTimestamp() });
      toast({ title: "Request Cancelled" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Error" });
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="display-md text-white uppercase tracking-tight text-glow-gold">GIG ARCHIVE</h1>
          <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Manage talent confirmations and performance feedback</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm",
                activeTab === tab ? "bg-gold text-black shadow-lg" : "text-muted hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 min-h-[400px]">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-xl border border-white/5" />)
        ) : filteredBookings.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
            {filteredBookings.map((b) => (
              <motion.div key={b.id} variants={fadeUp}>
                <Card className="p-8 group hover:border-gold/30 transition-all bg-[#111118]/60 relative overflow-hidden" glowColor="gold">
                   <div className="flex flex-col lg:flex-row items-center gap-10">
                      {/* Talent Mini Profile */}
                      <div className="flex flex-col items-center text-center gap-3 w-40 flex-shrink-0">
                         <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/40 transition-all duration-500 shadow-2xl relative">
                            <img src={b.talentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                            {b.status === 'accepted' && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in zoom-in"><CheckCircle size={32} className="text-white drop-shadow-lg" /></div>}
                         </div>
                         <div className="space-y-0.5">
                            <h3 className="font-bold text-white uppercase text-sm leading-tight">{b.talentName}</h3>
                            <Badge variant="active" className="bg-white/5 border-white/10 text-muted text-[0.5rem] h-5">{b.talentCategory}</Badge>
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                           <Badge variant="active" className={cn(
                             b.status === 'pending' ? 'bg-gold-dim text-gold border-gold' : 
                             b.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                             b.status === 'completed' ? 'bg-cyan-dim text-cyan border-cyan' : 'bg-white/5 text-muted border-white/5'
                           )}>{b.status.toUpperCase()}</Badge>
                           <span className="text-[0.65rem] text-muted font-mono uppercase font-bold tracking-tighter">REF: {b.id.slice(0, 8)}</span>
                           <span className="text-[0.65rem] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Award size={12} /> {b.matchPercentage}% SYNC</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h2 className="text-2xl font-display text-white tracking-widest group-hover:text-glow-gold transition-all">{b.eventTitle.toUpperCase()}</h2>
                          <div className="flex flex-wrap items-center gap-6 text-muted text-[0.7rem] font-bold uppercase tracking-[0.15em]">
                             <span className="flex items-center gap-2"><Calendar size={14} className="text-gold" /> {new Date(b.eventDate?.toDate ? b.eventDate.toDate() : b.eventDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> {b.eventVenue}, {b.eventCity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-center gap-3 w-full lg:w-56 text-center">
                         <p className="text-lg font-display text-white">GHS {b.agreedPrice.toLocaleString()}</p>
                         
                         {b.status === 'pending' && (
                           <div className="space-y-3">
                              <div className="flex items-center justify-center gap-2 text-gold animate-pulse text-[0.6rem] font-bold uppercase tracking-[0.2em]">
                                <Clock size={12} /> Awaiting Response
                              </div>
                              <button onClick={() => cancelRequest(b.id)} className="text-[0.6rem] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest">Cancel Request</button>
                           </div>
                         )}

                         {b.status === 'accepted' && (
                           <Button variant="secondary" className="w-full border-gold text-gold hover:bg-gold hover:text-black h-11 text-[0.65rem]" onClick={() => setSelectedBooking(b)}>
                             VIEW BRIEF
                           </Button>
                         )}

                         {b.status === 'completed' && !b.rating && (
                           <Button variant="primary" className="w-full h-11 text-[0.65rem] font-bold bg-gold shadow-[0_0_20px_rgba(255,209,102,0.3)]" onClick={() => openReview(b)}>
                             RATE PERFORMANCE
                           </Button>
                         )}

                         {b.rating && (
                           <div className="flex items-center justify-center gap-1.5 text-gold px-4 py-2 bg-gold/5 border border-gold/20 rounded-lg">
                              <Star size={14} fill="currentColor" />
                              <span className="text-sm font-display">RATED {b.rating}/5</span>
                           </div>
                         )}
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-48 text-center space-y-8 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
            <MessageSquare size={100} className="mx-auto text-gold" />
            <div className="space-y-3">
              <p className="text-3xl font-display tracking-[0.4em] uppercase">No Gigs Found</p>
              <p className="text-sm text-muted uppercase font-bold tracking-widest">Filter "{activeTab}" is currently empty.</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBooking && !isReviewOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-3xl">
              <Card className="p-10 border-t-2 border-gold overflow-hidden">
                <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
                
                <div className="space-y-12">
                   <div className="space-y-6">
                      <SectionLabel>BOOKING CONFIRMATION</SectionLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                         <div className="space-y-2">
                            <h2 className="display-sm text-white tracking-widest uppercase">{selectedBooking.talentName}</h2>
                            <p className="text-sm font-bold text-gold uppercase tracking-widest">Booked for: {selectedBooking.eventTitle}</p>
                         </div>
                         <div className="flex gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                            <CheckCircle size={20} className="shrink-0" />
                            <div className="space-y-1">
                               <p className="text-xs font-bold uppercase">STATUS: CONFIRMED</p>
                               <p className="text-[0.65rem] opacity-70">Contract agreed at GHS {selectedBooking.agreedPrice.toLocaleString()}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-2xl bg-white/5 border border-white/5">
                      <div className="space-y-1 text-center border-r border-white/10">
                         <p className="text-[0.6rem] label m-0">Location Sync</p>
                         <p className="text-2xl font-display text-white">30/30</p>
                      </div>
                      <div className="space-y-1 text-center border-r border-white/10">
                         <p className="text-[0.6rem] label m-0">Vibe Matching</p>
                         <p className="text-2xl font-display text-white">40/40</p>
                      </div>
                      <div className="space-y-1 text-center">
                         <p className="text-[0.6rem] label m-0">Wave Energy</p>
                         <p className="text-2xl font-display text-gold">26/30</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[0.7rem] label m-0">YOUR MESSAGE TO TALENT</p>
                      <div className="p-6 rounded-xl bg-black/40 border border-white/5 italic text-white/80 body-md">
                         "{selectedBooking.message || 'No specific instructions provided.'}"
                      </div>
                   </div>

                   <div className="flex gap-4 pt-6 border-t border-white/5">
                      <Button className="flex-1 h-14" variant="secondary" asChild>
                         <Link href={`/organizer/talent/${selectedBooking.talentId}`}>VIEW ARTIST PROFILE</Link>
                      </Button>
                      <Button className="flex-1 h-14" onClick={() => setSelectedBooking(null)}>CLOSE WINDOW</Button>
                   </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => { setReviewOpen(false); setSelectedBooking(null); }} 
        booking={selectedBooking} 
      />
    </div>
  );
}
