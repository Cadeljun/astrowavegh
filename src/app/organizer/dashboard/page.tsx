'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Zap, MessageSquare, ArrowRight, Calendar, MapPin, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import Link from 'next/link';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function OrganizerDashboard() {
  const { user, platformUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, booked: 0, completed: 0 });
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const eventsQuery = query(collection(db, 'platform_events'), where('organizerId', '==', user.uid));
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStats({
        total: docs.length,
        open: docs.filter((e: any) => e.status === 'open').length,
        booked: docs.filter((e: any) => e.status === 'booked').length,
        completed: docs.filter((e: any) => e.status === 'completed').length
      });
      setActiveEvents(docs.filter((e: any) => e.status === 'open' || e.status === 'booked').slice(0, 4));
    });

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('organizerId', '==', user.uid),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc'),
      limit(3)
    );
    const unsubBookings = onSnapshot(bookingsQuery, (snap) => {
      setPendingBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const matchesQuery = query(collection(db, 'matches'), where('organizerId', '==', user.uid), orderBy('generatedAt', 'desc'), limit(3));
    const unsubMatches = onSnapshot(matchesQuery, (snap) => {
      setRecentMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubEvents(); unsubBookings(); unsubMatches(); };
  }, [user]);

  const statItems = [
    { label: 'My Events', value: stats.total, icon: Zap, color: 'gold' as const },
    { label: 'Open Briefs', value: stats.open, icon: Award, color: 'cyan' as const },
    { label: 'Booked', value: stats.booked, icon: Users, color: 'purple' as const },
    { label: 'Completed', value: stats.completed, icon: MessageSquare, color: 'muted' as const },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">
              Welcome back, {platformUser?.displayName?.split(' ')[0] || 'Organizer'}! 👋
            </h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link href="/organizer/post-event">
            <Button className="h-14 px-8 shadow-[0_0_20px_rgba(255,209,102,0.2)]">
              <Plus size={18} className="mr-2" /> POST AN EVENT
            </Button>
          </Link>
        </header>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {statItems.map((s, i) => (
            <motion.div key={i} variants={scaleIn}>
              <Card className="p-6 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color}>
                <div className="flex flex-col gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${s.color}-dim text-${s.color}`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <p className="font-display text-3xl text-white leading-none mb-1">{s.value}</p>
                    <p className="text-[0.6rem] label m-0 font-bold opacity-60">{s.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <SectionLabel className="mb-0">ACTIVE EVENTS</SectionLabel>
              <Link href="/organizer/events" className="text-[0.6rem] font-bold text-gold hover:underline uppercase tracking-widest">View All Events →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => (
                  <Card key={event.id} className="p-8 flex flex-col justify-between group h-full" glowColor="muted">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <Badge variant="active" className="bg-white/5 border-white/10 text-muted">{event.category}</Badge>
                        <Badge variant={event.status === 'open' ? 'live' : 'active'}>
                          {event.status === 'open' ? 'MATCHING' : 'BOOKED'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display text-white tracking-widest group-hover:text-gold transition-colors">{event.title.toUpperCase()}</h3>
                        <div className="flex flex-col gap-1 text-[0.7rem] font-bold text-muted uppercase tracking-widest">
                           <span className="flex items-center gap-2"><Calendar size={12} className="text-gold" /> {new Date(event.date?.toDate()).toLocaleDateString()}</span>
                           <span className="flex items-center gap-2"><MapPin size={12} className="text-gold" /> {event.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                      {event.status === 'open' ? (
                        <Link href={`/match/${event.id}`}>
                          <Button variant="primary" className="w-full h-11 text-[0.65rem] font-bold">FIND TALENT <ArrowRight size={14} className="ml-2" /></Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" className="w-full h-11 text-[0.65rem] border border-white/5" asChild><Link href="/organizer/bookings">VIEW BOOKING</Link></Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
                   <Zap size={48} className="text-muted opacity-20" />
                   <p className="text-sm font-bold text-muted uppercase tracking-widest">No active events found</p>
                   <Link href="/organizer/post-event"><Button variant="ghost" size="sm">POST FIRST EVENT</Button></Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <SectionLabel>PENDING RESPONSES</SectionLabel>
              {pendingBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingBookings.map((b) => (
                    <Card key={b.id} className="p-6 bg-white/[0.02] border-white/5 group hover:border-gold/30 transition-all">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                            <img src={b.talentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-white uppercase text-sm">{b.talentName}</h4>
                            <p className="text-xs text-muted uppercase tracking-widest">{b.eventTitle} • GHS {b.agreedPrice}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="flex items-center gap-2 text-gold animate-pulse text-[0.6rem] font-bold uppercase tracking-widest mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold" /> Awaiting Response
                           </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center opacity-20"><p className="text-xs uppercase font-bold tracking-[0.3em]">No pending requests</p></div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <Card className="p-8 space-y-6 bg-[#16161F]/60" glowColor="purple">
              <SectionLabel>QUICK ACTIONS</SectionLabel>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: 'Post New Event', href: '/organizer/post-event', icon: Plus, color: 'gold' },
                   { label: 'Scout Talent', href: '/organizer/search', icon: Users, color: 'cyan' },
                   { label: 'My Bookings', href: '/organizer/bookings', icon: MessageSquare, color: 'purple' },
                   { label: 'My Events', href: '/organizer/events', icon: Calendar, color: 'muted' },
                 ].map((action) => (
                   <Link key={action.label} href={action.href} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                     <div className="flex items-center gap-3">
                       <action.icon size={16} className={`text-${action.color}`} />
                       <span className="text-[0.65rem] font-bold text-white uppercase tracking-widest">{action.label}</span>
                     </div>
                     <ArrowRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                   </Link>
                 ))}
              </div>
            </Card>

            <Card className="p-8 space-y-6 bg-[#16161F]/60" glowColor="muted">
              <SectionLabel>RECENT AI MATCHES</SectionLabel>
              {recentMatches.length > 0 ? (
                <div className="space-y-6">
                  {recentMatches.map((m) => (
                    <div key={m.id} className="space-y-3">
                      <p className="text-[0.65rem] font-bold text-white uppercase truncate">{m.eventId}</p>
                      <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                         <p className="text-[0.6rem] text-cyan-400 font-bold uppercase tracking-widest">{m.results?.length || 0} Matches found</p>
                         <Link href={`/match/${m.eventId}`} className="flex items-center justify-between text-[0.6rem] font-bold text-gold hover:underline uppercase">View Results <ArrowRight size={12} /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center gap-3 opacity-20"><Award size={32} /><p className="text-[0.6rem] font-bold uppercase tracking-widest">No match history</p></div>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </PlatformGuard>
  );
}