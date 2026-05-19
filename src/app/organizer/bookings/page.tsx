
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, User, Clock, CheckCircle, XCircle, Star, AlertCircle, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import ReviewModal from '@/components/bookings/ReviewModal';

export default function OrganizerBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const bookingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'bookings'),
      where('organizerId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [user]);

  const { data: bookings, loading } = useCollection(bookingsQuery);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: `Booking ${newStatus}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const openReview = (booking: any) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'PENDING': return 'bg-gold-dim text-gold border-gold';
      case 'COMPLETED': return 'bg-cyan-dim text-cyan border-cyan';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-white/5 text-muted';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="display-md text-white">BOOKING REQUESTS</h1>
        <p className="body-md text-muted">Track your talent inquiries and manage gig confirmations.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-md border border-white/5" />)
        ) : bookings && bookings.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
            {bookings.map((booking: any) => (
              <motion.div key={booking.id} variants={fadeUp}>
                <Card className="p-8 group hover:border-gold/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                         <Badge variant="active" className={getStatusColor(booking.status)}>{booking.status}</Badge>
                         <span className="text-[0.65rem] text-muted font-mono uppercase">REF: {booking.id.slice(0, 8)}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="text-2xl font-display text-white tracking-widest">{booking.talentName.toUpperCase()}</h2>
                        <p className="text-xs text-gold font-bold uppercase tracking-widest">{booking.eventName}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-muted text-xs font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Calendar size={14} className="text-muted" /> {new Date(booking.eventDate).toLocaleDateString()}</span>
                         <span className="flex items-center gap-2"><Clock size={14} className="text-muted" /> {new Date(booking.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {booking.status === 'PENDING' && (
                        <Button variant="ghost" className="text-red-400 border-red-500/20" onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}>
                          CANCEL REQUEST
                        </Button>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <Button className="border-cyan text-cyan hover:bg-cyan hover:text-black" onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}>
                           MARK AS COMPLETED
                        </Button>
                      )}

                      {booking.status === 'COMPLETED' && !booking.rating && (
                        <Button variant="primary" onClick={() => openReview(booking)}>
                           <Star size={14} className="mr-2" /> LEAVE REVIEW
                        </Button>
                      )}

                      {booking.status === 'COMPLETED' && booking.rating && (
                        <div className="flex items-center gap-1 text-gold px-4 py-2 bg-gold/5 border border-gold/20 rounded-sm">
                           <Star size={14} fill="currentColor" />
                           <span className="text-sm font-bold">{booking.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-32 text-center space-y-6 opacity-30 border-2 border-dashed border-white/5 rounded-xl">
            <MessageSquare size={64} className="mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-display tracking-widest">NO BOOKINGS FOUND</p>
              <p className="text-xs">Once you request talent, they will appear here.</p>
            </div>
          </div>
        )}
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        booking={selectedBooking} 
      />
    </div>
  );
}
