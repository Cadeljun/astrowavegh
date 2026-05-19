'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  Star, 
  Loader2, 
  MapPin, 
  ChevronRight, 
  Zap, 
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function TalentBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('talentId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'All') return true;
    return b.status === activeTab.toLowerCase();
  });

  const handleStatusUpdate = async (booking: any, newStatus: string) => {
    setActionLoading(booking.id);
    try {
      // 1. Update Booking
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: newStatus,
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Update Event Status if accepted
      if (newStatus === 'accepted') {
        await updateDoc(doc(db, 'platform_events', booking.eventId), {
          status: 'booked',
          bookedTalentId: user!.uid,
          updatedAt: serverTimestamp()
        });
      }

      // 3. Create Notification for Organizer
      await addDoc(collection(db, 'notifications'), {
        userId: booking.organizerId,
        type: newStatus === 'accepted' ? 'booking_accepted' : 'booking_declined',
        title: newStatus === 'accepted' ? 'GIG CONFIRMED! 🌊' : 'Booking Declined',
        message: `${booking.talentName} has ${newStatus} your request for ${booking.eventName}.`,
        read: false,
        actionUrl: '/organizer/bookings',
        relatedId: booking.id,
        createdAt: serverTimestamp()
      });

      toast({ title: `Booking ${newStatus.toUpperCase()}` });
      setSelectedBooking(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

  return (
    <PlatformGuard requiredRole="talent">
      <div className="space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight text-glow-purple">MY GIGS</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em]">Track requests and confirm performance schedule</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm",
                  activeTab === tab ? "bg-purple text-white shadow-lg" : "text-muted hover:text-white"
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
              {filteredBookings.map((booking: any) => (
                <motion.div key={booking.id} variants={fadeUp}>
                  <Card className="p-8 group hover:border-purple/30 transition-all bg-[#111118]/60 relative overflow-hidden" glowColor="purple">
                    <div className="flex flex-col lg:flex-row gap-10">
                      {/* Event Banner */}
                      <div className="w-full lg:w-48 aspect-square rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-white/5 relative group-hover:border-purple/30 transition-all">
                         {booking.eventPhoto ? (
                           <img src={booking.eventPhoto} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                              <Zap size={32} className="text-purple" />
                              <span className="text-[0.5rem] font-bold uppercase tracking-[0.3em]">ASTROWAVE</span>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                           <Badge variant="active" className={cn(
                             booking.status === 'pending' ? 'bg-gold-dim text-gold border-gold' : 
                             booking.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                             booking.status === 'completed' ? 'bg-cyan-dim text-cyan border-cyan' : 'bg-white/5 text-muted border-white/5'
                           )}>{booking.status}</Badge>
                           <span className="text-[0.65rem] text-muted font-mono uppercase font-bold tracking-tighter">REF: {booking.id.slice(0, 8)}</span>
                           <span className="text-[0.65rem] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Award size={12} /> {booking.matchPercentage}% SYNC</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h2 className="text-3xl font-display text-white tracking-widest group-hover:text-glow-purple transition-all">{booking.eventName.toUpperCase()}</h2>
                          <p className="text-sm font-bold text-muted uppercase tracking-widest">Organizer: <span className="text-white">{booking.organizerName}</span></p>
                        </div>

                        <div className="flex flex-wrap items-center gap-10 text-muted text-[0.7rem] font-bold uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-2.5"><Calendar size={16} className="text-purple" /> {new Date(booking.eventDate?.toDate ? booking.eventDate.toDate() : booking.eventDate).toLocaleDateString()}</span>
                           <span className="flex items-center gap-2.5"><MapPin size={16} className="text-purple" /> {booking.eventVenue || 'Location TBA'}</span>
                           <span className="flex items-center gap-2.5 text-gold"><DollarSign size={16} className="text-gold" /> Agreed: GHS {booking.agreedPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-3 w-full lg:w-56">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              className="w-full bg-green-500 hover:bg-green-600 text-white border-none shadow-[0_0_20px_rgba(34,197,94,0.3)] h-12"
                              onClick={() => handleStatusUpdate(booking, 'accepted')}
                              disabled={actionLoading === booking.id}
                            >
                              {actionLoading === booking.id ? <Loader2 className="animate-spin" /> : 'ACCEPT GIG'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full text-red-400 border border-red-500/20 hover:bg-red-500/10 h-12"
                              onClick={() => handleStatusUpdate(booking, 'declined')}
                              disabled={actionLoading === booking.id}
                            >
                              DECLINE
                            </Button>
                          </>
                        )}

                        {booking.status === 'accepted' && (
                          <Button 
                            variant="secondary" 
                            className="w-full border-purple text-purple hover:bg-purple hover:text-white h-12"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            VIEW DETAILS
                          </Button>
                        )}

                        {booking.status === 'completed' && !booking.rated && (
                          <Button 
                            variant="primary" 
                            className="w-full bg-purple h-12 border-none shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                            onClick={() => setSelectedBooking(booking)}
                          >
                             SUBMIT FEEDBACK
                          </Button>
                        )}
                        
                        <Button variant="ghost" className="w-full text-[0.6rem] border-white/5 opacity-40 hover:opacity-100" onClick={() => setSelectedBooking(booking)}>
                          FULL BRIEF
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-48 text-center space-y-8 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
              <Calendar size={100} className="mx-auto text-purple" />
              <div className="space-y-3">
                <p className="text-3xl font-display tracking-[0.4em] uppercase">No Wave Detected</p>
                <p className="text-sm text-muted uppercase font-bold tracking-widest">Filtered bookings for "{activeTab}" are currently empty.</p>
              </div>
            </div>
          )}
        </div>

        {/* Booking Detail Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-2xl">
                <Card className="p-10 border-t-2 border-purple overflow-hidden">
                  <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <SectionLabel>BOOKING DETAILS</SectionLabel>
                       <h2 className="display-md text-white">{selectedBooking.eventName.toUpperCase()}</h2>
                       <div className="grid grid-cols-2 gap-8 text-[0.7rem] font-bold uppercase tracking-widest">
                          <div className="space-y-2">
                             <p className="text-muted flex items-center gap-2"><Calendar size={14} /> Date</p>
                             <p className="text-white">{new Date(selectedBooking.eventDate?.toDate ? selectedBooking.eventDate.toDate() : selectedBooking.eventDate).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-muted flex items-center gap-2"><MapPin size={14} /> Venue</p>
                             <p className="text-white">{selectedBooking.eventVenue}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[0.6rem] label m-0">MATCH ENGINE INSIGHT</p>
                       <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="space-y-1">
                             <p className="text-xs text-muted">Vibe Sync</p>
                             <p className="text-lg font-display text-cyan-400">96%</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs text-muted">Role Score</p>
                             <p className="text-lg font-display text-purple">40/40</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs text-muted">Wave Score</p>
                             <p className="text-lg font-display text-gold">{(selectedBooking.waveScore || 0).toFixed(1)}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <SectionLabel>ORGANIZER MESSAGE</SectionLabel>
                       <div className="p-6 rounded-xl bg-black/40 border border-white/5 italic text-white/80 body-md">
                         "{selectedBooking.message || 'No additional message provided.'}"
                       </div>
                    </div>

                    {selectedBooking.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-4 pt-6">
                        <Button className="h-14 bg-green-500 hover:bg-green-600 text-white border-none" onClick={() => handleStatusUpdate(selectedBooking, 'accepted')}>CONFIRM GIG</Button>
                        <Button variant="ghost" className="h-14 border-red-500/20 text-red-400" onClick={() => handleStatusUpdate(selectedBooking, 'declined')}>DECLINE</Button>
                      </div>
                    )}
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