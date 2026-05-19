'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, ShieldCheck, Zap, User, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TalentReviewsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load Profile for stats
    const unsubProfile = onSnapshot(doc(db, 'talent_profiles', user.uid), (snap) => {
      setProfile(snap.data());
    });

    // Load all Ratings
    const q = query(
      collection(db, 'bookings'),
      where('talentId', '==', user.uid),
      where('rating', '>', 0),
      orderBy('reviewedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="display-md text-white uppercase tracking-tight text-glow-purple">MY REVIEWS</h1>
          <p className="text-xs text-muted uppercase tracking-[0.3em]">Community feedback & performance metrics</p>
        </div>
        <Card className="px-6 py-4 flex items-center gap-6 bg-purple/5 border-purple/20" glowColor="purple">
           <div className="flex flex-col items-center">
              <span className="text-2xl font-display text-white">{(profile?.averageRating || 0).toFixed(1)}</span>
              <span className="text-[0.5rem] label m-0">AVG STAR</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="flex flex-col items-center">
              <span className="text-2xl font-display text-gold">{(profile?.waveScore || 0).toFixed(1)}</span>
              <span className="text-[0.5rem] label m-0">WAVE SCORE</span>
           </div>
        </Card>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Rating Analytics */}
        <aside className="lg:col-span-4 space-y-8">
           <Card className="p-8 space-y-8" glowColor="muted">
              <SectionLabel>STAR DISTRIBUTION</SectionLabel>
              <div className="space-y-4">
                 {starCounts.map(({ star, count, percentage }) => (
                   <div key={star} className="flex items-center gap-4">
                      <span className="text-[0.65rem] font-bold text-muted w-4">{star}★</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${percentage}%` }} 
                           transition={{ duration: 1, ease: 'easeOut' }}
                           className="h-full bg-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                         />
                      </div>
                      <span className="text-[0.65rem] font-mono text-white/40 w-10 text-right">{count}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 space-y-6" glowColor="muted">
              <SectionLabel>PERFORMANCE INSIGHTS</SectionLabel>
              <div className="space-y-6">
                 {[
                   { label: 'Performance', val: 4.8 },
                   { label: 'Professionalism', val: 4.5 },
                   { label: 'Communication', val: 4.9 },
                   { label: 'Value for Money', val: 4.3 },
                 ].map((c, i) => (
                   <div key={i} className="flex justify-between items-center group">
                      <span className="text-xs text-muted font-medium group-hover:text-purple transition-colors">{c.label}</span>
                      <div className="flex items-center gap-1 text-white font-bold text-sm">
                        {c.val} <Star size={10} className="text-purple" fill="currentColor" />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </aside>

        {/* Reviews List */}
        <div className="lg:col-span-8 space-y-8">
           <div className="space-y-6">
             {loading ? (
               [1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl border border-white/5" />)
             ) : reviews.length > 0 ? (
               <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
                  {reviews.map((r) => (
                    <motion.div key={r.id} variants={fadeUp}>
                      <Card className="p-8 bg-[#111118]/80 hover:bg-[#111118] transition-all border-white/5 hover:border-purple/30 group">
                         <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center text-purple font-bold">
                                  {r.organizerName?.[0] || 'O'}
                               </div>
                               <div>
                                  <h4 className="font-bold text-white text-sm uppercase tracking-wider">{r.organizerName}</h4>
                                  <p className="text-[0.65rem] text-muted">{r.eventName} • {new Date(r.eventDate).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#FFD166' : 'none'} className={cn(s <= r.rating ? "text-gold" : "text-white/5")} />)}
                            </div>
                         </div>

                         <div className="relative p-6 rounded bg-black/40 border border-white/5 italic">
                            <span className="absolute top-2 left-2 text-4xl text-purple/20 leading-none">"</span>
                            <p className="text-sm text-white/80 leading-relaxed relative z-10">{r.review || "No written feedback provided."}</p>
                            <span className="absolute bottom-2 right-2 text-4xl text-purple/20 leading-none">"</span>
                         </div>

                         <div className="mt-6 flex items-center justify-between text-[0.6rem] text-muted font-bold uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2"><Clock size={12} /> Received {r.reviewedAt ? format(r.reviewedAt.toDate(), 'PPP') : 'Recently'}</span>
                            <div className="flex items-center gap-1 text-purple opacity-0 group-hover:opacity-100 transition-opacity">
                               <CheckCircle size={10} /> Verified Booking
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                  ))}
               </motion.div>
             ) : (
               <div className="py-32 text-center flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                  <Star size={64} className="mb-6 text-purple" />
                  <div className="space-y-2">
                    <p className="text-xl font-display tracking-widest uppercase">No reviews yet</p>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed">Complete your first booking to start receiving feedback and building your Wave Score.</p>
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
