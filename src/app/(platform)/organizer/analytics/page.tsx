
'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, PieChart, AreaChart, BarChart,
  Line, Pie, Area, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Calendar, Zap, Star, DollarSign, Award, Activity, 
  Loader2, ArrowRight, User
} from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useAuth, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import PlatformGuard from '@/components/platform/PlatformGuard';

const COLORS = ['#FFD166', '#A855F7', '#06B6D4', '#22c55e', '#ef4444'];

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const db = useFirestore();

  // Queries
  const eventsQuery = useMemoFirebase(() => 
    query(collection(db, 'platform_events'), where('organizerId', '==', user?.uid || '')), 
  [user]);
  
  const bookingsQuery = useMemoFirebase(() => 
    query(collection(db, 'bookings'), where('organizerId', '==', user?.uid || '')), 
  [user]);

  const { data: events, loading: eventsLoading } = useCollection(eventsQuery);
  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);

  const stats = useMemo(() => {
    if (!events || !bookings) return null;
    
    const completed = bookings.filter(b => b.status === 'completed');
    const spent = completed.reduce((acc, b) => acc + (b.agreedPrice || 0), 0);
    const avgMatch = bookings.reduce((acc, b) => acc + (b.matchPercentage || 0), 0) / (bookings.length || 1);
    
    // Find most booked category
    const cats: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.talentCategory) cats[b.talentCategory] = (cats[b.talentCategory] || 0) + 1;
    });
    const favCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalEvents: events.length,
      completedEvents: completed.length,
      totalSpent: spent,
      avgMatchScore: avgMatch.toFixed(1),
      favCategory: favCat,
      bookingsCount: bookings.length
    };
  }, [events, bookings]);

  const statusData = useMemo(() => {
    if (!bookings) return [];
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [bookings]);

  if (eventsLoading || bookingsLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-gold" size={32} />
      <p className="label">Compiling Host Dashboard...</p>
    </div>
  );

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        <SectionHeading 
          label="HOST_INSIGHTS"
          title="ORGANIZER ANALYTICS"
          subtitle="Visualize your booking history, spending habits, and event performance."
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'My Events', val: stats?.totalEvents, icon: Calendar, color: 'gold' },
            { label: 'Match Avg', val: `${stats?.avgMatchScore}%`, icon: Zap, color: 'cyan' },
            { label: 'Completed', val: stats?.completedEvents, icon: Award, color: 'purple' },
            { label: 'Total Spent', val: `GHS ${stats?.totalSpent.toLocaleString()}`, icon: DollarSign, color: 'gold' },
            { label: 'Top Category', val: stats?.favCategory, icon: Activity, color: 'purple' },
            { label: 'Bookings', val: stats?.bookingsCount, icon: Star, color: 'cyan' }
          ].map((kpi, i) => (
            <Card key={i} className="p-6 text-center space-y-2" glowColor={kpi.color as any}>
              <div className="flex justify-center mb-2">
                <kpi.icon size={20} className="text-muted opacity-40" />
              </div>
              <p className="text-2xl font-display text-white leading-none">{kpi.val}</p>
              <p className="text-[0.6rem] label m-0 font-bold opacity-60 uppercase">{kpi.label}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
              <SectionLabel className="mb-6">BOOKING STATUS BREAKDOWN</SectionLabel>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                       />
                       <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <Card className="p-8 h-[400px] flex flex-col" glowColor="muted">
              <SectionLabel className="mb-6">SPENDING TREND (GHS)</SectionLabel>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookings?.filter(b => b.status === 'completed').sort((a,b) => a.requestedAt?.toDate() - b.requestedAt?.toDate())}>
                       <defs>
                          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#FFD166" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis dataKey="eventTitle" hide />
                       <YAxis stroke="#7B7B9A" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                       />
                       <Area type="monotone" dataKey="agreedPrice" stroke="#FFD166" fillOpacity={1} fill="url(#colorSpent)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>

        {/* Talent History Table */}
        <div className="space-y-6">
           <SectionLabel>MY TALENT HISTORY</SectionLabel>
           <Card className="p-0 overflow-hidden" glowColor="muted">
              <div className="overflow-x-auto">
                 <table className="admin-table">
                    <thead>
                       <tr>
                          <th>Talent</th>
                          <th>Category</th>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Price</th>
                          <th>Sync %</th>
                          <th>Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {bookings?.slice(0, 10).map((b) => (
                          <tr key={b.id}>
                             <td>
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10">
                                      <img src={b.talentPhoto || 'https://picsum.photos/seed/talent/50/50'} alt="" className="w-full h-full object-cover" />
                                   </div>
                                   <span className="font-bold text-white uppercase text-xs">{b.talentStageName}</span>
                                </div>
                             </td>
                             <td><Badge variant="active" className="text-[0.6rem] bg-purple-dim text-purple border-purple">{b.talentCategory}</Badge></td>
                             <td className="text-white text-xs truncate max-w-[150px]">{b.eventTitle}</td>
                             <td className="text-muted text-[0.65rem]">{b.eventDate?.toDate ? format(b.eventDate.toDate(), 'MMM d, yyyy') : 'TBA'}</td>
                             <td className="text-gold font-bold">GHS {b.agreedPrice?.toLocaleString()}</td>
                             <td><span className="text-cyan-400 font-display text-lg">{b.matchPercentage}%</span></td>
                             <td>
                                <div className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase",
                                  b.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-muted"
                                )}>
                                   {b.status}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      </div>
    </PlatformGuard>
  );
}
