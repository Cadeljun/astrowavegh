'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, Save, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { submitRating, validateRating, type RatingFormData } from '@/lib/platform/ratingService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StarInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  error?: string;
}

function StarInput({ label, value, onChange, error }: StarInputProps) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[0.65rem] font-bold text-white/70 uppercase tracking-widest">{label}</label>
        {value > 0 && (
          <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="text-[0.6rem] text-gold font-bold uppercase tracking-widest">
            {labels[hovered || value]}
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all transform hover:scale-125 focus:outline-none"
          >
            <Star
              size={32}
              fill={star <= (hovered || value) ? '#FFD166' : 'transparent'}
              stroke={star <= (hovered || value) ? '#FFD166' : '#333'}
              className={cn("transition-colors", star <= (hovered || value) ? "drop-shadow-[0_0_10px_rgba(255,209,102,0.3)]" : "")}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-[0.6rem] text-red-400 font-bold uppercase tracking-widest mt-1">{error}</p>}
    </div>
  );
}

interface RatingFormProps {
  booking: any;
  onSuccess: () => void;
}

export default function RatingForm({ booking, onSuccess }: RatingFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RatingFormData>({
    overall: 0,
    performance: 0,
    professionalism: 0,
    communication: 0,
    valueForMoney: 0,
    review: ''
  });

  const update = (key: keyof RatingFormData, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRating(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await submitRating(
        booking.id,
        booking.organizerId,
        booking.organizerName,
        booking.talentId,
        booking.eventId,
        booking.eventDate,
        formData
      );
      toast({ title: "Review Submitted", description: "The wave has been updated." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Submission Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 md:p-12 border-t-2 border-gold bg-[#111118]/80 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <SectionLabel className="justify-center">EXPERIENCE FEEDBACK</SectionLabel>
          <h2 className="display-sm text-white tracking-widest uppercase">RATE {booking.talentStageName}</h2>
          <p className="text-xs text-muted uppercase tracking-[0.2em] font-bold">{booking.eventTitle} • {booking.eventCity}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Star Categories */}
          <div className="space-y-8">
            <StarInput label="Overall Experience" value={formData.overall} onChange={val => update('overall', val)} error={errors.overall} />
            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/5">
              <StarInput label="Performance Quality" value={formData.performance} onChange={val => update('performance', val)} error={errors.performance} />
              <StarInput label="Professionalism" value={formData.professionalism} onChange={val => update('professionalism', val)} error={errors.professionalism} />
              <StarInput label="Communication" value={formData.communication} onChange={val => update('communication', val)} error={errors.communication} />
              <StarInput label="Value for Money" value={formData.valueForMoney} onChange={val => update('valueForMoney', val)} error={errors.valueForMoney} />
            </div>
          </div>

          {/* Written Section */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="admin-label m-0">Write Your Review</label>
                <span className={cn("text-[0.6rem] font-mono", formData.review.length < 20 ? "text-red-400" : "text-green-500")}>
                  {formData.review.length} / 500
                </span>
              </div>
              <textarea
                rows={10}
                maxLength={500}
                className={cn("admin-input min-h-[260px] resize-none py-6", errors.review && "border-red-400/50")}
                placeholder={`Share your experience working with ${booking.talentStageName}. What went well? Would you recommend them to other hosts?`}
                value={formData.review}
                onChange={e => update('review', e.target.value)}
              />
              {errors.review && <p className="text-[0.6rem] text-red-400 font-bold uppercase tracking-widest">{errors.review}</p>}
            </div>

            <div className="p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex gap-4 text-cyan-400">
               <Info className="shrink-0" size={20} />
               <div className="space-y-1">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest">Impact Notice</p>
                  <p className="text-[0.6rem] leading-relaxed opacity-80 uppercase font-medium">Your rating directly affects the talent's global Wave Score. High performance ratings increase their visibility and matching priority.</p>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-6">
          <Link href="/organizer/bookings" className="flex-1">
            <Button variant="ghost" type="button" className="w-full h-16 border border-white/5">CANCEL REVIEW</Button>
          </Link>
          <Button disabled={loading} type="submit" className="flex-[2] h-16 text-lg font-bold tracking-[0.3em] shadow-[0_0_50px_rgba(255,209,102,0.2)]">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} className="mr-3" /> COMMIT REVIEW</>}
          </Button>
        </div>
      </form>
    </Card>
  );
}
