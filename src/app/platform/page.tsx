'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Search, Mic, Zap, Star, Award, MapPin, ArrowRight,
  ChevronDown, Loader2, Users, Shield, Clock, TrendingUp,
  Play, X, CheckCircle, SlidersHorizontal
} from 'lucide-react';
import {
  collection, query, where, orderBy, onSnapshot,
  getCountFromServer, limit, getDocs
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Slider } from '@/components/ui/slider';
import { calculateWaveScore, getWaveRank } from '@/lib/algorithms/waveScore';
import { cn } from '@/lib/utils';

// ─── WAVE SCORE LIVE DEMO ─────────────────────────────────────────────────────

function WaveScoreDemo() {
  const [rating, setRating] = useState(4.2);
  const [events, setEvents] = useState(10);
  const [days, setDays] = useState(15);

  const lastDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }, [days]);

  const score = useMemo(() => calculateWaveScore(rating, events, lastDate), [rating, events, lastDate]);
  const rank = getWaveRank(score);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 5) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] p-8 space-y-8">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 rounded-lg bg-gold/10 text-gold"><Zap size={18} /></div>
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-widest">Live Score Demo</p>
          <p className="text-[0.6rem] text-muted">Adjust sliders to see the algorithm</p>
        </div>
      </div>

      {/* Circular Score Gauge */}
      <div className="flex items-center justify-center relative z-10">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
            <motion.circle
              cx="64" cy="64" r="54"
              stroke="url(#scoreGrad)" strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD166" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-4xl text-white leading-none"
            >
              {score.toFixed(1)}
            </motion.span>
            <span className="text-[0.55rem] text-muted uppercase font-bold tracking-widest mt-1">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Rank badge */}
      <div className="flex justify-center relative z-10">
        <motion.div
          key={rank.label}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[0.7rem] uppercase tracking-widest"
          style={{ backgroundColor: `${rank.color}15`, color: rank.color, border: `1px solid ${rank.color}30` }}
        >
          {rank.emoji} {rank.label}
        </motion.div>
      </div>

      {/* Sliders */}
      <div className="space-y-5 relative z-10">
        {[
          { label: 'Avg Rating', value: rating, min: 0, max: 5, step: 0.1, set: setRating, display: `${rating.toFixed(1)} ★`, color: '#FFD166' },
          { label: 'Events Done', value: events, min: 0, max: 50, step: 1, set: setEvents, display: `${events} gigs`, color: '#A855F7' },
          { label: 'Days Since Last Gig', value: days, min: 0, max: 120, step: 1, set: setDays, display: `${days} days`, color: '#06B6D4' },
        ].map((s) => (
          <div key={s.label} className="space-y-2">
            <div className="flex justify-between text-[0.6rem] font-bold uppercase tracking-widest">
              <span className="text-muted">{s.label}</span>
              <span style={{ color: s.color }}>{s.display}</span>
            </div>
            <Slider
              value={[s.value]}
              min={s.min} max={s.max} step={s.step}
              onValueChange={([v]) => s.set(v)}
              className="accent-gold"
            />
          </div>
        ))}
      </div>

      {/* Formula */}
      <div className="relative z-10 p-3 rounded-lg bg-white/[0.03] border border-white/5">
        <p className="text-[0.55rem] font-mono text-muted/60 leading-relaxed">
          WS = [(Rating÷5)×0.6] + [Min(Events÷20,1)×0.2] + [Recency×0.2] × 5
        </p>
      </div>
    </div>
  );
}

// ─── TALENT CARD ─────────────────────────────────────────────────────────────

