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
  Filter
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TalentBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleStatusUpdate = async (id: string, newStatus: string, eventId: string) => {
    setActionLoading(id);
    try {
      // 1. Update Booking
      await updateDoc(doc(db, 'bookings', id), {
        status: newStatus,
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. If accepted, update event status
      if (newStatus === 'accepted') {
        await updateDoc(doc(db, 'platform_events', eventId), {
          status: 'booked',
          bookedTalentId: user!.uid
        });
      }

      toast({ title: `Gig ${newStatus}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="display-md text-white uppercase tracking-tight text-glow-purple">GIG REQUESTS</h1>
          <p className="text-xs text-muted uppercase tracking-[0.3em]">Manage your upcoming schedule</p>
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
                    {/* Event Photo / Icon */}
                    <div className="w-full lg:w-40 aspect-square rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-white/5">
                       {booking.eventPhoto ? (
                         <img src={booking.eventPhoto} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Zap size={32} className="text-purple" />
                            <span className="text-[0.5rem] font-bold uppercase tracking-[0.3em]">ASTROWAVE</span>
                         </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                         <Badge variant="active" className={cn(
                           booking.status === 'pending' ? 'bg-gold-dim text-gold border-gold' : 
                           booking.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                           booking.status === 'completed' ? 'bg-cyan-dim text-cyan border-cyan' : 'bg-white/5 text-muted border-white/5'
                         )}>{booking.status}</Badge>
                         <span className="text-[0.65rem] text-muted font-mono uppercase">Ref: {booking.id.slice(0, 8)}</span>
                         <span className="text-[0.65rem] text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-1"><Award size={12} /> {booking.matchPercentage}% Match</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-3xl font-display text-white tracking-widest group-hover:text-glow-purple transition-all">{booking.eventName.toUpperCase()}</h2>
                        <p className="text-sm font-bold text-muted uppercase tracking-widest">Hosted by <span className="text-white">{booking.organizerName}</span></p>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 text-muted text-[0.7rem] font-bold uppercase tracking-[0.2em]">
                         <span className="flex items-center gap-2"><Calendar size={14} className="text-purple" /> {new Date(booking.eventDate?.toDate ? booking.eventDate.toDate() : booking.eventDate).toLocaleDateString()}</span>
                         <span className="flex items-center gap-2"><MapPin size={14} className="text-purple" /> {booking.eventVenue || booking.eventCity}</span>
                         <span className="flex items-center gap-2 text-gold"><DollarSign size={14} className="text-gold" /> Agreed Price: GHS {booking.agreedPrice}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 w-full lg:w-48">
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600 text-white border-none shadow-[0_0_20px_rgba(34,197,94,0.3)] h-12"
                            onClick={() => handleStatusUpdate(booking.id, 'accepted', booking.eventId)}
                            disabled={actionLoading === booking.id}
                          >
                            {actionLoading === booking.id ? <Loader2 className="animate-spin" /> : 'ACCEPT GIG'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full text-red-400 border border-red-500/20 hover:bg-red-500/10 h-12"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled', booking.eventId)}
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
                        >
                          VIEW DETAILS
                        </Button>
                      )}

                      {booking.status === 'completed' && !booking.rated && (
                        <Button className="w-full bg-purple hover:bg-purple/80 text-white h-12">
                           SUBMIT REVIEW
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-40 text-center space-y-6 opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
            <Calendar size={80} className="mx-auto text-purple" />
            <div className="space-y-2">
              <p className="text-2xl font-display tracking-[0.3em] uppercase">No active wave found</p>
              <p className="text-sm text-muted">Filtered results for "{activeTab}" are currently empty.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
