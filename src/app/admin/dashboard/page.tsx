'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, Calendar, Mail, Bell, Zap, Star,
  BookOpen, TrendingUp, ArrowRight, Activity,
  Eye, Plus, Mic, BarChart3, Clock, CheckCircle
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ label, value, icon: Icon, color, href, loading }: any) {
  return (
    <Link href={href || '#'}>
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0A1020] p-6 group hover:border-white/10 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle at 0% 100%, ${color}08, transparent 70%)` }} />
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={18} />
          </div>
          <ArrowRight size={14} className="text-muted/30 group-hover:text-muted/70 transition-colors" />
        </div>
        <p className="font-display text-4xl text-white leading-none mb-1">
          {loading ? <span className="inline-block w-12 h-8 bg-white/5 rounded animate-pulse" /> : value}
        </p>
        <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">{label}</p>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: color }} />
      </motion.div>
    </Link>
  );
}

function ActivityRow({ item, index }: { item: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.02] -mx-4 px-4 rounded-lg transition-colors"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
        {item.photoURL
          ? <img src={item.photoURL} alt="" className="w-full h-full object-cover" />
          : <span className="text-[0.55rem] font-bold text-muted uppercase">{item.name?.[0] ?? '?'}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{item.name || item.stageName || item.email || 'Unknown'}</p>
        <p className="text-[0.6rem] text-muted uppercase tracking-widest">{item.type}</p>
      </div>
      <div className="text-[0.6rem] text-muted/50 shrink-0">
        {item.createdAt
          ? formatDistanceToNow(item.createdAt?.toDate?.() ?? new Date(item.createdAt), { addSuffix: true })
          : '—'}
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const db = useFirestore();
  const { user } = useAuth();
  const { isSuperAdmin } = useRole();

  const [counts, setCounts] = useState({ contacts: 0, waitlist: 0, talent: 0, events: 0, bookings: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  const [unreadContacts, setUnreadContacts] = useState(0);

  // Load aggregate counts
  useEffect(() => {
    async function load() {
      try {
        const [contacts, waitlist, talent, events, bookings, users] = await Promise.all([
          getCountFromServer(collection(db, 'contacts')),
          getCountFromServer(collection(db, 'waitlist')),
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'events')),
          getCountFromServer(collection(db, 'bookings')),
          getCountFromServer(collection(db, 'users')),
        ]);
        setCounts({
          contacts: contacts.data().count,
          waitlist: waitlist.data().count,
          talent: talent.data().count,
          events: events.data().count,
          bookings: bookings.data().count,
          users: users.data().count,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [db]);

  // Unread contacts count
  useEffect(() => {
    const q = query(collection(db, 'contacts'), where('read', '==', false));
    return onSnapshot(q, snap => setUnreadContacts(snap.size), () => {});
  }, [db]);

  // Recent activity feed — merge contacts + waitlist signups
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const contactsQ = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'), limit(5));
    unsubs.push(onSnapshot(contactsQ, snap => {
      const items = snap.docs.map(d => ({ id: d.id, type: 'Contact Inquiry', ...d.data(), createdAt: d.data().timestamp }));
      setActivity(prev => {
        const others = prev.filter(a => a.type !== 'Contact Inquiry');
        return [...items, ...others].sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return tb - ta;
        }).slice(0, 8);
      });
    }, () => {}));

    const waitlistQ = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'), limit(5));
    unsubs.push(onSnapshot(waitlistQ, snap => {
      const items = snap.docs.map(d => ({ id: d.id, type: 'Waitlist Signup', ...d.data() }));
      setActivity(prev => {
        const others = prev.filter(a => a.type !== 'Waitlist Signup');
        return [...items, ...others].sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return tb - ta;
        }).slice(0, 8);
      });
    }, () => {}));

    return () => unsubs.forEach(u => u());
  }, [db]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin';

  const STATS = [
    { label: 'Contacts',    value: counts.contacts,  icon: Mail,      color: '#FFD166', href: '/admin/contacts' },
    { label: 'Waitlist',    value: counts.waitlist,  icon: Bell,      color: '#A855F7', href: '/admin/waitlist' },
    { label: 'Talent',      value: counts.talent,    icon: Mic,       color: '#06B6D4', href: '/admin/platform/talent' },
    { label: 'Events',      value: counts.events,    icon: Calendar,  color: '#00FF87', href: '/admin/platform/events' },
    { label: 'Bookings',    value: counts.bookings,  icon: BookOpen,  color: '#F97316', href: '/admin/platform/bookings' },
    { label: 'Users',       value: counts.users,     icon: Users,     color: '#EC4899', href: '/admin/platform/users' },
  ];

  const QUICK_ACTIONS = [
    { label: 'New Event',   href: '/admin/events/new',    icon: Plus,      color: '#FFD166' },
    { label: 'Add Talent',  href: '/admin/talent/new',    icon: Mic,       color: '#06B6D4' },
    { label: 'View Contacts', href: '/admin/contacts',   icon: Mail,      color: '#A855F7' },
    { label: 'Dev Panel',   href: '/dev',                 icon: Activity,  color: '#00FF87' },
  ];

  return (
    <div className="space-y-10 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold text-muted uppercase tracking-[0.25em] mb-1">{greeting}</p>
          <h1 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wider">{firstName}</h1>
          <p className="text-sm text-muted/60 mt-1">AstroWave Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadContacts > 0 && (
            <Link href="/admin/contacts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[0.65rem] font-bold uppercase tracking-widest hover:bg-yellow-400/15 transition-all">
              <Mail size={13} />
              {unreadContacts} unread
            </Link>
          )}
          <Link href="/" target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-muted text-[0.65rem] font-bold uppercase tracking-widest hover:text-white hover:border-white/25 transition-all">
            <Eye size={13} />
            Live Site
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Main content: activity + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0A1020] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity size={15} className="text-green-400" />
              </div>
              <h2 className="font-display text-xl text-white uppercase tracking-wider">Recent Activity</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className="space-y-0">
            {activity.length > 0
              ? activity.map((item, i) => <ActivityRow key={item.id} item={item} index={i} />)
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse my-2" />
                ))
            }
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0A1020] p-6 space-y-4">
            <h2 className="font-display text-xl text-white uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a, i) => (
                <motion.div key={a.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }}>
                  <Link href={a.href}
                    className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 hover:border-white/12 bg-[#070F1F] transition-all group hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${a.color}15`, color: a.color }}>
                      <a.icon size={16} />
                    </div>
                    <p className="text-[0.65rem] font-bold text-white/70 group-hover:text-white uppercase tracking-widest transition-colors leading-tight">
                      {a.label}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="rounded-2xl border border-white/5 bg-[#0A1020] p-6 space-y-3">
            <h2 className="font-display text-lg text-white uppercase tracking-wider">System</h2>
            {[
              { label: 'Firebase',   status: 'Online',  color: '#00FF87' },
              { label: 'Cloudinary', status: 'Online',  color: '#00FF87' },
              { label: 'Auth',       status: 'Active',  color: '#00FF87' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
