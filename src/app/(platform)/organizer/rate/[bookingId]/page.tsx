'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, Waves, Star, Search } from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import RatingForm from '@/components/platform/RatingForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PlatformGuard from '@/components/platform/PlatformGuard';
import WaveScoreCard from '@/components/platform/WaveScoreCard';

export default function RateTalentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [talent, setTalent] = useState<any>(null);

  useEffect(() => {
    if (!bookingId || !user) return;

    const fetchBooking = async () => {
      const snap = await getDoc(doc(db, 'bookings', bookingId));
      if (!snap.exists()) {
        router.push('/organizer/bookings');
        return;
      }
      const data = snap.data();
      if (data.organizerId !== user.uid) {
        router.push('/organizer/bookings');
        return;
      }
      setBooking({ id: snap.id, ...data });

      // Fetch talent current score for final display
      const tSnap = await getDoc(doc(db, 'talent_profiles', data.talentId));
      if (tSnap.exists()) setTalent(tSnap.data());
      
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, user, router]);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-gold" size={32} />
      <p className="label animate-pulse">Syncing engagement record...</p>
    </div>
  );

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="max-w-6xl mx-auto space-y-12 pb-24 pt-10">
        <header className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
            <ArrowLeft size={16} /> BACK TO BOOKINGS
          </button>
        </header>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              {booking.rated ? (
                <Card className="p-20 text-center space-y-8 bg-[#111118]/60 border-gold/20" glowColor="gold">
                   <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto text-gold border border-gold/30">
                      <Star size={40} fill="currentColor" />
                   </div>
                   <div className="space-y-2">
                      <h2 className="display-sm text-white">RATING ALREADY SUBMITTED</h2>
                      <p className="text-muted body-md">You've already provided feedback for this engagement.</p>
                   </div>
                   <Button onClick={() => router.push('/organizer/bookings')}>RETURN TO DASHBOARD</Button>
                </Card>
              ) : (
                <RatingForm booking={booking} onSuccess={() => setSuccess(true)} />
              )}
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <Card className="p-12 md:p-20 text-center space-y-10 bg-green-500/5 border-green-500/20" glowColor="muted">
                  <div className="relative inline-block">
                     <CheckCircle size={100} className="text-green-500 animate-in zoom-in duration-500" />
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="absolute -inset-10 bg-green-500/20 blur-[60px] rounded-full -z-10"
                      />
                  </div>
                  <div className="space-y-4">
                     <h2 className="display-md text-white text-glow-gold">REVIEW SUBMITTED!</h2>
                     <p className="body-lg text-muted max-w-lg mx-auto">Your feedback has been archived and synced with the talent's professional profile. The wave has been recalculated.</p>
                  </div>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <SectionLabel>UPDATED ROSTER DATA</SectionLabel>
                     {talent && (
                       <WaveScoreCard 
                         waveScore={talent.waveScore}
                         averageRating={talent.averageRating}
                         eventCount={talent.eventCount}
                         ratingCount={talent.ratingCount}
                         lastEventDate={talent.lastEventDate}
                         recencyFactor={talent.recencyFactor}
                       />
                     )}
                  </div>
                  <div className="flex flex-col justify-center space-y-6 text-center md:text-left">
                     <h3 className="font-display text-4xl text-white tracking-widest">WHAT'S NEXT?</h3>
                     <p className="text-muted body-md">Engagements like these help build a high-trust creative economy in Ghana. Keep hosting, keep rating.</p>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="h-14 flex-1 font-bold" onClick={() => router.push('/organizer/dashboard')}>GO TO DASHBOARD</Button>
                        <Button variant="secondary" className="h-14 flex-1 border-purple text-purple hover:bg-purple" onClick={() => router.push('/organizer/search')}>SCOUT NEW TALENT</Button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PlatformGuard>
  );
}
