
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, DollarSign, Eye, Pencil, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { doc, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import Link from 'next/link';

export default function TalentDashboard() {
  const { user } = useAuth();
  const [talentProfile, setTalentProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const snap = await getDoc(doc(db, 'talent_profiles', user.uid));
      if (snap.exists()) setTalentProfile(snap.data());
    }
    load();
  }, [user]);

  const stats = [
    { label: 'Profile Views', value: '2.4k', icon: Eye, color: 'cyan' },
    { label: 'Open Inquiries', value: '3', icon: MessageSquare, color: 'purple' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'gold' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="display-md text-white uppercase">
            {talentProfile?.stageName ? `${talentProfile.stageName.toUpperCase()}` : 'READY FOR THE SET?'}
          </h1>
          <p className="body-md text-muted">Manage your professional artist presence and track your upcoming gigs.</p>
        </div>
        <Link href="/talent/profile">
          <Button className="h-14 px-8 border-purple text-purple hover:bg-purple hover:text-white">
            <Pencil size={18} className="mr-2" /> EDIT PROFILE
          </Button>
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
          <SectionLabel>RECENT BOOKING REQUESTS</SectionLabel>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <MessageSquare size={48} />
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest">No requests yet</p>
              <p className="text-xs">Your profile is visible to organizers.</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6" glowColor="muted">
          <SectionLabel>ESTIMATED REVENUE</SectionLabel>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <DollarSign size={48} />
            <div className="space-y-1">
              <p className="text-3xl font-display text-white">GHS 0.00</p>
              <p className="text-xs font-bold uppercase tracking-widest">Lifetime Earnings</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
