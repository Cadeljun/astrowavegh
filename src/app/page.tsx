'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Star, Users, Music, Mic,
  ChevronDown, Play, Shield, Clock, TrendingUp,
  Award, Globe, Sparkles, Calendar
} from 'lucide-react';
import {
  collection, query, where, orderBy,
  onSnapshot, limit, getCountFromServer
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCMSContent } from '@/lib/cms/useCMS';
import { getWaveRank } from '@/lib/algorithms/waveScore';
import { cn } from '@/lib/utils';

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || target === 0) return;
    const duration = 1600;
    const steps = 60;
    const increment = target / steps;
    let count = 0;
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(count));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{current}{suffix}</span>;
}

// ─── FEATURED TALENT CARD ────────────────────────────────────────────────────

function TalentSpotlight({ talent }: { talent: any }) {
  const rank = getWaveRank(talent.waveScore || 0);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] hover:border-white/12 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_rgba(168,85,247,0.06)]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={talent.photoURL || `https://picsum.photos/seed/${talent.id || 'talent'}/300/400`}
          alt={talent.stageName}
          className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F1F] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl text-white uppercase tracking-wider leading-tight">
              {talent.stageName}
            </p>
            <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2 py-1 rounded-full"
              style={{ color: rank.color, backgroundColor: `${rank.color}18`, border: `1px solid ${rank.color}30` }}>
              <Zap size={8} />{(talent.waveScore || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-[0.55rem] font-bold text-muted uppercase tracking-widest">{talent.category} · {talent.city}</p>
        </div>
      </div>
    </div>
  );
}

// ─── STATS BAR ───────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: { talents: number; events: number; bookings: number } }) {
  const items = [
    { label: 'Verified Talent', value: stats.talents, suffix: '+', icon: Users, color: '#FFD166' },
    { label: 'Events Hosted',   value: stats.events,   suffix: '+', icon: Calendar, color: '#A855F7' },
    { label: 'Bookings Made',   value: stats.bookings, suffix: '+', icon: Zap, color: '#06B6D4' },
    { label: 'Cities Covered',  value: 6,              suffix: '',  icon: Globe, color: '#00FF87' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="relative group bg-[#050D1A] p-8 flex flex-col gap-3 hover:bg-[#070F1F] transition-colors"
        >
          <item.icon size={18} style={{ color: item.color, opacity: 0.5 }} />
          <p className="font-display text-4xl lg:text-5xl text-white leading-none">
            <AnimatedNumber target={item.value} suffix={item.suffix} />
          </p>
          <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">{item.label}</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: item.color }} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── FEATURE CARDS ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: 'WAVE SCORE ALGORITHM',
    desc: 'Every artist is ranked by our proprietary AI score — combining ratings, gig count, and recency into a single trust index.',
    color: '#FFD166',
    href: '/platform',
    cta: 'See How It Works',
  },
  {
    icon: Users,
    title: 'VIBE SYNC MATCHING',
    desc: 'Post your event brief and our algorithm matches the perfect talent by location, category fit, and Wave Score instantly.',
    color: '#A855F7',
    href: '/platform',
    cta: 'Find Talent Now',
  },
  {
    icon: Shield,
    title: 'VERIFIED PROFESSIONALS',
    desc: 'Every performer on AstroWave is identity-verified, reviewed, and rated by real event organizers across Ghana.',
    color: '#06B6D4',
    href: '/about',
    cta: 'About Our Standards',
  },
  {
    icon: Star,
    title: 'REAL-TIME BOOKINGS',
    desc: 'Send booking requests, negotiate terms, confirm payments, and manage your full event roster — from one dashboard.',
    color: '#00FF87',
    href: '/platform',
    cta: 'Open Platform',
  },
];

// ─── MARQUEE ─────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = ['DJ', 'MC', 'LIVE BAND', 'HYPEMAN', 'VOCALIST', 'DANCER', 'COMEDIAN', 'POET', 'SAXOPHONIST', 'PERCUSSIONIST'];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden py-5 border-y border-white/5 bg-[#050D1A]">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050D1A] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050D1A] to-transparent z-10" />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex items-center gap-8 whitespace-nowrap"
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-[0.6rem] font-bold tracking-[0.35em] uppercase text-muted/40">
            {item}
            <span className="text-gold/30">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── RECENT EVENTS STRIP ─────────────────────────────────────────────────────

