
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, Save } from 'lucide-react';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export default function ReviewModal({ isOpen, onClose, booking }: ReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setLoading(true);

    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      const bookingUpdate = {
        rating,
        review,
        reviewedAt: serverTimestamp()
      };

      // 1. Update the booking document
      await updateDoc(bookingRef, bookingUpdate);

      // 2. Recalculate Talent Wave Score metrics
      const talentRef = doc(db, 'talent_profiles', booking.talentId);
      const talentSnap = await getDoc(talentRef);

      if (talentSnap.exists()) {
        const talentData = talentSnap.data();
        
        const prevRatingCount = talentData.ratingCount || 0;
        const prevAvgRating = talentData.averageRating || 0;
        const prevEventCount = talentData.eventCount || 0;

        const newRatingCount = prevRatingCount + 1;
        const newAvgRating = ((prevAvgRating * prevRatingCount) + rating) / newRatingCount;
        const newEventCount = prevEventCount + 1;
        
        // Recency factor calculation (simplified for MVP: 1.0 if done recently)
        const recencyFactor = 1.0;
        
        // Wave Score formula: 70% average rating + 30% activity volume/recency
        // Normalizing event count (log scale or cap at 50 for scoring purposes)
        const activityScore = Math.min(newEventCount / 10, 5); // 0.5 points per event, max 5
        const waveScore = (newAvgRating * 0.8) + (activityScore * 0.2);

        const talentUpdate = {
          averageRating: Number(newAvgRating.toFixed(2)),
          ratingCount: newRatingCount,
          eventCount: newEventCount,
          lastEventDate: booking.eventDate,
          recencyFactor,
          waveScore: Number(waveScore.toFixed(2)),
          updatedAt: serverTimestamp()
        };

        updateDoc(talentRef, talentUpdate).catch(err => {
          console.error("Talent profile update failed:", err);
        });
      }

      toast({ title: "Review Submitted", description: "Wave Score has been updated." });
      onClose();
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: `bookings/${booking.id}`,
        operation: 'update',
        requestResourceData: { rating, review },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-8 border-t-2 border-gold shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="display-sm text-2xl text-white tracking-widest uppercase">RATE PERFORMANCE</h2>
              <p className="text-xs text-muted">How was {booking?.talentName}'s vibe at {booking?.eventName}?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all transform hover:scale-110 ${star <= rating ? 'text-gold' : 'text-white/10'}`}
                >
                  <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="admin-label">YOUR REVIEW</label>
              <textarea
                required
                rows={4}
                className="admin-input min-h-[100px] resize-none"
                placeholder="Share your experience..."
                value={review}
                onChange={e => setReview(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button variant="ghost" onClick={onClose} disabled={loading}>CANCEL</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> SUBMIT</>}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
