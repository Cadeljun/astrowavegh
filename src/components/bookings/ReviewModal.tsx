
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, Save } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
      await updateDoc(doc(db, 'bookings', booking.id), {
        rating,
        review,
        reviewedAt: serverTimestamp()
      });
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
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
