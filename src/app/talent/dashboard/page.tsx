'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  DollarSign, 
  Eye, 
  Pencil, 
  User, 
  Zap, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Info,
  Calendar,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function TalentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, earnings: 0 });
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load Talent Profile
    const unsubProfile = onSnapshot(doc(db, 'talent_profiles', user.uid), (snap) => {
      setProfile(snap.data());
    });

    // Load Recent Bookings
    const qBookings = query(
      collection(db, 'bookings'), 
      where('talentId', '==', user.uid), 
      orderBy('requestedAt', 'desc'), 
      limit(5)
    );
    const unsubBookings = onSnapshot(qBookings, (snap) => {
      setRecentBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load Recent Reviews
    const qReviews = query(
      collection(db, 'bookings'),
      where('talentId', '==', user.uid),
      where('rating', '>', 0),
      orderBy('reviewedAt', 'desc'),
      limit(3)
    );
    const unsubReviews = onSnapshot(qReviews, (snap) => {
      setRecentReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Aggregates for stats
    const qAll = query(collection(db, 'bookings'), where('talentId', '==', user.uid));
    const unsubStats = onSnapshot(qAll, (snap) => {
      const data = snap.docs.map(d => d.data());
      setStats({
        pending: data.filter(b => b.status === 'pending').length,
        active: data.filter(b => b.status === 'accepted').length,
        completed: data.filter(b => b.status === 'completed').length,
        earnings: data.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (curr.agreedPrice || 0), 0)
      });
    });

    return () => { unsubProfile(); unsubBookings(); unsubStats(); unsubReviews(); };
  }, [user]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.photoURL) score += 20;
    if (profile.bio) score += 15;
    if (profile.category) score += 15;
    if (profile.basePrice > 0) score += 10;
    if (profile.city) score += 10;
    if (profile.instagram || profile.spotify) score += 10;
    if (profile.portfolio?.length > 0) score += 10;
    if (profile.demoReel) score += 10;
    return score;
  }, [profile]);

  const getRank = (score: number) => {
    if (score >= 4.5) return { label: "🌊 Wave Master", color: "text-gold" };
    if (score >= 4.0) return { label: "⭐ Rising Star", color: "text-purple" };
    if (score >= 3.0) return { label: "🎵 Performer", color: "text-cyan" };
    if (score >= 2.0) return { label: "🎤 Newcomer", color: "text-muted" };
    return { label: "🌱 Just Started", color: "text-muted/50" };
  };

  const currentRank = getRank(profile?.waveScore || 0);

  const toggleAvailability = async () => {
    if (!profile) return;
    await updateDoc(doc(db, 'talent_profiles', user!.uid), {
      available: !profile.available
    });
  };

  return (
    <PlatformGuard requiredRole="talent">
      <div className="space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">
              Welcome back, {profile?.stageName || 'Artist'}! 👋
            </h1>
            <p className="label text-muted tracking-[0.3em]">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <Link href="/talent/profile">
            <Button variant="ghost" className="h-12 border border-white/5 px-6">
              <Pencil size={16} className="mr-2" /> EDIT PROFILE
            </Button>
          </Link>
        </header>

        {/* Wave Score Card */}
        <motion.section variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-10 border-t-2 border-t-gold bg-[#111118]/80 backdrop-blur-2xl relative overflow-hidden" glowColor="gold">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
               <Zap size={400} className="text-gold absolute -top-20 -right-20 rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="admin-label text-gold font-bold">YOUR WAVE SCORE</p>
                  <div className="flex items-end gap-6">
                     <h2 className="font-display text-[7rem] leading-none text-white text-glow-gold">{(profile?.waveScore || 0).toFixed(1)}</h2>
                     <div className="pb-6">
                        <div className="flex gap-1 text-gold mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} size={20} fill={s <= Math.round(profile?.waveScore || 0) ? 'currentColor' : 'none'} className={s <= Math.round(profile?.waveScore || 0) ? "opacity-100" : "opacity-20"} />)}
                        </div>
                        <p className="text-sm font-bold text-muted uppercase tracking-widest">Global Rank: <span className={cn("font-display text-lg", currentRank.color)}>{currentRank.label}</span></p>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                   <div><p className="text-2xl font-display text-white">{profile?.eventCount || 0}</p><p className="text-[0.6rem] label m-0">EVENTS</p></div>
                   <div><p className="text-2xl font-display text-white">{profile?.ratingCount || 0}</p><p className="text-[0.6rem] label m-0">REVIEWS</p></div>
                   <div><p className="text-2xl font-display text-white">{profile?.completedBookings || 0}</p><p className="text-[0.6rem] label m-0">COMPLETE</p></div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setIsFormulaOpen(!isFormulaOpen)}
                    className="flex items-center gap-2 text-[0.6rem] font-bold text-muted hover:text-gold uppercase tracking-[0.2em] transition-all"
                  >
                    <Info size={12} /> How is this calculated?
                  </button>
                  <AnimatePresence>
                    {isFormulaOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 rounded-sm bg-black/40 border border-white/5 overflow-hidden">
                        <p className="text-[0.65rem] text-muted leading-relaxed font-mono">
                          WS = [(Rating÷5) × 0.6] + [(Events÷20) × 0.2] + [RecencyFactor × 0.2] × 5<br/>
                          <span className="text-gold mt-2 block font-bold">Your Values: [({profile?.averageRating || 0}÷5)×0.6] + [({profile?.eventCount || 0}÷20)×0.2] + [1.0×0.2] × 5 = {(profile?.waveScore || 0).toFixed(2)}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6">
                 <div className="relative w-56 h-56">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                      <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={653} strokeDashoffset={653 - (653 * (profile?.waveScore || 0) / 5)} className="text-gold shadow-[0_0_20px_rgba(255,209,102,0.6)] transition-all duration-1000" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <Award size={64} className="text-gold opacity-40 mb-2" />
                       <p className="text-[0.7rem] label m-0 font-bold">PERFORMANCE</p>
                    </div>
                 </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Pending Bookings', value: stats.pending, icon: Clock, color: 'gold' },
            { label: 'Active Gigs', value: stats.active, icon: Calendar, color: 'purple' },
            { label: 'Events Done', value: stats.completed, icon: CheckCircle, color: 'cyan' },
            { label: 'Lifetime Revenue', value: `GHS ${stats.earnings.toLocaleString()}`, icon: DollarSign, color: 'gold' },
          ].map((s, i) => (
            <Card key={i} className="p-6 bg-[#16161F]/40 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color as any}>
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg", `bg-${s.color}-dim text-${s.color}`)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="font-display text-2xl text-white">{s.value}</p>
                  <p className="text-[0.55rem] label m-0 font-bold">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Availability Toggle */}
            <Card className="p-8 space-y-6" glowColor={profile?.available ? 'gold' : 'muted'}>
              <div className="flex items-center justify-between">
                <SectionLabel className="mb-0">AVAILABILITY STATUS</SectionLabel>
              </div>
              <div className={cn("flex items-center justify-between p-8 rounded-xl border transition-all duration-500", profile?.available ? "bg-gold/5 border-gold/20 shadow-[0_0_30px_rgba(255,209,102,0.05)]" : "bg-black/40 border-white/5")}>
                 <div className="space-y-1">
                    <h3 className="font-display text-2xl text-white tracking-widest">{profile?.available ? 'OPEN FOR BOOKINGS' : 'OFF THE GRID'}</h3>
                    <p className="text-xs text-muted">{profile?.available ? 'Organizers can find and book you for events.' : 'You will not appear in search results or matching engines.'}</p>
                 </div>
                 <button 
                    onClick={toggleAvailability}
                    className={cn(
                      "w-16 h-8 rounded-full p-1 transition-all duration-500 relative",
                      profile?.available ? "bg-gold shadow-[0_0_15px_rgba(255,209,102,0.4)]" : "bg-white/10"
                    )}
                 >
                    <motion.div 
                      animate={{ x: profile?.available ? 32 : 0 }}
                      className="w-6 h-6 rounded-full bg-black shadow-lg"
                    />
                 </button>
              </div>
            </Card>

            {/* Recent Bookings */}
            <Card className="p-8 space-y-6" glowColor="muted">
              <div className="flex items-center justify-between">
                <SectionLabel className="mb-0">RECENT BOOKINGS</SectionLabel>
                <Link href="/talent/bookings" className="text-[0.6rem] font-bold text-gold uppercase hover:underline">View All →</Link>
              </div>
              
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="p-5 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-purple/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{booking.eventName}</h4>
                        <p className="text-xs text-muted">{booking.organizerName} • {new Date(booking.eventDate?.toDate ? booking.eventDate.toDate() : booking.eventDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                         <p className="text-sm font-bold text-gold">GHS {booking.agreedPrice}</p>
                         <Badge variant="active" className={cn(
                           booking.status === 'pending' ? 'bg-gold-dim text-gold' : 
                           booking.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                           booking.status === 'completed' ? 'bg-cyan-dim text-cyan' : 'bg-white/5 text-muted'
                         )}>{booking.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center opacity-30">
                  <MessageSquare size={48} className="mb-4" />
                  <p className="text-xs uppercase font-bold tracking-widest">No requests yet</p>
                </div>
              )}
            </Card>

            {/* Recent Reviews */}
            <Card className="p-8 space-y-6" glowColor="muted">
               <div className="flex items-center justify-between">
                <SectionLabel className="mb-0">RECENT REVIEWS</SectionLabel>
                <Link href="/talent/reviews" className="text-[0.6rem] font-bold text-gold uppercase hover:underline">View All →</Link>
              </div>
              {recentReviews.length > 0 ? (
                <div className="space-y-6">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="space-y-4 p-6 rounded-lg bg-black/40 border border-white/5">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="flex gap-0.5 mb-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= review.rating ? '#FFD166' : 'none'} className={s <= review.rating ? "text-gold" : "text-white/10"} />)}
                             </div>
                             <p className="text-sm font-bold text-white uppercase">{review.organizerName}</p>
                             <p className="text-[0.65rem] text-muted italic">{review.eventName}</p>
                          </div>
                          <p className="text-[0.6rem] text-muted font-mono uppercase">{review.reviewedAt ? formatDistanceToNow(review.reviewedAt.toDate()) + ' ago' : 'Recently'}</p>
                       </div>
                       <p className="text-xs text-white/70 leading-relaxed italic line-clamp-2">"{review.review}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center opacity-30">
                   <Star size={48} className="mb-4" />
                   <p className="text-xs uppercase font-bold tracking-widest">No feedback received</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 space-y-8" glowColor="purple">
              <SectionLabel>PROFILE HEALTH</SectionLabel>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-widest">
                       <span className="text-purple">Completion</span>
                       <span className="text-white">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-1 bg-white/5" />
                 </div>

                 <div className="space-y-3">
                    <p className="text-[0.6rem] text-muted uppercase font-bold tracking-widest">TASKS REMAINING:</p>
                    <div className="space-y-2">
                       {completion < 100 ? (
                         <>
                           {!profile?.photoURL && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-3 rounded bg-white/5">Upload Profile Photo <ArrowRight size={14} /></Link>}
                           {!profile?.bio && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-3 rounded bg-white/5">Write Professional Bio <ArrowRight size={14} /></Link>}
                           {(!profile?.instagram && !profile?.spotify) && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-3 rounded bg-white/5">Connect Social Media <ArrowRight size={14} /></Link>}
                           {(profile?.portfolio?.length || 0) < 3 && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-3 rounded bg-white/5">Add Portfolio Photos <ArrowRight size={14} /></Link>}
                         </>
                       ) : (
                         <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center space-y-2">
                            <CheckCircle size={24} className="text-green-500 mx-auto" />
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Profile is optimized</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </Card>

            <Card className="p-8 space-y-6" glowColor="muted">
               <SectionLabel>WAVE TIPS</SectionLabel>
               <div className="space-y-4">
                  <div className="p-5 rounded-md bg-[#111118] border-l-2 border-l-gold">
                     <p className="text-xs text-white/80 font-medium leading-relaxed italic">"Artists with demo reels are matched 3x more often. Upload yours to climb the ranks."</p>
                  </div>
                  <div className="p-5 rounded-md bg-[#111118] border-l-2 border-l-purple">
                     <p className="text-xs text-white/80 font-medium leading-relaxed italic">"Response time affects your wave. Accept or decline requests within 2 hours to keep score high."</p>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </PlatformGuard>
  );
}