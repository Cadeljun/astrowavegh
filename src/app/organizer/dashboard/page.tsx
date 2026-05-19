
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { doc, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import Link from 'next/link';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setProfile(snap.data());
    }
    load();
  }, [user]);

  const stats = [
    { label: 'Live Events', value: '0', icon: Zap, color: 'gold' },
    { label: 'Talent Network', value: '12', icon: Users, color: 'cyan' },
    { label: 'Active Bookings', value: '0', icon: MessageSquare, color: 'purple' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="display-md text-white uppercase">
            {profile?.name ? `WELCOME, ${profile.name.split(' ')[0]}` : 'WELCOME, ORGANIZER'}
          </h1>
          <p className="body-md text-muted">Manage your events and scout for fresh talent in the ecosystem.</p>
        </div>
        <Link href="/organizer/post-event">
          <Button className="h-14 px-8"><Plus size={18} className="mr-2" /> POST NEW EVENT</Button>
        </Link>
      </header>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((s, i) => (
          <motion.div key={i} variants={scaleIn}>
            <Card className="p-8 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color as any}>
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl bg-${s.color}/10 text-${s.color}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="font-display text-4xl text-white leading-none">{s.value}</p>
                  <p className="label text-[0.6rem] m-0">{s.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6" glowColor="muted">
          <SectionLabel>ACTIVE EVENTS</SectionLabel>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <Zap size={48} />
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest">No active events found</p>
              <p className="text-xs">Post an event to start matching with talent.</p>
            </div>
            <Link href="/organizer/post-event">
              <Button variant="ghost" size="sm">START POSTING</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-8 space-y-6" glowColor="muted">
          <SectionLabel>RECOMMENDED TALENT</SectionLabel>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <Users size={48} />
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest">Matches will appear here</p>
              <p className="text-xs">Our AI engine suggests talent based on your event vibe.</p>
            </div>
            <Link href="/organizer/search-talent">
              <Button variant="ghost" size="sm">SEARCH ROSTER</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
