'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, 
  CalendarCheck, 
  Users, 
  Mail, 
  Bell, 
  FileText, 
  Plus, 
  UserPlus, 
  Upload, 
  ExternalLink,
  Clock as ClockIcon,
  ChevronRight
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const db = useFirestore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [counts, setCounts] = useState({
    totalEvents: 0,
    activeEvents: 0,
    talent: 0,
    newContacts: 0,
    waitlist: 0,
    inquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch Stats
  useEffect(() => {
    async function fetchCounts() {
      try {
        const [
          totalEventsSnap,
          activeEventsSnap,
          talentSnap,
          waitlistSnap,
          inquiriesSnap,
          contactsSnap
        ] = await Promise.all([
          getCountFromServer(collection(db, 'events')),
          getCountFromServer(query(collection(db, 'events'), where('active', '==', true))),
          getCountFromServer(collection(db, 'talent')),
          getCountFromServer(collection(db, 'waitlist')),
          getCountFromServer(collection(db, 'talent_inquiries')),
          getCountFromServer(collection(db, 'contacts'))
        ]);

        setCounts({
          totalEvents: totalEventsSnap.data().count,
          activeEvents: activeEventsSnap.data().count,
          talent: talentSnap.data().count,
          waitlist: waitlistSnap.data().count,
          inquiries: inquiriesSnap.data().count,
          newContacts: contactsSnap.data().count,
        });
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [db]);

  // Recent data
  const { data: recentContacts } = useCollection(
    query(collection(db, 'contacts'), orderBy('timestamp', 'desc'), limit(5))
  );
  const { data: recentInquiries } = useCollection(
    query(collection(db, 'talent_inquiries'), orderBy('timestamp', 'desc'), limit(5))
  );

  const stats = [
    { label: 'Total Events', value: counts.totalEvents, icon: Zap, color: 'gold' },
    { label: 'Active Events', value: counts.activeEvents, icon: CalendarCheck, color: 'cyan' },
    { label: 'Talent Roster', value: counts.talent, icon: Users, color: 'purple' },
    { label: 'All Contacts', value: counts.newContacts, icon: Mail, color: 'gold' },
    { label: 'Waitlist', value: counts.waitlist, icon: Bell, color: 'purple' },
    { label: 'Inquiries', value: counts.inquiries, icon: FileText, color: 'cyan' },
  ];

  const quickActions = [
    { label: 'ADD EVENT', icon: Plus, href: '/admin/events/new', color: 'gold' },
    { label: 'ADD TALENT', icon: UserPlus, href: '/admin/talent', color: 'purple' },
    { label: 'UPLOAD MEDIA', icon: Upload, href: '/admin/uploads', color: 'cyan' },
    { label: 'VIEW SITE', icon: ExternalLink, href: '/', color: 'muted', external: true },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back, AstroWave Admin.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-sm bg-white/5 border border-white/5 text-muted">
          <ClockIcon size={16} className="text-gold" />
          <span className="font-body text-sm font-medium tabular-nums">
            {format(currentTime, 'PPP • HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 relative border-b-2" style={{ borderBottomColor: `var(--color-${stat.color})` }} glowColor={stat.color as any}>
                <div className="space-y-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${stat.color}-dim text-${stat.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-[2.2rem] leading-none text-white">
                      {loading ? '...' : stat.value}
                    </p>
                    <p className="admin-label text-[0.6rem] m-0">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Contacts */}
        <Card className="p-8 space-y-6" glowColor="muted">
          <div className="flex items-center justify-between">
            <SectionLabel className="m-0">RECENT CONTACTS</SectionLabel>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/contacts')}>
              VIEW ALL <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
          <div className="overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts?.map((contact: any) => (
                  <tr key={contact.id} className="cursor-pointer" onClick={() => router.push('/admin/contacts')}>
                    <td className="font-medium">{contact.name}</td>
                    <td><span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{contact.subject}</span></td>
                    <td className="text-right text-muted text-xs">
                      {contact.timestamp ? format(contact.timestamp.toDate(), 'MMM d') : '...'}
                    </td>
                  </tr>
                ))}
                {(!recentContacts || recentContacts.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-muted italic">No contacts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Talent Inquiries */}
        <Card className="p-8 space-y-6" glowColor="muted">
          <div className="flex items-center justify-between">
            <SectionLabel className="m-0">TALENT INQUIRIES</SectionLabel>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/inquiries')}>
              VIEW ALL <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
          <div className="overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries?.map((inquiry: any) => (
                  <tr key={inquiry.id} className="cursor-pointer" onClick={() => router.push('/admin/inquiries')}>
                    <td className="font-medium">{inquiry.name}</td>
                    <td><span className="text-xs px-2 py-0.5 rounded-full bg-purple-dim text-purple border border-purple/20">{inquiry.role}</span></td>
                    <td className="text-right text-muted text-xs">
                      {inquiry.timestamp ? format(inquiry.timestamp.toDate(), 'MMM d') : '...'}
                    </td>
                  </tr>
                ))}
                {(!recentInquiries || recentInquiries.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-muted italic">No inquiries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              whileHover={{ y: -4 }}
              onClick={() => action.external ? window.open(action.href, '_blank') : router.push(action.href)}
              className="w-full"
            >
              <Card className="p-8 text-center space-y-4" glowColor={action.color as any}>
                <div className={`mx-auto w-12 h-12 rounded-sm flex items-center justify-center bg-${action.color}-dim text-${action.color}`}>
                  <Icon size={24} />
                </div>
                <p className="font-display text-xl tracking-wider text-white">{action.label}</p>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
