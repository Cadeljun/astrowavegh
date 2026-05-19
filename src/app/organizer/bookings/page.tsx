'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, MapPin, Award, Star, Loader2, X, Clock, CheckCircle, Info, Send, User } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';
import ReviewModal from '@/components/bookings/ReviewModal';

const tabs = ['All', 'Pending', 'Active', 'Completed', 'Declined'];

export default function OrganizerBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bookings'), where('organizerId', '==', user.uid), orderBy('requestedAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    const map: Record<string, string> = {
      'Active': 'accepted',
      'Pending': 'pending',
      'Completed': 'completed',
      'Declined': 'declined'
    };
    return bookings.filter(b => b.status === map[activeTab]);
  }, [bookings, activeTab]);

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight text-glow-gold">GIG MANAGEMENT</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Track talent responses and performance feedback</p>
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
                  <Card className="p-8 group hover:border-gold/30 transition-all bg-[#111118]/60 relative" glowColor="gold">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                      <div className="flex flex-col items-center text-center gap-3 w-40 flex-shrink-0">
                         <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/40 transition-all shadow-2xl relative bg-surface">
                            <img src={b.talentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                         </div>
                         <div className="space-y-1">
                            <h3 className="font-bold text-white uppercase text-sm leading-tight">{b.talentStageName}</h3>
                            <Badge variant="active" className="text-[0.55rem] bg-purple-dim text-purple border-purple">{b.talentCategory}</Badge>
                         </div>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                           <Badge variant="active" className={cn(
                             b.status === 'pending' ? 'bg-gold-dim text-gold' : 
                             b.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 
                             b.status === 'completed' ? 'bg-cyan-dim text-cyan' : 'bg-white/5 text-muted'
                           )}>{b.status.toUpperCase()}</Badge>
                           <span className="text-[0.65rem] text-muted font-mono uppercase font-bold tracking-tighter">REF: {b.id.slice(0, 8)}</span>
                           <span className="text-[0.65rem] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Award size={12} /> {b.matchPercentage}% MATCH</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h2 className="text-2xl font-display text-white tracking-widest group-hover:text-glow-gold transition-all">{b.eventTitle.toUpperCase()}</h2>
                          <div className="flex flex-wrap items-center gap-6 text-muted text-[0.7rem] font-bold uppercase tracking-widest">
                             <span className="flex items-center gap-2.5"><Calendar size={14} className="text-gold" /> {new Date(b.eventDate?.toDate ? b.eventDate.toDate() : b.eventDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-2.5"><MapPin size={14} className="text-gold" /> {b.eventVenue}, {b.eventCity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-3 w-full lg:w-56 text-center">
                         <div className="mb-2">
                            <p className="text-[0.6rem] label m-0 opacity-40">AGREED PRICE</p>
                            <p className="text-lg font-display text-gold">{b.currency} {b.agreedPrice?.toLocaleString()}</p>
                         </div>
                         
                         {b.status === 'pending' && (
                           <div className="text-gold animate-pulse text-[0.6rem] font-bold uppercase tracking-widest flex flex-col items-center gap-2">
                             <Clock size={16} /> AWAITING RESPONSE
                             <button className="text-[0.55rem] text-muted hover:text-red-400 underline mt-2">CANCEL REQUEST</button>
                           </div>
                         )}
                         
                         {b.status === 'accepted' && (
                           <Button variant="secondary" className="h-11 text-[0.65rem]" onClick={() => setSelectedBooking(b)}>VIEW DETAILS</Button>
                         )}
                         
                         {b.status === 'completed' && !b.rated && (
                           <Button variant="primary" className="h-11 text-[0.65rem] bg-purple border-none" onClick={() => { setSelectedBooking(b); setReviewOpen(true); }}>RATE PERFORMANCE</Button>
                         )}
                         
                         {b.rated && (
                           <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gold/5 border border-gold/10">
                             <div className="flex gap-0.5 text-gold">{[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < b.rating ? 'currentColor' : 'none'} />)}</div>
                             <span className="text-[0.6rem] font-bold text-white uppercase tracking-widest">YOU RATED {b.rating}/5</span>
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
              <p className="text-3xl font-display tracking-[0.4em] uppercase">No History Found</p>
            </div>
          )}
        </div>

        {/* Booking Detail Modal */}
        <AnimatePresence>
          {selectedBooking && !isReviewOpen && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-2xl">
                <Card className="p-10 border-t-2 border-gold overflow-hidden">
                  <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <SectionLabel>BOOKING DOSSIER</SectionLabel>
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-surface">
                             <img src={selectedBooking.talentPhoto} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="space-y-1">
                             <h2 className="display-sm text-2xl text-white">{selectedBooking.talentStageName.toUpperCase()}</h2>
                             <Badge variant="active" className="bg-purple-dim text-purple border-purple">{selectedBooking.talentCategory}</Badge>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[0.6rem] label m-0">MATCH ANALYSIS</p>
                       <div className="grid grid-cols-4 gap-6 text-center">
                          <div className="space-y-1">
                             <p className="text-[0.55rem] text-muted uppercase">Location</p>
                             <p className="text-lg font-display text-white">{selectedBooking.locationScore || 30}/30</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[0.55rem] text-muted uppercase">Category</p>
                             <p className="text-lg font-display text-white">{selectedBooking.categoryScore || 40}/40</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[0.55rem] text-muted uppercase">Wave Score</p>
                             <p className="text-lg font-display text-white">{selectedBooking.waveScoreContribution || 26}/30</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[0.55rem] text-muted uppercase">Total Sync</p>
                             <p className="text-lg font-display text-gold">{selectedBooking.matchPercentage}%</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <SectionLabel className="text-[0.6rem]">EVENT SUMMARY</SectionLabel>
                          <div className="space-y-1 text-sm">
                             <p className="font-bold text-white uppercase">{selectedBooking.eventTitle}</p>
                             <p className="text-muted">{new Date(selectedBooking.eventDate?.toDate()).toLocaleDateString()}</p>
                             <p className="text-muted">{selectedBooking.eventVenue}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <SectionLabel className="text-[0.6rem]">FINANCIALS</SectionLabel>
                          <div className="space-y-1">
                             <p className="text-xl font-display text-gold">{selectedBooking.currency} {selectedBooking.agreedPrice.toLocaleString()}</p>
                             <p className="text-[0.6rem] text-muted uppercase">Fixed Engagement Fee</p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                       <div className="flex gap-4">
                          <Button variant="ghost" size="sm" className="border-white/5 text-[0.6rem] h-10 px-6">MESSAGE TALENT</Button>
                       </div>
                       <p className="text-[0.6rem] text-muted font-mono uppercase">Request ID: {selectedBooking.id}</p>
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
    </PlatformGuard>
  );
}
