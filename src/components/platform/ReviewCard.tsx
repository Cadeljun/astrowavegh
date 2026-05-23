'use client';

import React from 'react';
import { Star, User, Calendar, Quote } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: any;
  className?: string;
}

export default function ReviewCard({ review, className }: ReviewCardProps) {
  const scores = [
    { label: 'Performance', value: review.performance },
    { label: 'Professionalism', value: review.professionalism },
    { label: 'Communication', value: review.communication },
    { label: 'Value', value: review.valueForMoney },
  ];

  return (
    <Card className={cn("p-8 bg-[#111118]/60 hover:bg-[#111118] transition-all border-white/5", className)}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center text-purple font-display text-xl">
              {review.organizerName?.[0] || 'O'}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-display text-lg text-white uppercase tracking-widest leading-none">{review.organizerName}</h4>
              <p className="text-[0.65rem] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar size={10} className="text-gold" />
                {review.submittedAt ? format(review.submittedAt.toDate(), 'PPP') : 'Recently'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={14} 
                  fill={s <= review.overall ? '#FFD166' : 'none'} 
                  className={s <= review.overall ? "text-gold" : "text-white/5"} 
                />
              ))}
            </div>
            <span className="text-[0.6rem] text-gold font-bold uppercase tracking-widest">{review.overall}.0 Overall</span>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/5">
          {scores.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-[0.55rem] text-muted uppercase font-bold tracking-tighter">{s.label}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      star <= s.value ? "bg-purple shadow-[0_0_5px_rgba(168,85,247,0.5)]" : "bg-white/5"
                    )} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Text */}
        {review.review && (
          <div className="relative group">
            <Quote className="absolute -top-2 -left-2 text-purple/10 w-8 h-8 -rotate-12" />
            <p className="text-[0.9rem] text-white/90 leading-relaxed italic pl-6 border-l-2 border-purple/30 font-light">
              "{review.review}"
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
