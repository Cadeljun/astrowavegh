'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Zap, Clock, CheckCircle, StarHalf } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function TalentReviewsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, 'talent_profiles', user.uid), (snap) => {
      setProfile(snap.data());
    });

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

  const starCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <PlatformGuard requiredRole="talent">
      <div className="space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight text-glow-purple">FEEDBACK HUB</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em]">Track your community performance and vibe score</p>
          </div>
          <Card className="px-8 py-4 flex items-center gap-8 bg-purple/5 border-purple/20 shadow-xl" glowColor="purple">
             <div className="flex flex-col items-center">
                <span className="text-3xl font-display text-white">{(profile?.averageRating || 0).toFixed(1)}</span>
                <span className="text-[0.6rem] label m-0 font-bold">AVG STAR</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-3xl font-display text-gold">{(profile?.waveScore || 0).toFixed(1)}</span>
                <span className="text-[0.6rem] label m-0 font-bold">WAVE SCORE</span>
             </div>
          </Card>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Analytics Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
             <Card className="p-8 space-y-8 bg-[#111118]/60" glowColor="muted">
                <SectionLabel>STAR DISTRIBUTION</SectionLabel>
                <div className="space-y-5">
                   {starCounts.map(({ star, count, percentage }) => (
                     <div key={star} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-widest">
                           <span className="text-muted flex items-center gap-1.5">{star} <Star size={10} className="text-gold" fill="currentColor" /></span>
                           <span className="text-white">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${percentage}%` }} 
                             transition={{ duration: 1, ease: 'easeOut' }}
                             className="h-full bg-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </Card>

             <Card className="p-8 space-y-6 bg-[#111118]/60" glowColor="muted">
                <SectionLabel>COMMUNITY SENTIMENT</SectionLabel>
                <div className="space-y-6">
                   {[
                     { label: 'Energy Sync', val: 4.9 },
                     { label: 'Professionalism', val: 4.7 },
                     { label: 'Punctuality', val: 4.8 },
                     { label: 'Technical Mastery', val: 4.6 },
                   ].map((c, i) => (
                     <div key={i} className="flex justify-between items-center group cursor-default">
                        <span className="text-xs text-muted font-bold uppercase tracking-widest group-hover:text-purple transition-colors">{c.label}</span>
                        <div className="flex items-center gap-1.5 text-white font-display text-lg">
                          {c.val} <Star size={12} className="text-purple" fill="currentColor" />
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
          </aside>

          {/* Reviews Stream */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center justify-between mb-2">
                <SectionLabel className="mb-0">CLIENT REVIEWS ({reviews.length})</SectionLabel>
             </div>
             
             {loading ? (
               [1, 2].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)
             ) : reviews.length > 0 ? (
               <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
                  {reviews.map((r) => (
                    <motion.div key={r.id} variants={fadeUp}>
                      <Card className="p-10 bg-[#111118]/60 hover:bg-[#111118] transition-all border-white/5 hover:border-purple/30 group relative overflow-hidden">
                         <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                            <div className="flex items-center gap-5">
                               <div className="w-14 h-14 rounded-full bg-purple/10 border-2 border-purple/20 flex items-center justify-center text-purple font-display text-2xl group-hover:scale-110 transition-transform">
                                  {r.organizerName?.[0] || 'O'}
                               </div>
                               <div className="space-y-1">
                                  <h4 className="font-display text-xl text-white tracking-widest uppercase">{r.organizerName}</h4>
                                  <p className="text-[0.65rem] text-muted font-bold uppercase tracking-widest">{r.eventName} • {new Date(r.eventDate?.toDate ? r.eventDate.toDate() : r.eventDate).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="flex gap-1">
                               {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= r.rating ? '#FFD166' : 'none'} className={cn(s <= r.rating ? "text-gold" : "text-white/5")} />)}
                            </div>
                         </div>

                         <div className="relative p-8 rounded-2xl bg-black/40 border border-white/5 italic shadow-inner">
                            <span className="absolute top-2 left-4 text-6xl text-purple/10 font-display leading-none select-none">"</span>
                            <p className="text-[0.9rem] text-white/80 leading-relaxed relative z-10 font-medium">
                               {r.review || "The client opted not to leave a detailed written review for this performance."}
                            </p>
                            <span className="absolute bottom-2 right-4 text-6xl text-purple/10 font-display leading-none select-none">"</span>
                         </div>

                         <div className="mt-8 flex items-center justify-between text-[0.65rem] text-muted font-bold uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2.5"><Clock size={14} /> Received {r.reviewedAt ? format(r.reviewedAt.toDate(), 'PPP') : 'Recently'}</span>
                            <div className="flex items-center gap-2 text-purple opacity-0 group-hover:opacity-100 transition-opacity">
                               <CheckCircle size={12} /> Verified Wave Performance
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                  ))}
               </motion.div>
             ) : (
               <div className="py-48 text-center flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
                  <Star size={80} className="mb-8 text-purple animate-pulse" />
                  <div className="space-y-3">
                    <p className="text-3xl font-display tracking-[0.3em] uppercase">No Reviews Yet</p>
                    <p className="text-sm max-w-sm mx-auto leading-relaxed font-bold text-muted uppercase">Complete your first performance to begin building your professional reputation.</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </PlatformGuard>
  );
}