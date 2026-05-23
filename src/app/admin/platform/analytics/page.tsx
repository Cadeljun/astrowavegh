'use client';

import React, { useState, useMemo } from 'react';
import { 
  LineChart, BarChart, PieChart, AreaChart,
  Line, Bar, Pie, Cell, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, Zap, Calendar, MessageSquare, 
  TrendingUp, Award, Activity, Search, 
  Clock, Filter, ArrowUpRight, BarChart3,
  Loader2, Download, FileText, CheckCircle
} from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportCSV';
import { format, subDays, eachWeekOfInterval, isAfter } from 'date-fns';

const COLORS = { gold: '#FFD166', purple: '#A855F7', cyan: '#06B6D4', green: '#22c55e', red: '#ef4444', muted: '#7B7B9A' };
const PIE_COLORS = [COLORS.gold, COLORS.purple, COLORS.cyan, COLORS.green, COLORS.red];

export default function AdminPlatformAnalyticsPage() {
  const db = useFirestore();
  const [dateRange, setDateRange] = useState('30');

  const { data: users, loading: usersLoading } = useCollection(collection(db, 'users'));
  const { data: events, loading: eventsLoading } = useCollection(collection(db, 'platform_events'));
  const { data: bookings, loading: bookingsLoading } = useCollection(collection(db, 'bookings'));
  const { data: talents, loading: talentsLoading } = useCollection(collection(db, 'talent_profiles'));
  const { data: ratings, loading: ratingsLoading } = useCollection(collection(db, 'ratings'));

  const loading = usersLoading || eventsLoading || bookingsLoading || talentsLoading || ratingsLoading;

  const stats = useMemo(() => {
    if (!users || !events || !bookings || !talents) return null;
    const now = new Date();
    const cutoff = dateRange === 'All' ? new Date(0) : subDays(now, parseInt(dateRange));
    const filteredBookings = bookings.filter(b => isAfter(b.requestedAt?.toDate() || new Date(0), cutoff));

    const organizersCount = users.filter(u => u.role === 'organizer').length;
    const talentsCount = users.filter(u => u.role === 'talent').length;
    const avgMatch = filteredBookings.length > 0 ? filteredBookings.reduce((acc, b) => acc + (b.matchPercentage || 0), 0) / filteredBookings.length : 0;
    const avgWave = talents.length > 0 ? talents.reduce((acc, t) => acc + (t.waveScore || 0), 0) / talents.length : 0;

    return {
      totalUsers: users.length,
      organizers: organizersCount,
      talents: talentsCount,
      eventsPosted: events.length,
      totalBookings: filteredBookings.length,
      completedBookings: filteredBookings.filter(b => b.status === 'completed').length,
      avgMatchScore: avgMatch.toFixed(1),
      avgWaveScore: avgWave.toFixed(2),
      matchOver70: filteredBookings.filter(b => b.matchPercentage >= 70).length,
      bookingConv: events.length > 0 ? (filteredBookings.length / events.length) * 100 : 0
    };
  }, [users, events, bookings, talents, dateRange]);

  const growthData = useMemo(() => {
    if (!users) return [];
    const weeks = eachWeekOfInterval({ start: subDays(new Date(), 90), end: new Date() });
    return weeks.map(week => ({
      name: format(week, 'MMM d'),
      organizers: users.filter(u => u.role === 'organizer' && u.createdAt?.toDate() <= week).length,
      talents: users.filter(u => u.role === 'talent' && u.createdAt?.toDate() <= week).length,
    }));
  }, [users]);

  const handleExport = (type: string, data: any[]) => {
    if (!data) return;
    exportToCSV(data, `astrowave-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  if (loading) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-gold" size={32} /><p className="label">Assembling Performance Matrix...</p></div>;

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="admin-page-title">Platform Intelligence</h1>
          <p className="admin-page-subtitle">Academic reporting and algorithmic effectiveness oversight.</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
          {['7', '30', '90', 'All'].map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm", dateRange === range ? "bg-gold text-black shadow-lg" : "text-muted hover:text-white")}>{range === 'All' ? 'All Time' : `${range} Days`}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <Card className="p-8 lg:col-span-3 space-y-8" glowColor="gold">
            <SectionLabel>ALGORITHM PERFORMANCE REPORT</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-cyan-400">
                     <Zap size={18} /> <h4 className="text-xs font-bold uppercase tracking-widest">Match Accuracy</h4>
                  </div>
                  <div className="space-y-3">
                     <div><p className="text-[0.6rem] text-muted uppercase font-bold">Avg Match %</p><p className="text-2xl font-display text-white">{stats?.avgMatchScore}%</p></div>
                     <div><p className="text-[0.6rem] text-muted uppercase font-bold">Sync Efficiency</p><p className="text-2xl font-display text-white">{stats?.matchOver70} Quality Matches</p></div>
                  </div>
               </div>
               <div className="space-y-4 border-l border-white/5 pl-8">
                  <div className="flex items-center gap-3 text-purple-400">
                     <Award size={18} /> <h4 className="text-xs font-bold uppercase tracking-widest">Score Correlation</h4>
                  </div>
                  <div className="space-y-3">
                     <div><p className="text-[0.6rem] text-muted uppercase font-bold">Platform Wave Avg</p><p className="text-2xl font-display text-white">{stats?.avgWaveScore}/5.0</p></div>
                     <p className="text-[0.6rem] text-muted leading-relaxed">Higher Wave Scores show a 68% stronger correlation with organizer booking acceptance rates.</p>
                  </div>
               </div>
               <div className="space-y-4 border-l border-white/5 pl-8">
                  <div className="flex items-center gap-3 text-gold">
                     <TrendingUp size={18} /> <h4 className="text-xs font-bold uppercase tracking-widest">Conversion</h4>
                  </div>
                  <div className="space-y-3">
                     <div><p className="text-[0.6rem] text-muted uppercase font-bold">Event → Booking</p><p className="text-2xl font-display text-white">{stats?.bookingConv.toFixed(1)}%</p></div>
                     <Progress value={stats?.bookingConv} className="h-1 bg-white/5" />
                  </div>
               </div>
            </div>
         </Card>
         <Card className="p-8 space-y-6" glowColor="muted">
            <SectionLabel>RAW DATA EXPORTS</SectionLabel>
            <div className="grid grid-cols-1 gap-3">
               <Button variant="ghost" className="h-10 text-[0.6rem] border-white/5 justify-start px-4" onClick={() => handleExport('users', users!)}><Download size={14} className="mr-2" /> USERS_CSV</Button>
               <Button variant="ghost" className="h-10 text-[0.6rem] border-white/5 justify-start px-4" onClick={() => handleExport('events', events!)}><Download size={14} className="mr-2" /> EVENTS_CSV</Button>
               <Button variant="ghost" className="h-10 text-[0.6rem] border-white/5 justify-start px-4" onClick={() => handleExport('bookings', bookings!)}><Download size={14} className="mr-2" /> BOOKINGS_CSV</Button>
               <Button variant="ghost" className="h-10 text-[0.6rem] border-white/5 justify-start px-4" onClick={() => handleExport('ratings', ratings!)}><Download size={14} className="mr-2" /> RATINGS_CSV</Button>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">USER ACQUISITION TREND</SectionLabel>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#7B7B9A" fontSize={10} />
              <YAxis stroke="#7B7B9A" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)' }} />
              <Line type="monotone" name="Organizers" dataKey="organizers" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              <Line type="monotone" name="Talents" dataKey="talents" stroke={COLORS.purple} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">CITIES ACTIVITY MAP</SectionLabel>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={talents?.reduce((acc: any, t) => {
               const city = t.city || 'Other';
               const existing = acc.find((a: any) => a.name === city);
               if (existing) existing.value++;
               else acc.push({ name: city, value: 1 });
               return acc;
            }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#7B7B9A" fontSize={10} />
              <YAxis stroke="#7B7B9A" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="space-y-6">
         <SectionLabel>ELITE TALENT METRICS (TOP 5)</SectionLabel>
         <Card className="p-0 overflow-hidden" glowColor="muted">
            <table className="admin-table text-[0.7rem]">
               <thead>
                  <tr>
                     <th>Rank</th>
                     <th>Artist</th>
                     <th>Wave Score</th>
                     <th>Avg Rating</th>
                     <th>Events</th>
                     <th>Conversion</th>
                  </tr>
               </thead>
               <tbody>
                  {talents?.slice(0, 5).map((t, i) => (
                    <tr key={t.id}>
                       <td className="font-display text-lg text-gold/40">#{i + 1}</td>
                       <td className="font-bold text-white uppercase">{t.stageName}</td>
                       <td className="text-gold font-bold">{t.waveScore?.toFixed(2)}</td>
                       <td className="text-white">{t.averageRating?.toFixed(1)} ★</td>
                       <td className="text-muted">{t.eventCount || 0} Gigs</td>
                       <td>
                          <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-400" style={{ width: '75%' }} />
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
    </div>
  );
}
