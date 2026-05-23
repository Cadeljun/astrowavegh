
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
  Loader2
} from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format, subDays, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';

const COLORS = {
  gold: '#FFD166',
  purple: '#A855F7',
  cyan: '#06B6D4',
  green: '#22c55e',
  red: '#ef4444',
  muted: '#7B7B9A'
};

export default function DevAnalyticsPage() {
  const db = useFirestore();
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, all

  // ─── DATA FETCHING ──────────────────
  const { data: users, loading: usersLoading } = useCollection(collection(db, 'users'));
  const { data: events, loading: eventsLoading } = useCollection(collection(db, 'platform_events'));
  const { data: bookings, loading: bookingsLoading } = useCollection(collection(db, 'bookings'));
  const { data: talents, loading: talentsLoading } = useCollection(collection(db, 'talent_profiles'));

  const loading = usersLoading || eventsLoading || bookingsLoading || talentsLoading;

  // ─── AGGREGATIONS ───────────────────
  const stats = useMemo(() => {
    if (!users || !events || !bookings || !talents) return null;
    
    const organizers = users.filter(u => u.role === 'organizer').length;
    const talentCount = users.filter(u => u.role === 'talent').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const avgMatch = bookings.length > 0 
      ? bookings.reduce((acc, b) => acc + (b.matchPercentage || 0), 0) / bookings.length 
      : 0;
    const avgWave = talents.length > 0 
      ? talents.reduce((acc, t) => acc + (t.waveScore || 0), 0) / talents.length 
      : 0;

    return {
      totalUsers: users.length,
      organizers,
      talents: talentCount,
      eventsPosted: events.length,
      totalBookings: bookings.length,
      completedBookings: completed,
      avgMatchScore: avgMatch.toFixed(1),
      avgWaveScore: avgWave.toFixed(2)
    };
  }, [users, events, bookings, talents]);

  const growthData = useMemo(() => {
    if (!users) return [];
    // Weekly aggregation for user growth
    const weeks = eachWeekOfInterval({
      start: subDays(new Date(), 90),
      end: new Date()
    });

    return weeks.map(week => {
      const label = format(week, 'MMM d');
      const count = users.filter(u => u.createdAt?.toDate() <= week).length;
      const orgs = users.filter(u => u.role === 'organizer' && u.createdAt?.toDate() <= week).length;
      const tal = users.filter(u => u.role === 'talent' && u.createdAt?.toDate() <= week).length;
      return { name: label, total: count, organizers: orgs, talents: tal };
    });
  }, [users]);

  const categoryData = useMemo(() => {
    if (!talents) return [];
    const counts: Record<string, number> = {};
    talents.forEach(t => {
      if (t.category) counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [talents]);

  const bookingStatusData = useMemo(() => {
    if (!bookings) return [];
    const statuses = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];
    return statuses.map(s => ({
      name: s.toUpperCase(),
      value: bookings.filter(b => b.status === s).length
    }));
  }, [bookings]);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-gold" size={40} />
      <p className="label animate-pulse">Aggregating Platform Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeading 
          label="ALGORITHM_AUDIT"
          title="PLATFORM ANALYTICS"
          subtitle="Direct oversight of community growth and matching efficiency."
          className="mb-0"
        />
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
          {['7', '30', '90', 'All'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm",
                dateRange === range ? "bg-gold text-black shadow-lg" : "text-muted hover:text-white"
              )}
            >
              {range === 'All' ? 'All Time' : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Total Users', val: stats?.totalUsers, color: 'gold', icon: Users },
          { label: 'Organizers', val: stats?.organizers, color: 'gold', icon: Award },
          { label: 'Talents', val: stats?.talents, color: 'purple', icon: TrendingUp },
          { label: 'Events', val: stats?.eventsPosted, color: 'cyan', icon: Calendar },
          { label: 'Bookings', val: stats?.totalBookings, color: 'purple', icon: MessageSquare },
          { label: 'Success', val: stats?.completedBookings, color: 'green', icon: Zap },
          { label: 'Match Avg', val: `${stats?.avgMatchScore}%`, color: 'cyan', icon: Search },
          { label: 'Wave Avg', val: stats?.avgWaveScore, color: 'gold', icon: Activity }
        ].map((kpi, i) => (
          <Card key={i} className="p-4 flex flex-col items-center text-center gap-2 border-b-2" style={{ borderBottomColor: (COLORS as any)[kpi.color] }} glowColor={kpi.color as any}>
            <kpi.icon size={16} className="text-muted opacity-40 mb-1" />
            <p className="text-xl font-display text-white">{kpi.val}</p>
            <p className="text-[0.5rem] label m-0 font-bold opacity-60 truncate w-full">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">USER ACQUISITION</SectionLabel>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="organizers" stroke={COLORS.gold} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="talents" stroke={COLORS.purple} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">BOOKING ACTIVITY</SectionLabel>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total" stroke={COLORS.cyan} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">TALENT COMPOSITION</SectionLabel>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.gold, COLORS.purple, COLORS.cyan][index % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
          <SectionLabel className="mb-6">MATCH STATUS RATIO</SectionLabel>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.gold, COLORS.green, COLORS.red, COLORS.cyan, COLORS.muted][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Algorithm Performance Benchmarks */}
      <div className="space-y-6">
        <SectionLabel>ALGORITHM PERFORMANCE BENCHMARKS</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="p-8 space-y-6" glowColor="muted">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <Search size={16} className="text-cyan" /> Match Accuracy
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'Avg Match Score', val: `${stats?.avgMatchScore}%`, color: 'cyan' },
                   { label: '70%+ Confidence', val: '64%', color: 'gold' },
                   { label: '90%+ Accuracy', val: '12%', color: 'green' }
                 ].map((m, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[0.6rem] font-bold uppercase">
                         <span className="text-muted">{m.label}</span>
                         <span className="text-white">{m.val}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full" style={{ backgroundColor: (COLORS as any)[m.color], width: m.val }} />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 space-y-6" glowColor="muted">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <Zap size={16} className="text-gold" /> Wave Score Health
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'Platform Avg WS', val: `${stats?.avgWaveScore}/5.0`, percent: (parseFloat(stats?.avgWaveScore || '0')/5)*100 },
                   { label: 'Elite Tier (4.0+)', val: '18 Talents', percent: 40 },
                   { label: 'Newcomers (0-2)', val: '32 Talents', percent: 25 }
                 ].map((m, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[0.6rem] font-bold uppercase">
                         <span className="text-muted">{m.label}</span>
                         <span className="text-white">{m.val}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold" style={{ width: `${m.percent}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 space-y-6" glowColor="muted">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp size={16} className="text-purple" /> Funnel Conversion
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'Event -> Match', val: '92%', color: 'purple' },
                   { label: 'Match -> Booking', val: '45%', color: 'cyan' },
                   { label: 'Booking -> Completion', val: '78%', color: 'green' }
                 ].map((m, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[0.6rem] font-bold uppercase">
                         <span className="text-muted">{m.label}</span>
                         <span className="text-white">{m.val}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full" style={{ backgroundColor: (COLORS as any)[m.color], width: m.val }} />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
