'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, MapPin, Award, Star, Loader2, X, Clock, CheckCircle } from 'lucide-react';
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
    const q = query(collection(db, 'bookings'), where('organizerId', '==', user.uid), orderBy('requestedAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    return bookings.filter(b => b.status === activeTab.toLowerCase());
  }, [bookings, activeTab]);

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight text-glow-gold">GIG ARCHIVE</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Manage talent confirmations and performance feedback</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm", activeTab === tab ? "bg-gold text-black shadow-lg" : "text-muted hover:text-white")}>{tab}</button>
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
                  <Card className="p-8 group hover:border-gold/30 transition-all bg-[#111118]/60" glowColor="gold">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                      <div className="flex flex-col items-center text-center gap-3 w-40 flex-shrink-0">
                         <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/40 transition-all shadow-2xl relative">
                            <img src={b.talentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                         </div>
                         <h3 className="font-bold text-white uppercase text-sm leading-tight">{b.talentStageName}</h3>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                           <Badge variant="active" className={cn(b.status === 'pending' ? 'bg-gold-dim text-gold' : b.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-muted')}>{b.status.toUpperCase()}</Badge>
                           <span className="text-[0.65rem] text-muted font-mono uppercase">REF: {b.id.slice(0, 8)}</span>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-display text-white tracking-widest">{b.eventTitle.toUpperCase()}</h2>
                          <div className="flex flex-wrap items-center gap-6 text-muted text-[0.7rem] font-bold uppercase tracking-widest">
                             <span className="flex items-center gap-2"><Calendar size={14} className="text-gold" /> {new Date(b.eventDate?.toDate ? b.eventDate.toDate() : b.eventDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> {b.eventVenue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-3 w-full lg:w-56 text-center">
                         <p className="text-lg font-display text-white">{b.currency} {b.agreedPrice.toLocaleString()}</p>
                         {b.status === 'pending' && <div className="text-gold animate-pulse text-[0.6rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Clock size={12} /> Awaiting Response</div>}
                         {b.status === 'accepted' && <Button variant="secondary" className="h-11 text-[0.65rem]" onClick={() => setSelectedBooking(b)}>VIEW BRIEF</Button>}
                         {b.status === 'completed' && !b.rated && <Button variant="primary" className="h-11 text-[0.65rem]" onClick={() => { setSelectedBooking(b); setReviewOpen(true); }}>RATE PERFORMANCE</Button>}
                         {b.rated && <div className="flex items-center justify-center gap-1.5 text-gold"><Star size={14} fill="currentColor" /><span className="text-sm font-display">RATED {b.rating}/5</span></div>}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-48 text-center space-y-8 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
              <MessageSquare size={100} className="mx-auto text-gold" /><p className="text-3xl font-display tracking-[0.4em] uppercase">No Gigs Found</p>
            </div>
          )}
        </div>

        <ReviewModal isOpen={isReviewOpen} onClose={() => { setReviewOpen(false); setSelectedBooking(null); }} booking={selectedBooking} />
      </div>
    </PlatformGuard>
  );
}