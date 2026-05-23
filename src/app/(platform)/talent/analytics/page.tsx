
'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, AreaChart, RadarChart,
  Line, Area, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Waves, MessageSquare, Star, DollarSign, Award, Activity, 
  Loader2, ArrowRight, User, TrendingUp, CheckCircle
} from 'lucide-react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useAuth, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function TalentAnalyticsPage() {
  const { user, platformUser } = useAuth();
  const db = useFirestore();

  // Queries
  const bookingsQuery = useMemoFirebase(() => 
    query(collection(db, 'bookings'), where('talentId', '==', user?.uid || '')), 
  [user]);
  
  const reviewsQuery = useMemoFirebase(() => 
    query(collection(db, 'ratings'), where('talentId', '==', user?.uid || ''), orderBy('submittedAt', 'desc'), limit(10)), 
  [user]);

  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);
  const { data: reviews, loading: reviewsLoading } = useCollection(reviewsQuery);

  const stats = useMemo(() => {
    if (!bookings) return null;
    const completed = bookings.filter(b => b.status === 'completed');
    const earnings = completed.reduce((acc, b) => acc + (b.agreedPrice || 0), 0);
    return {
      totalBookings: bookings.length,
      completedGigs: completed.length,
      totalEarnings: earnings,
      avgRating: platformUser?.averageRating || 0,
      waveScore: platformUser?.waveScore || 0
    };
  }, [bookings, platformUser]);

  // Radar data for strengths
  const radarData = [
    { subject: 'Performance', A: 95, fullMark: 100 },
    { subject: 'Professionalism', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 85, fullMark: 100 },
    { subject: 'Value', A: 92, fullMark: 100 },
    { subject: 'Overall', A: 94, fullMark: 100 },
  ];

  if (bookingsLoading || reviewsLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple" size={32} />
      <p className="label">Syncing Talent Portfolio Data...</p>
    </div>
  );

  return (
    <PlatformGuard requiredRole="talent">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        <SectionHeading 
          label="PERFORMANCE_CENTER"
          title="TALENT ANALYTICS"
          subtitle="Detailed metrics on your Wave Score history, client sentiment, and earnings."
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-8 text-center border-t-2 border-gold" glowColor="gold">
            <p className="text-5xl font-display text-white text-glow-gold">{stats?.waveScore.toFixed(2)}</p>
            <p className="text-[0.6rem] label m-0 font-bold uppercase tracking-widest text-gold mt-2">WAVE SCORE</p>
          </Card>
          {[
            { label: 'Bookings', val: stats?.totalBookings, icon: MessageSquare, color: 'purple' },
            { label: 'Completed', val: stats?.completedGigs, icon: CheckCircle, color: 'purple' },
            { label: 'Earnings (GHS)', val: stats?.totalEarnings.toLocaleString(), icon: DollarSign, color: 'purple' },
            { label: 'Avg Rating', val: `${stats?.avgRating}★`, icon: Star, color: 'purple' }
          ].map((kpi, i) => (
            <Card key={i} className="p-8 text-center space-y-2" glowColor="muted">
              <div className="flex justify-center mb-2">
                <kpi.icon size={20} className="text-muted opacity-40" />
              </div>
              <p className="text-3xl font-display text-white leading-none">{kpi.val}</p>
              <p className="text-[0.6rem] label m-0 font-bold opacity-60 uppercase">{kpi.label}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Card className="lg:col-span-8 p-8 h-[400px] flex flex-col" glowColor="muted">
              <SectionLabel className="mb-6">BOOKING VOLUME TREND</SectionLabel>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookings?.sort((a,b) => a.requestedAt?.toDate() - b.requestedAt?.toDate())}>
                       <defs>
                          <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis dataKey="requestedAt" hide />
                       <YAxis stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                       <Area type="monotone" dataKey="agreedPrice" stroke="#A855F7" fillOpacity={1} fill="url(#colorBook)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <Card className="lg:col-span-4 p-8 h-[400px] flex flex-col" glowColor="muted">
              <SectionLabel className="mb-6">STRENGTHS ANALYSIS</SectionLabel>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                       <PolarGrid stroke="#ffffff10" />
                       <PolarAngleAxis dataKey="subject" stroke="#7B7B9A" fontSize={10} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                       <Radar name="Vibe" dataKey="A" stroke="#FFD166" fill="#FFD166" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>

        {/* Reviews Summary */}
        <div className="space-y-6">
           <SectionLabel>RECENT CLIENT REVIEWS</SectionLabel>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews?.map((r) => (
                <Card key={r.id} className="p-6 bg-black/40 border-white/5 space-y-4" glowColor="muted">
                   <div className="flex justify-between items-start">
                      <div className="flex gap-0.5">
                         {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= r.overall ? '#FFD166' : 'none'} className={s <= r.overall ? "text-gold" : "text-white/10"} />)}
                      </div>
                      <span className="text-[0.6rem] text-muted font-mono uppercase">{r.submittedAt ? format(r.submittedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                   </div>
                   <p className="text-xs text-white/80 leading-relaxed italic line-clamp-2">"{r.review}"</p>
                   <div className="pt-2 flex justify-between items-center">
                      <p className="text-[0.65rem] font-bold text-white uppercase">{r.organizerName}</p>
                      <Badge variant="active" className="text-[0.5rem]">VERIFIED GIG</Badge>
                   </div>
                </Card>
              ))}
              {(!reviews || reviews.length === 0) && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-xl opacity-20">
                   <p className="text-xs uppercase font-bold tracking-widest">No reviews submitted yet</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </PlatformGuard>
  );
}
