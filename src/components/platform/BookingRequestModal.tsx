'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Zap, Loader2, Calendar, MapPin, DollarSign, Info } from 'lucide-react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { cn } from '@/lib/utils';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  talent: any;
  event: any;
}

export default function BookingRequestModal({ isOpen, onClose, talent, event }: BookingRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agreedPrice, setAgreedPrice] = useState<number>(talent?.basePrice || 0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync state when talent changes
  React.useEffect(() => {
    if (talent) setAgreedPrice(talent.basePrice || 0);
  }, [talent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !talent || !event) return;

    if (message.length < 20) {
      toast({ variant: 'destructive', title: 'Message too short', description: 'Please explain the booking in at least 20 characters.' });
      return;
    }

    setSubmitting(true);
    
    // Generate doc reference for non-blocking mutation
    const bookingRef = doc(collection(db, 'bookings'));
    const bookingId = bookingRef.id;

    const bookingData = {
      id: bookingId,
      eventId: event.id,
      organizerId: user.uid,
      organizerName: user.displayName || 'Organizer',
      talentId: talent.talentId,
      talentName: talent.talentName || talent.stageName,
      talentStageName: talent.stageName,
      talentCategory: talent.category,
      talentPhoto: talent.photoURL || '',
      matchPercentage: talent.matchPercentage,
      waveScore: talent.waveScore || 0,
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      eventCity: event.city || 'Accra',
      agreedPrice: Number(agreedPrice),
      currency: talent.currency || 'GHS',
      message,
      status: 'pending',
      ratingSubmitted: false,
      rated: false,
      requestedAt: serverTimestamp(),
      respondedAt: null,
      completedAt: null,
      updatedAt: serverTimestamp()
    };

    // Non-blocking Firestore Write
    setDoc(bookingRef, bookingData)
      .then(async () => {
        // Optimistically update event status
        const eventRef = doc(db, 'platform_events', event.id);
        setDoc(eventRef, { status: 'booked', updatedAt: serverTimestamp() }, { merge: true });

        // Notify talent
        const notifyRef = doc(collection(db, 'notifications'));
        setDoc(notifyRef, {
          userId: talent.talentId,
          type: 'booking_request',
          title: 'New Booking Request!',
          message: `${user.displayName} wants to book you for "${event.title}"`,
          read: false,
          actionUrl: '/talent/bookings',
          relatedId: bookingId,
          createdAt: serverTimestamp()
        });

        toast({ title: "Booking Request Sent!", description: `${talent.stageName} has been notified.` });
        onClose();
      })
      .catch((err) => {
        toast({ variant: 'destructive', title: "Booking Failed", description: err.message });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (!isOpen || !talent) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-xl"
      >
        <Card className="p-8 md:p-10 border-t-2 border-gold shadow-2xl" glowColor="gold">
          <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-2">
              <SectionLabel className="justify-center">NEW ENGAGEMENT</SectionLabel>
              <h2 className="display-sm text-3xl text-white tracking-widest uppercase">BOOK {talent.stageName}</h2>
              <div className="flex items-center justify-center gap-2 text-gold font-bold text-xs uppercase tracking-widest">
                 <Zap size={14} fill="currentColor" /> {talent.matchPercentage}% VIBE SYNC
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-white/[0.03] border border-white/5">
               <div className="space-y-4">
                  <p className="text-[0.6rem] label m-0">ARTIST</p>
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-lg">
                        <img src={talent.photoURL} className="w-full h-full object-cover" alt="" />
                     </div>
                     <p className="text-sm font-bold text-white uppercase truncate">{talent.stageName}</p>
                  </div>
               </div>
               <div className="space-y-4 border-l border-white/5 pl-6">
                  <p className="text-[0.6rem] label m-0">EVENT BRIEF</p>
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-white uppercase truncate">{event?.title}</p>
                     <p className="text-[0.6rem] text-muted uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={10} /> 
                        {new Date(event?.date?.toDate ? event.date.toDate() : event?.date).toLocaleDateString()}
                     </p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="admin-label flex justify-between items-center">
                     ENGAGEMENT OFFER ({talent.currency || 'GHS'})
                     <span className="text-[0.55rem] text-muted lowercase font-normal italic">Talent Base: {talent.basePrice}</span>
                  </label>
                  <div className="relative">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                     <input 
                       type="number" 
                       className="admin-input h-14 pl-12 text-lg font-display tracking-widest" 
                       value={agreedPrice} 
                       onChange={e => setAgreedPrice(Number(e.target.value))}
                       required
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="admin-label">BOOKING MESSAGE</label>
                  <textarea 
                    rows={4} 
                    className="admin-input py-4 resize-none min-h-[120px]" 
                    placeholder="Describe the role, specific requirements, and why this artist is a perfect fit for your vibe..." 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                  <div className="flex justify-between px-1">
                    <p className="text-[0.55rem] text-muted uppercase tracking-widest">Min 20 characters</p>
                    <p className={cn("text-[0.55rem] font-mono", message.length < 20 ? "text-red-400" : "text-green-500")}>{message.length} chars</p>
                  </div>
               </div>
            </div>

            <div className="pt-4 space-y-4">
               <Button type="submit" disabled={submitting} className="w-full h-16 text-lg font-bold tracking-[0.2em] shadow-[0_0_40px_rgba(255,209,102,0.2)]">
                  {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-3" /> SEND REQUEST</>}
               </Button>
               <p className="text-[0.55rem] text-center text-muted uppercase tracking-[0.1em] px-8 leading-relaxed italic opacity-60">
                  Talent will be notified instantly. Responses are typically received within 24 hours.
               </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
