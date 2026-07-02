'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Star, Users, Mic, ChevronDown, Play, Shield, Clock, Globe, Calendar } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, limit, getCountFromServer } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { getWaveRank } from '@/lib/algorithms/waveScore';
import { cn } from '@/lib/utils';

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || target === 0) return;
    const steps = 60;
    let count = 0;
    const timer = setInterval(() => {
      count += target / steps;
      if (count >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(count));
    }, 1600 / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{current}{suffix}</span>;
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = ['DJ SET', 'LIVE BAND', 'MC HYPE', 'AFROBEATS', 'HIGHLIFE',
  'AMAPIANO', 'SPOKEN WORD', 'COMEDIAN', 'DANCER', 'VOCALIST', 'SAXOPHONIST'];

function Marquee({ reverse = false, dark = false }: { reverse?: boolean; dark?: boolean }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden">
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex items-center whitespace-nowrap"
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={cn('px-6 py-1 font-display text-xl lg:text-2xl uppercase tracking-widest',
              dark ? 'text-white/90' : 'text-[#0A1A10]')}>
              {item}
            </span>
            <span className={cn('text-base', dark ? 'text-white/30' : 'text-[#00C853]')}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── TALENT CARD ─────────────────────────────────────────────────────────────
function TalentCard({ talent, index }: { talent: any; index: number }) {
  const rank = getWaveRank(talent.waveScore || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-500"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={talent.photoURL || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80`}
          alt={talent.stageName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A10] via-[#0A1A10]/20 to-transparent" />

        {/* Wave score */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white shadow-sm">
          <Zap size={10} className="text-[#00C853]" />
          <span className="font-display text-sm text-[#0A1A10]">{(talent.waveScore || 0).toFixed(1)}</span>
        </div>

        {talent.available && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00C853] border border-[#00C853]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Open</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-display text-2xl text-white uppercase tracking-wider leading-tight">
            {talent.stageName}
          </p>
          <p className="text-[0.6rem] font-bold text-white/60 uppercase tracking-widest mt-0.5">
            {talent.category} · {talent.city}
          </p>
        </div>

        {/* Green hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00C853]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

// ─── EVENT ROW ───────────────────────────────────────────────────────────────
function EventRow({ event, index }: { event: any; index: number }) {
  const startDate = event.startDate?.toDate?.() ?? (event.startDate ? new Date(event.startDate) : null);
  const month = startDate ? new Intl.DateTimeFormat('en', { month: 'short' }).format(startDate).toUpperCase() : '—';
  const day   = startDate ? startDate.getDate() : '—';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group flex items-center gap-6 py-5 border-b border-[#D1E8DA] hover:border-[#00C853] transition-all cursor-pointer hover:bg-[#F4FBF7] -mx-4 px-4 rounded-xl"
    >
      <div className="shrink-0 w-14 text-center">
        <p className="font-display text-3xl text-[#0A1A10] leading-none">{day}</p>
        <p className="text-[0.55rem] font-bold text-[#00C853] uppercase tracking-widest mt-0.5">{month}</p>
      </div>
      <div className="w-px h-10 bg-[#D1E8DA] shrink-0" />
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#D1E8DA]">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-xl lg:text-2xl text-[#0A1A10] uppercase tracking-wider truncate group-hover:text-[#00C853] transition-colors">
          {event.title}
        </p>
        <p className="text-[0.65rem] font-bold text-[#5A7A65] uppercase tracking-widest mt-0.5 truncate">
          {event.venue || 'TBA'}{event.city ? ` · ${event.city}` : ''}
        </p>
      </div>
      <div className="shrink-0 hidden md:block">
        <span className="px-4 py-1.5 rounded-full border border-[#D1E8DA] bg-[#F4FBF7] text-[0.6rem] font-bold text-[#5A7A65] uppercase tracking-widest">
          {event.category || 'Event'}
        </span>
      </div>
      <ArrowRight size={18} className="text-[#D1E8DA] group-hover:text-[#00C853] group-hover:translate-x-1 transition-all shrink-0" />
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const db = useFirestore();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const [stats, setStats]   = useState({ talents: 0, events: 0, bookings: 0 });
  const [talents, setTalents] = useState<any[]>([]);
  const [events, setEvents]   = useState<any[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [t, e, b] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'events')),
          getCountFromServer(collection(db, 'bookings')),
        ]);
        setStats({ talents: t.data().count, events: e.data().count, bookings: b.data().count });
      } catch {}
    }
    load();
  }, [db]);

  useEffect(() => {
    const q = query(collection(db, 'talent_profiles'), where('active', '==', true), orderBy('waveScore', 'desc'), limit(6));
    return onSnapshot(q, snap => setTalents(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, [db]);

  useEffect(() => {
    const q = query(collection(db, 'events'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(5));
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, [db]);

  return (
    <main className="flex flex-col w-full min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 scale-[1.15]">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=90"
            alt="" className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Dark bottom gradient */}
        <div className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.97) 0%, rgba(10,26,16,0.75) 35%, rgba(10,26,16,0.20) 75%, transparent 100%)' }} />
        {/* Green glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[400px] z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(0,200,83,0.18) 0%, transparent 65%)' }} />
        {/* Blue glow top-right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(14,165,233,0.14) 0%, transparent 60%)' }} />

        <motion.div style={{ y: textY }} className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 lg:px-16 pb-20 lg:pb-28">
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
              <span className="text-[0.65rem] font-bold text-[#00C853] uppercase tracking-[0.35em]">
                Ghana's #1 Entertainment Platform
              </span>
            </div>

            <h1 className="font-display uppercase leading-[0.85] text-white"
              style={{ fontSize: 'clamp(4rem, 13vw, 13rem)' }}>
              RIDE THE<br />
              <span style={{ WebkitTextStroke: '3px #00C853', color: 'transparent' }}>ASTRO</span>
              <span className="text-[#00C853]">WAVE.</span>
            </h1>

            <p className="text-white/60 text-lg lg:text-xl font-light leading-relaxed max-w-xl">
              AI-powered talent matching for Ghana's biggest events. DJs, MCs, live bands and performers — found, booked and rated in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/platform">
                <button className="flex items-center gap-3 h-16 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #00C853, #00FF87)', boxShadow: '0 0 40px rgba(0,200,83,0.4)' }}>
                  <Zap size={18} fill="currentColor" /> FIND TALENT
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="flex items-center gap-3 h-16 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-white border border-white/30 hover:border-[#00C853] hover:bg-[#00C853]/10 backdrop-blur-sm transition-all">
                  <Mic size={18} /> JOIN AS ARTIST
                </button>
              </Link>
              <button onClick={() => setVideoOpen(true)}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group">
                <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00C853]/50 transition-all">
                  <Play size={16} className="ml-0.5" />
                </span>
                Watch reel
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: Shield, text: 'Verified Artists' },
                { icon: Clock,  text: '24hr Response' },
                { icon: Globe,  text: '6 Cities' },
                { icon: Star,   text: 'Wave Score Ranked' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-[0.6rem] font-bold text-white/60 uppercase tracking-widest">
                  <Icon size={11} className="text-[#00C853]" /> {text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 right-12 z-10 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.35em]">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <div className="bg-[#00C853] py-4 overflow-hidden border-y-4 border-[#007A33]">
        <Marquee dark />
      </div>
      <div className="bg-[#EAF5EF] py-3 overflow-hidden border-b border-[#D1E8DA]">
        <Marquee reverse />
      </div>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#D1E8DA] rounded-2xl overflow-hidden border border-[#D1E8DA]">
            {[
              { label: 'Verified Talent', value: stats.talents, suffix: '+', color: '#00C853' },
              { label: 'Events Hosted',   value: stats.events,   suffix: '+', color: '#0EA5E9' },
              { label: 'Bookings Made',   value: stats.bookings, suffix: '+', color: '#00C853' },
              { label: 'Cities',          value: 6,              suffix: '',  color: '#0EA5E9' },
            ].map((s, i) => (
              <div key={s.label} className="bg-white p-10 text-center hover:bg-[#F4FBF7] transition-colors">
                <p className="font-display leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: s.color }}>
                  <AnimatedNumber target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[0.65rem] font-bold text-[#5A7A65] uppercase tracking-[0.25em] mt-3">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TALENT ──────────────────────────────────────────── */}
      <section className="bg-[#F4FBF7] py-20 lg:py-28 px-6 lg:px-16 border-t border-[#D1E8DA]">
        <div className="max-w-screen-2xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[0.6rem] font-bold text-[#00C853] uppercase tracking-[0.35em] mb-3">Top Ranked · Wave Score</p>
              <h2 className="font-display text-[#0A1A10] uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
                FEATURED<br />TALENT
              </h2>
            </div>
            <Link href="/platform">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#00C853] text-[#00C853] text-sm font-bold uppercase tracking-widest hover:bg-[#00C853] hover:text-white transition-all">
                Full Roster <ArrowRight size={15} />
              </button>
            </Link>
          </div>

          {talents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {talents.map((t, i) => <TalentCard key={t.id} talent={t} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-[#D1E8DA] animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING EVENTS ───────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 px-6 lg:px-16 border-t border-[#D1E8DA]">
        <div className="max-w-screen-2xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[0.6rem] font-bold text-[#0EA5E9] uppercase tracking-[0.35em] mb-3">Happening in Ghana</p>
              <h2 className="font-display text-[#0A1A10] uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
                UPCOMING<br />EVENTS
              </h2>
            </div>
            <Link href="/events">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#0EA5E9] text-[#0EA5E9] text-sm font-bold uppercase tracking-widest hover:bg-[#0EA5E9] hover:text-white transition-all">
                All Events <ArrowRight size={15} />
              </button>
            </Link>
          </div>

          <div>
            {events.length > 0
              ? events.map((ev, i) => <EventRow key={ev.id} event={ev} index={i} />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 my-2 rounded-xl bg-[#EAF5EF] animate-pulse" />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Organizer — green */}
        <div className="relative overflow-hidden flex items-end p-10 lg:p-16 min-h-[50vh]">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80" alt=""
              className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,100,40,0.95) 0%, rgba(0,100,40,0.6) 50%, rgba(0,0,0,0.2) 100%)' }} />
          </div>
          <div className="relative z-10 space-y-5">
            <p className="text-[0.6rem] font-bold text-[#00FF87] uppercase tracking-[0.3em]">For Organizers</p>
            <h3 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
              PLANNING<br />AN EVENT?
            </h3>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Post your brief and let our AI find the perfect talent — sorted by location, category, and Wave Score.
            </p>
            <Link href="/auth/register">
              <button className="flex items-center gap-3 h-14 px-8 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-[#0A1A10] mt-2"
                style={{ background: 'linear-gradient(135deg, #00FF87, #00C853)' }}>
                POST AN EVENT <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* Talent — blue */}
        <div className="relative overflow-hidden flex items-end p-10 lg:p-16 min-h-[50vh]">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80" alt=""
              className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,105,161,0.95) 0%, rgba(3,105,161,0.6) 50%, rgba(0,0,0,0.2) 100%)' }} />
          </div>
          <div className="relative z-10 space-y-5">
            <p className="text-[0.6rem] font-bold text-[#38BDF8] uppercase tracking-[0.3em]">For Performers</p>
            <h3 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
              ARE YOU<br />A CREATIVE?
            </h3>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Build your profile, earn your Wave Score, and get discovered by organizers across Ghana — for free.
            </p>
            <Link href="/auth/register">
              <button className="flex items-center gap-3 h-14 px-8 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-white border-2 border-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#0A1A10] transition-all mt-2">
                JOIN THE ROSTER <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── VIDEO MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setVideoOpen(false)}
              className="absolute inset-0 bg-[#0A1A10]/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-[#00C853]/20 bg-white flex items-center justify-center shadow-modal">
              <div className="text-center space-y-4 p-12">
                <div className="w-20 h-20 rounded-full border-2 border-[#00C853] bg-[#F4FBF7] flex items-center justify-center mx-auto">
                  <Play size={32} className="text-[#00C853] ml-1" />
                </div>
                <p className="font-display text-2xl text-[#0A1A10] uppercase tracking-widest">Coming Soon</p>
                <p className="text-sm text-[#5A7A65]">The AstroWave showreel is in production.</p>
              </div>
              <button onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full border border-[#D1E8DA] flex items-center justify-center text-[#5A7A65] hover:text-[#0A1A10] hover:border-[#00C853] transition-all">
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
