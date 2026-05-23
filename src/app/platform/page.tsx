'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Mic, 
  Calendar, 
  Zap, 
  Star, 
  ChevronDown, 
  Loader2,
  Clock,
  Award
} from 'lucide-react';
import { collection, query, where, getCountFromServer, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Slider } from '@/components/ui/slider';
import TalentCard from '@/components/talent/TalentCard';
import { fadeUp, fadeIn, staggerContainer, scaleIn, heroTextReveal } from '@/lib/animations';
import { calculateWaveScore, getWaveRank } from '@/lib/algorithms/waveScore';
import CTABanner from '@/components/sections/CTABanner';

export default function PlatformLandingPage() {
  const [stats, setStats] = useState({ talents: 0, events: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);
  const [demoRating, setDemoRating] = useState(4.5);
  const [demoEvents, setDemoEvents] = useState(12);

  const demoScore = useMemo(() => {
    return calculateWaveScore(demoRating, demoEvents, new Date());
  }, [demoRating, demoEvents]);

  const demoRank = getWaveRank(demoScore.waveScore);

  useEffect(() => {
    async function loadData() {
      try {
        const [talentCount, eventCount, bookingCount] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'platform_events')),
          getCountFromServer(collection(db, 'bookings'))
        ]);
        setStats({ talents: talentCount.data().count, events: eventCount.data().count, bookings: bookingCount.data().count });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="relative z-10 text-center max-w-5xl space-y-8">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <Badge variant="live" className="mb-4">🌊 Now Live in Ghana</Badge>
          </motion.div>
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-2xl">
            FIND THE PERFECT<br />TALENT FOR YOUR<br /><span className="text-green text-glow-green">EVENT.</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.8 }} className="body-lg text-muted max-w-2xl mx-auto">
            AstroWave uses intelligent matching to connect event organizers with Ghana's best DJs, MCs, and performers. Powered by the Wave Score algorithm.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/auth/register"><Button size="lg" className="h-16 px-10"><Search size={18} className="mr-2" /> I NEED TALENT</Button></Link>
            <Link href="/auth/register"><Button variant="secondary" size="lg" className="h-16 px-10"><Mic size={18} className="mr-2" /> I'M A PERFORMER</Button></Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface py-32 px-6 lg:px-12 relative" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <SectionHeading label="THE ALGORITHM" title="WHAT IS THE WAVE SCORE?" />
            <p className="body-lg text-muted">Every talent on AstroWave has a Wave Score — an intelligent rating from 0 to 5 that goes beyond simple star ratings.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2"><p className="text-xs font-bold text-green uppercase">60% Rating</p><p className="text-xs text-muted">Verified post-event reviews.</p></div>
              <div className="space-y-2"><p className="text-xs font-bold text-blue uppercase">20% Volume</p><p className="text-xs text-muted">Gigs completed.</p></div>
              <div className="space-y-2"><p className="text-xs font-bold text-sky uppercase">20% Recency</p><p className="text-xs text-muted">Recent market activity.</p></div>
            </div>
          </div>
          <Card className="p-10 space-y-10 border-t-2 border-green shadow-2xl" glowColor="green">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted uppercase">Avg Rating: <span className="text-green">{demoRating}★</span></label>
                <Slider value={[demoRating]} min={0} max={5} step={0.1} onValueChange={([v]) => setDemoRating(v)} />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted uppercase">Events: <span className="text-green">{demoEvents} Gigs</span></label>
                <Slider value={[demoEvents]} min={0} max={50} step={1} onValueChange={([v]) => setDemoEvents(v)} />
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[0.6rem] label m-0">DEMO SCORE</p>
              <h2 className="font-display text-[6rem] text-white text-glow-green leading-none">{demoScore.waveScore.toFixed(2)}</h2>
              <Badge variant="active" className="mt-4">{demoRank.emoji} {demoRank.label}</Badge>
            </div>
          </Card>
        </div>
      </section>
      <CTABanner />
    </div>
  );
}