function RecentEvent({ event, index }: { event: any; index: number }) {
  const startDate = event.startDate?.toDate?.() ?? (event.startDate ? new Date(event.startDate) : null);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="group flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-[#070F1F] hover:border-white/12 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
        <img
          src={event.coverImage || `https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80`}
          alt={event.title}
          className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-base text-white uppercase tracking-wider truncate group-hover:text-gold transition-colors">
          {event.title}
        </p>
        <p className="text-[0.6rem] font-bold text-muted uppercase tracking-widest mt-0.5">
          {event.venue || 'TBA'} · {startDate ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(startDate) : 'TBA'}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-2 text-[0.55rem] font-bold text-purple uppercase tracking-widest">
        {event.category}
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const db = useFirestore();
  const { content } = useCMSContent('home');
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [stats, setStats]       = useState({ talents: 0, events: 0, bookings: 0 });
  const [talents, setTalents]   = useState<any[]>([]);
  const [events, setEvents]     = useState<any[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);

  // Live stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [t, e, b] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'platform_events')),
          getCountFromServer(collection(db, 'bookings')),
        ]);
        setStats({ talents: t.data().count, events: e.data().count, bookings: b.data().count });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [db]);

  // Featured talent (top 6 by wave score)
  useEffect(() => {
    const q = query(
      collection(db, 'talent_profiles'),
      where('active', '==', true),
      orderBy('waveScore', 'desc'),
      limit(6)
    );
    return onSnapshot(q, snap => setTalents(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, [db]);

  // Recent events (latest 4)
  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(4)
    );
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, [db]);

  return (
    <main className="flex flex-col w-full min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Parallax background */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
        </motion.div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '55px 55px' }}
        />

        {/* Radial glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple/5 blur-[120px] rounded-full z-0 pointer-events-none" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 lg:px-12 py-24">
          <div className="max-w-5xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <SectionLabel>Ghana's #1 Entertainment Platform</SectionLabel>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="font-display uppercase leading-[0.88] text-white"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 11rem)', letterSpacing: '0.01em' }}
            >
              RIDE THE
              <span
                className="block text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #FFD166 0%, #A855F7 100%)' }}
              >
                ASTROWAVE.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/45 text-lg lg:text-xl font-light leading-relaxed max-w-2xl"
            >
              {content?.hero?.subtitle ?? 'Connect Ghana\'s best DJs, MCs and live performers with the events that need them. Powered by AI. Trusted by thousands.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2"
            >
              <Link href="/platform">
                <Button size="lg" className="h-16 px-14 text-sm font-bold tracking-[0.25em] shadow-[0_0_50px_rgba(255,209,102,0.18)] hover:shadow-[0_0_70px_rgba(255,209,102,0.3)] transition-shadow">
                  FIND TALENT <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="ghost" size="lg" className="h-16 px-14 text-sm border border-white/12 hover:border-white/30 text-white">
                  JOIN AS ARTIST
                </Button>
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group"
              >
                <span className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center group-hover:border-gold/40 group-hover:bg-gold/5 transition-all">
                  <Play size={14} className="ml-0.5" />
                </span>
                Watch the reel
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {[
                { icon: Shield, text: 'Verified Artists' },
                { icon: Clock, text: '24hr Booking Response' },
                { icon: TrendingUp, text: 'Real-Time Matching' },
                { icon: Award, text: 'Wave Score Ranked' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[0.6rem] font-bold text-white/25 uppercase tracking-[0.2em]">
                  <Icon size={11} className="text-gold/60" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted/40"
        >
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.35em]">Scroll</span>
          <ChevronDown size={14} />
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-black py-16 lg:py-20 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <StatsBar stats={stats} />
        </div>
      </section>

      {/* ── FEATURED TALENT ──────────────────────────────────────────── */}
      <section className="bg-[#050D1A] py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <SectionLabel>Top Rated on AstroWave</SectionLabel>
              <h2 className="font-display text-white uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
                FEATURED TALENT
              </h2>
              <p className="text-white/40 text-sm max-w-md">The highest Wave Score performers on the platform right now.</p>
            </div>
            <Link href="/platform">
              <Button variant="ghost" className="border border-white/10 hover:border-gold/30 h-12 px-8 text-xs">
                Full Roster <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>

          {talents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {talents.map(t => <TalentSpotlight key={t.id} talent={t} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS / FEATURES ──────────────────────────────────── */}
      <section className="bg-black py-24 lg:py-32 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <SectionLabel className="justify-center">Why AstroWave</SectionLabel>
            <h2 className="font-display text-white uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
              BUILT DIFFERENT
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
              Not a directory. Not a marketplace. A living ecosystem where talent and opportunity find each other automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] p-8 flex flex-col gap-6 hover:border-white/10 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 0% 100%, ${f.color}08, transparent 60%)` }}
                />

                {/* Step number watermark */}
                <span className="absolute top-4 right-6 font-display text-[3.5rem] leading-none text-white/[0.03] select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10 space-y-5 flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}>
                    <f.icon size={22} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-display text-xl text-white uppercase tracking-wider">{f.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                  <Link href={f.href} className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-widest transition-colors"
                    style={{ color: f.color }}>
                    {f.cta} <ArrowRight size={11} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT EVENTS ────────────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="bg-[#050D1A] py-24 lg:py-32 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-screen-2xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <SectionLabel>Happening Now</SectionLabel>
                <h2 className="font-display text-white uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
                  RECENT EVENTS
                </h2>
              </div>
              <Link href="/events">
                <Button variant="ghost" className="border border-white/10 hover:border-gold/30 h-12 px-8 text-xs">
                  All Events <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev, i) => <RecentEvent key={ev.id} event={ev} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── DUAL CTA ─────────────────────────────────────────────────── */}
      <section className="bg-black py-24 lg:py-32 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organizer CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#070F1F] p-10 lg:p-14 flex flex-col justify-between gap-10 group hover:border-gold/15 transition-all duration-500"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="relative z-10 space-y-4">
              <SectionLabel>For Organizers</SectionLabel>
              <h3 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                PLANNING AN EVENT?
              </h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">
                Post your event brief and let AstroWave's matching engine find you the perfect talent — sorted, scored, and ready to book.
              </p>
            </div>
            <Link href="/auth/register" className="relative z-10">
              <Button size="lg" className="h-14 px-12 text-sm font-bold tracking-[0.2em] w-full sm:w-auto shadow-[0_0_40px_rgba(255,209,102,0.12)] hover:shadow-[0_0_60px_rgba(255,209,102,0.2)]">
                POST AN EVENT <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Talent CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#070F1F] p-10 lg:p-14 flex flex-col justify-between gap-10 group hover:border-purple/15 transition-all duration-500"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="relative z-10 space-y-4">
              <SectionLabel>For Performers</SectionLabel>
              <h3 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                ARE YOU A CREATIVE?
              </h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">
                Build your profile, earn your Wave Score, and get discovered by the organizers who need exactly your vibe — for free.
              </p>
            </div>
            <Link href="/auth/register" className="relative z-10">
              <Button variant="secondary" size="lg" className="h-14 px-12 text-sm font-bold tracking-[0.2em] w-full sm:w-auto border border-purple/30 text-purple hover:bg-purple hover:text-white transition-all">
                JOIN THE ROSTER <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── REEL MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#070F1F] flex items-center justify-center"
            >
              <div className="text-center space-y-4 p-12">
                <div className="w-20 h-20 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mx-auto">
                  <Play size={32} className="text-gold ml-1" />
                </div>
                <p className="font-display text-2xl text-white uppercase tracking-widest">Coming Soon</p>
                <p className="text-sm text-muted">The AstroWave showreel is in production.</p>
              </div>
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-white hover:border-white/25 transition-all"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