function TalentCard({ talent, onBook }: { talent: any; onBook: (t: any) => void }) {
  const rank = getWaveRank(talent.waveScore || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] hover:border-white/15 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.06)] flex flex-col"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={talent.photoURL || `https://picsum.photos/seed/${talent.id}/400/300`}
          alt={talent.stageName}
          className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F1F] via-[#070F1F]/30 to-transparent" />

        {/* Wave score badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Zap size={10} className="text-gold" />
          <span className="font-display text-sm text-white">{(talent.waveScore || 0).toFixed(1)}</span>
        </div>

        {/* Availability dot */}
        {talent.available && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[0.55rem] font-bold text-green-400 uppercase">Open</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl text-white uppercase tracking-wider leading-tight group-hover:text-purple transition-colors">
              {talent.stageName}
            </h3>
            <span className="text-[0.55rem] font-bold px-2 py-1 rounded-full border shrink-0"
              style={{ color: rank.color, borderColor: `${rank.color}30`, backgroundColor: `${rank.color}10` }}>
              {rank.emoji} {rank.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[0.6rem] font-bold text-muted uppercase tracking-widest">
            <span className="flex items-center gap-1"><MapPin size={10} className="text-purple" />{talent.city}</span>
            <span className="opacity-20">•</span>
            <Badge variant="active" className="text-[0.5rem] bg-purple/10 text-purple border-purple/20 px-2 py-0.5">{talent.category}</Badge>
          </div>
        </div>

        <p className="text-[0.7rem] text-muted leading-relaxed line-clamp-2 flex-1">{talent.bio || 'Professional creative talent on the AstroWave roster.'}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/5">
          {[
            { label: 'Rating', val: (talent.averageRating || 0).toFixed(1) + '★' },
            { label: 'Gigs', val: talent.eventCount || 0 },
            { label: 'Reviews', val: talent.ratingCount || 0 },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-lg text-white leading-none">{s.val}</p>
              <p className="text-[0.5rem] text-muted uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pricing + CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[0.55rem] text-muted uppercase">From</p>
            <p className="font-display text-base text-gold">{talent.currency || 'GHS'} {(talent.basePrice || 0).toLocaleString()}</p>
          </div>
          <button
            onClick={() => onBook(talent)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple/10 border border-purple/20 text-purple text-[0.6rem] font-bold uppercase tracking-widest hover:bg-purple hover:text-white transition-all duration-200"
          >
            Book Now <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FEATURE STEP CARDS ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'POST YOUR EVENT',
    desc: 'Describe your event, budget, and vibe. Our system reads every detail.',
    color: '#FFD166',
  },
  {
    step: '02',
    icon: Zap,
    title: 'AI MATCHES TALENT',
    desc: 'The Vibe Sync Algorithm scores Location (30%), Category (40%) and Wave Score (30%).',
    color: '#A855F7',
  },
  {
    step: '03',
    icon: Users,
    title: 'REVIEW & BOOK',
    desc: 'Browse ranked candidates with full profiles, reviews and match breakdowns.',
    color: '#06B6D4',
  },
  {
    step: '04',
    icon: Star,
    title: 'RATE THE WAVE',
    desc: 'Post-event ratings update Wave Scores in real-time — lifting the best to the top.',
    color: '#00FF87',
  },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  const db = useFirestore();

  // Live stats from Firestore
  const [stats, setStats] = useState({ talents: 0, events: 0, bookings: 0, avgScore: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Talent roster
  const [talents, setTalents] = useState<any[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Booking modal
  const [bookingTalent, setBookingTalent] = useState<any>(null);

  const ROLES = ['All', 'DJ', 'MC', 'Singer', 'Dancer', 'Hypeman', 'Comedian', 'Band'];

  // Load live stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [tSnap, eSnap, bSnap] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'platform_events')),
          getCountFromServer(collection(db, 'bookings')),
        ]);

        const talentDocs = await getDocs(
          query(collection(db, 'talent_profiles'), where('active', '==', true), limit(100))
        );
        const scores = talentDocs.docs.map(d => d.data().waveScore || 0).filter(Boolean);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        setStats({
          talents: tSnap.data().count,
          events: eSnap.data().count,
          bookings: bSnap.data().count,
          avgScore: avg,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, [db]);

  // Real-time talent roster
  useEffect(() => {
    const q = query(
      collection(db, 'talent_profiles'),
      where('active', '==', true),
      orderBy('waveScore', 'desc'),
      limit(18)
    );
    const unsub = onSnapshot(q, snap => {
      setTalents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTalentsLoading(false);
    }, () => setTalentsLoading(false));
    return unsub;
  }, [db]);

  // Filtered talent list
  const filteredTalents = useMemo(() => {
    let result = talents;
    if (roleFilter !== 'All') result = result.filter(t => t.category === roleFilter);
    if (cityFilter !== 'All') result = result.filter(t => t.city === cityFilter);
    if (availableOnly) result = result.filter(t => t.available);
    if (minScore > 0) result = result.filter(t => (t.waveScore || 0) >= minScore);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.stageName?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [talents, roleFilter, cityFilter, availableOnly, minScore, searchQuery]);

  const cities = useMemo(() => {
    const unique = [...new Set(talents.map(t => t.city).filter(Boolean))];
    return ['All', ...unique];
  }, [talents]);

  const STAT_ITEMS = [
    { label: 'Verified Talent', value: stats.talents, icon: Users, color: '#FFD166' },
    { label: 'Events Posted', value: stats.events, icon: Zap, color: '#A855F7' },
    { label: 'Bookings Made', value: stats.bookings, icon: CheckCircle, color: '#06B6D4' },
    { label: 'Avg Wave Score', value: stats.avgScore.toFixed(2), icon: Star, color: '#00FF87' },
  ];

  return (
    <main className="flex flex-col w-full min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background grid */}
        <div className="absolute inset-0 z-0"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple/5 blur-[120px] rounded-full z-0" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <SectionLabel>AI-Powered Matching Platform</SectionLabel>

            <h1 className="font-display uppercase leading-[0.9] text-white" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
              FIND THE
              <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FFD166, #A855F7)' }}>
                PERFECT TALENT
              </span>
              FOR YOUR EVENT.
            </h1>

            <p className="text-white/50 text-lg font-light leading-relaxed max-w-xl">
              AstroWave uses intelligent matching to connect event organizers with Ghana's best DJs, MCs, and performers — powered by the Wave Score algorithm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/auth/register">
                <Button size="lg" className="h-16 px-12 text-sm font-bold tracking-[0.2em] w-full sm:w-auto shadow-[0_0_40px_rgba(255,209,102,0.2)]">
                  <Search size={16} className="mr-2" /> I NEED TALENT
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="secondary" size="lg" className="h-16 px-12 text-sm w-full sm:w-auto border-white/20 hover:border-purple text-white hover:text-purple">
                  <Mic size={16} className="mr-2" /> I'M A PERFORMER
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {[
                { icon: Shield, text: 'Verified Talent' },
                { icon: Clock, text: '24hr Response' },
                { icon: TrendingUp, text: 'AI-Ranked Results' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[0.65rem] font-bold text-white/30 uppercase tracking-widest">
                  <Icon size={12} className="text-gold" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Wave Score Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-5"
          >
            <WaveScoreDemo />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── LIVE STATS ───────────────────────────────────────────────────── */}
      <section className="bg-[#050D1A] border-y border-white/5 py-12 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_ITEMS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] p-6 text-center group hover:border-white/10 transition-all"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}08, transparent 70%)` }}
              />
              <div className="relative z-10 space-y-2">
                <s.icon size={20} className="mx-auto mb-3" style={{ color: s.color, opacity: 0.6 }} />
                <p className="font-display text-4xl text-white">
                  {statsLoading ? '—' : s.value}
                </p>
                <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-black py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <SectionLabel className="justify-center">THE PROCESS</SectionLabel>
            <h2 className="font-display text-white uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              HOW VIBE SYNC WORKS
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
              A proprietary 3-factor algorithm matches your event brief with Ghana's top talent in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group rounded-2xl border border-white/5 bg-[#070F1F] p-8 hover:border-white/10 transition-all duration-300 hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 0% 100%, ${step.color}08, transparent 60%)` }}
                />

                {/* Step number */}
                <div className="absolute top-4 right-6 font-display text-[3rem] leading-none text-white/[0.04] select-none">
                  {step.step}
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}15`, color: step.color }}
                  >
                    <step.icon size={22} />
                  </div>
                  <h3 className="font-display text-xl text-white uppercase tracking-wider">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>

                {/* Connector line (not on last) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-white/10 z-20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TALENT ROSTER ────────────────────────────────────────────────── */}
      <section className="bg-[#050D1A] py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <SectionLabel>THE ROSTER</SectionLabel>
              <h2 className="font-display text-white uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                ELITE TALENT
              </h2>
              <p className="text-white/40 text-sm max-w-md">Ranked by Wave Score — the platform's trust index for creative talent in Ghana.</p>
            </div>
            <Link href="/auth/register">
              <Button variant="ghost" size="md" className="border border-white/10 hover:border-purple hover:text-purple h-12 px-8">
                Join as Talent <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Role pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full border text-[0.6rem] font-bold uppercase tracking-widest transition-all",
                    roleFilter === role
                      ? "bg-purple text-white border-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-transparent text-muted border-white/10 hover:border-white/25 hover:text-white"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Search + filter toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search talent..."
                className="w-48 bg-white/5 border border-white/10 rounded-full px-4 h-9 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple/50 transition-colors"
              />
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 h-9 rounded-full border text-[0.6rem] font-bold uppercase tracking-widest transition-all",
                  isFilterOpen
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/10 text-muted hover:border-white/20 hover:text-white"
                )}
              >
                <SlidersHorizontal size={12} /> Filters
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#070F1F] border border-white/5">
                  {/* City filter */}
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">City</label>
                    <select
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 h-10 text-xs text-white focus:outline-none focus:border-purple/50"
                    >
                      {cities.map(c => <option key={c} value={c} className="bg-[#0A0A0F]">{c}</option>)}
                    </select>
                  </div>

                  {/* Min wave score */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">Min Wave Score</label>
                      <span className="text-[0.6rem] font-bold text-gold">{minScore > 0 ? `${minScore}+` : 'Any'}</span>
                    </div>
                    <Slider value={[minScore]} min={0} max={5} step={0.5} onValueChange={([v]) => setMinScore(v)} />
                  </div>

                  {/* Available toggle */}
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">Availability</label>
                    <button
                      onClick={() => setAvailableOnly(!availableOnly)}
                      className={cn(
                        "w-full h-10 rounded-lg border text-[0.65rem] font-bold uppercase tracking-widest transition-all",
                        availableOnly
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-white/5 border-white/10 text-muted hover:text-white"
                      )}
                    >
                      {availableOnly ? '✓ Available Only' : 'Show All'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          {!talentsLoading && (
            <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">
              {filteredTalents.length} {filteredTalents.length === 1 ? 'Artist' : 'Artists'} found
            </p>
          )}

          {/* Grid */}
          {talentsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-[420px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredTalents.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTalents.map(talent => (
                  <TalentCard key={talent.id} talent={talent} onBook={setBookingTalent} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center gap-4 opacity-30">
              <Users size={48} />
              <p className="font-display text-xl uppercase tracking-widest">No Talent Found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}

          {filteredTalents.length > 0 && (
            <div className="flex justify-center pt-6">
              <Link href="/auth/register">
                <Button variant="ghost" size="lg" className="border border-white/10 hover:border-gold/30 h-14 px-12">
                  View Full Roster <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ALGORITHM EXPLAINER ──────────────────────────────────────────── */}
      <section className="bg-black py-24 lg:py-32 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <SectionLabel>THE ALGORITHM</SectionLabel>
              <h2 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                VIBE SYNC<br />EXPLAINED
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Location Match', weight: '30%', desc: 'Same city = full score. Same region = partial. Long distance = minimal.', color: '#06B6D4', w: 30 },
                { label: 'Category Fit', weight: '40%', desc: 'Talent specialty must match your event type perfectly for full points.', color: '#FFD166', w: 40 },
                { label: 'Wave Score', weight: '30%', desc: 'Community-verified rating combining reviews, gig count, and recency.', color: '#A855F7', w: 30 },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-2 p-5 rounded-xl border border-white/5 bg-[#070F1F] hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <span className="font-display text-xl" style={{ color: item.color }}>{item.weight}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.w}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <WaveScoreDemo />
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#050D1A] border-t border-white/5 py-24 px-6 lg:px-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple/6 blur-[100px] rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="font-display text-[14vw] text-white/[0.018] leading-none tracking-tighter uppercase">WAVE</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center space-y-8"
        >
          <SectionLabel className="justify-center">GET STARTED</SectionLabel>
          <h2 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            READY TO RIDE<br />THE WAVE?
          </h2>
          <p className="text-white/40 text-base leading-relaxed max-w-xl mx-auto">
            Join hundreds of organizers and creative talent building Ghana's most vibrant entertainment economy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="h-16 px-14 text-sm font-bold tracking-[0.2em] shadow-[0_0_50px_rgba(255,209,102,0.15)]">
                CREATE FREE ACCOUNT
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="lg" className="h-16 px-14 text-sm border border-white/10 hover:border-white/25">
                LEARN MORE
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── BOOKING MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingTalent && (
          <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingTalent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#070F1F] p-8 space-y-6 shadow-2xl"
            >
              <button onClick={() => setBookingTalent(null)} className="absolute top-5 right-5 text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple/30">
                  <img src={bookingTalent.photoURL || `https://picsum.photos/seed/${bookingTalent.id}/100/100`} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white uppercase tracking-wider">{bookingTalent.stageName}</h3>
                  <p className="text-[0.6rem] text-muted uppercase tracking-widest">{bookingTalent.category} · {bookingTalent.city}</p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-purple/5 border border-purple/10 text-center space-y-1">
                <p className="text-[0.6rem] text-muted uppercase tracking-widest">To book talent, you need an account</p>
                <p className="font-display text-2xl text-gold">{bookingTalent.currency || 'GHS'} {(bookingTalent.basePrice || 0).toLocaleString()}</p>
                <p className="text-[0.55rem] text-muted">Starting price · Negotiable</p>
              </div>

              <div className="space-y-3">
                <Link href="/auth/register" className="block">
                  <Button className="w-full h-14 text-sm font-bold tracking-[0.2em]">
                    CREATE ACCOUNT TO BOOK
                  </Button>
                </Link>
                <Link href="/auth/login" className="block">
                  <Button variant="ghost" className="w-full h-12 text-xs border border-white/10">
                    Already have an account? Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
