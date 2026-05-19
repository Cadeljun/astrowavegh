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
  Award
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

export default function TalentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, earnings: 0 });
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load Talent Profile
    const unsubProfile = onSnapshot(doc(db, 'talent_profiles', user.uid), (snap) => {
      setProfile(snap.data());
    });

    // Load Recent Bookings
    const q = query(collection(db, 'bookings'), where('talentId', '==', user.uid), orderBy('requestedAt', 'desc'), limit(5));
    const unsubBookings = onSnapshot(q, (snap) => {
      setRecentBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

    return () => { unsubProfile(); unsubBookings(); unsubStats(); };
  }, [user]);

  const toggleAvailability = async () => {
    if (!profile) return;
    await updateDoc(doc(db, 'talent_profiles', user!.uid), {
      available: !profile.available
    });
  };

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

  return (
    <div className="space-y-12">
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

      {/* Hero Wave Score Section */}
      <motion.section variants={fadeUp} initial="hidden" animate="show">
        <Card className="p-10 border-t-2 border-t-gold bg-[#111118]/80 backdrop-blur-2xl relative overflow-hidden" glowColor="gold">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
             <Zap size={400} className="text-gold absolute -top-20 -right-20 rotate-12" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="admin-label text-gold font-bold">YOUR WAVE SCORE</p>
                <div className="flex items-end gap-4">
                   <h2 className="font-display text-[6rem] leading-none text-white text-glow-gold">{(profile?.waveScore || 0).toFixed(1)}</h2>
                   <div className="pb-4">
                      <div className="flex gap-1 text-gold mb-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s <= Math.round(profile?.waveScore || 0) ? 'currentColor' : 'none'} className="opacity-50" />)}
                      </div>
                      <p className="text-sm font-bold text-muted uppercase tracking-widest">Global Rank: <span className={currentRank.color}>{currentRank.label}</span></p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
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
                {isFormulaOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-sm bg-black/40 border border-white/5">
                    <p className="text-[0.65rem] text-muted leading-relaxed font-mono">
                      WS = [(Rating÷5) × 0.6] + [(Events÷20) × 0.2] + [RecencyFactor × 0.2] × 5<br/>
                      <span className="text-gold mt-1 block">Your Values: [({profile?.averageRating || 0}÷5)×0.6] + [({profile?.eventCount || 0}÷20)×0.2] + [1.0×0.2] × 5 = {(profile?.waveScore || 0).toFixed(2)}</span>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">
               <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * (profile?.waveScore || 0) / 5)} className="text-gold shadow-[0_0_15px_rgba(255,209,102,0.5)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <Award size={48} className="text-gold opacity-40 mb-2" />
                     <p className="text-[0.6rem] label m-0">PERFORMANCE</p>
                  </div>
               </div>
               <div className="bg-black/60 px-6 py-2 rounded-full border border-white/5 flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", profile?.available ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500")} />
                  <span className="text-[0.65rem] font-bold text-white uppercase tracking-widest">{profile?.available ? 'Ready for Bookings' : 'Currently Unavailable'}</span>
               </div>
            </div>
          </div>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Bookings', value: stats.pending, icon: Clock, color: 'gold' },
          { label: 'Active Gigs', value: stats.active, icon: Calendar, color: 'purple' },
          { label: 'Events Done', value: stats.completed, icon: CheckCircle, color: 'cyan' },
          { label: 'Lifetime Revenue', value: `GHS ${stats.earnings.toLocaleString()}`, icon: DollarSign, color: 'gold' },
        ].map((s, i) => (
          <Card key={i} className="p-6 bg-[#16161F]/40 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color as any}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${s.color}-dim text-${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="font-display text-2xl text-white">{s.value}</p>
                <p className="text-[0.55rem] label m-0">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Activity */}
        <div className="lg:col-span-8 space-y-8">
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
                      <p className="text-xs text-muted">Hosted by {booking.organizerName} • {new Date(booking.eventDate).toLocaleDateString()}</p>
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
                <p className="text-xs uppercase font-bold tracking-widest">No booking requests found</p>
              </div>
            )}
          </Card>

          <Card className="p-8 space-y-6" glowColor="muted">
            <div className="flex items-center justify-between">
              <SectionLabel className="mb-0">AVAILABILITY SETTINGS</SectionLabel>
            </div>
            <div className="flex items-center justify-between p-8 rounded-xl bg-[#111118] border border-white/5">
               <div className="space-y-1">
                  <h3 className="font-display text-2xl text-white tracking-widest">{profile?.available ? 'OPEN FOR GIGS' : 'GO DARK'}</h3>
                  <p className="text-xs text-muted">{profile?.available ? 'Organizers can find you in match results and book you instantly.' : 'You will not appear in any search results or recommendations.'}</p>
               </div>
               <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "w-16 h-8 rounded-full p-1 transition-all duration-500 relative",
                    profile?.available ? "bg-green-500" : "bg-white/10"
                  )}
               >
                  <motion.div 
                    animate={{ x: profile?.available ? 32 : 0 }}
                    className="w-6 h-6 rounded-full bg-white shadow-lg"
                  />
               </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Health */}
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
                  <p className="text-[0.6rem] text-muted uppercase font-bold tracking-widest">REMAINING TASKS:</p>
                  <div className="space-y-2">
                     {!profile?.photoURL && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-2 rounded bg-white/5">Upload Profile Photo <ChevronRight size={14} /></Link>}
                     {!profile?.bio && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-2 rounded bg-white/5">Write Your Bio <ChevronRight size={14} /></Link>}
                     {(!profile?.instagram && !profile?.spotify) && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-2 rounded bg-white/5">Connect Socials <ChevronRight size={14} /></Link>}
                     {(profile?.portfolio?.length || 0) < 3 && <Link href="/talent/profile" className="flex items-center justify-between text-xs text-white/60 hover:text-purple transition-colors p-2 rounded bg-white/5">Add Portfolio Photos <ChevronRight size={14} /></Link>}
                  </div>
               </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6" glowColor="muted">
            <SectionLabel>QUICK TIPS</SectionLabel>
            <div className="space-y-4">
               <div className="p-4 rounded-md bg-white/[0.02] border-l-2 border-l-gold">
                  <p className="text-xs text-white/80 font-medium leading-relaxed italic">"Complete profiles with high-quality media are 4x more likely to be matched for premium events."</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
