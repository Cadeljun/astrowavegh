'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, MapPin, Users, Clock, Tag,
  ArrowRight, ChevronDown, X, Loader2, Music,
  Mic, Sparkles, Filter, Star, Zap, Play
} from 'lucide-react';
import {
  collection, query, where, orderBy, onSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCMSContent } from '@/lib/cms/useCMS';
import { cn } from '@/lib/utils';
import { format, isPast, isFuture, isToday, differenceInHours } from 'date-fns';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getEventStatus(event: any): {
  label: string; color: string; bg: string; pulse?: boolean;
} {
  const start = event.startDate?.toDate?.() ?? new Date(event.startDate);
  const end   = event.endDate?.toDate?.()   ?? (event.endDate ? new Date(event.endDate) : null);

  if (event.soldOut)
    return { label: 'Sold Out',  color: '#6B8CAE', bg: 'rgba(107,140,174,0.10)' };
  if (end && isPast(end))
    return { label: 'Ended',     color: '#6B8CAE', bg: 'rgba(107,140,174,0.08)' };
  if (isToday(start) || (!isPast(start) && differenceInHours(start, new Date()) < 4))
    return { label: 'LIVE NOW',  color: '#00FF87', bg: 'rgba(0,255,135,0.12)', pulse: true };
  if (isFuture(start))
    return { label: 'Upcoming',  color: '#FFD166', bg: 'rgba(255,209,102,0.10)' };
  return       { label: 'Scheduled', color: '#A855F7', bg: 'rgba(168,85,247,0.10)' };
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  Concert:   'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
  Festival:  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  Club:      'https://images.unsplash.com/photo-1574786527860-f2e274867c99?w=800&q=80',
  Corporate: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
  Wedding:   'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
  default:   'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
};

function getFallback(category: string) {
  return CATEGORY_FALLBACKS[category] ?? CATEGORY_FALLBACKS.default;
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: any }) {
  const status    = getEventStatus(event);
  const imgSrc    = event.coverImage || getFallback(event.category);
  const startDate = event.startDate?.toDate?.() ?? new Date(event.startDate);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#070F1F] hover:border-white/12 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F1F] via-[#070F1F]/20 to-transparent" />

        {/* Category pill */}
        {event.category && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[0.55rem] font-bold uppercase tracking-widest text-white/70">
            {event.category}
          </div>
        )}

        {/* Status badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-[0.55rem] font-bold uppercase tracking-widest"
          style={{ color: status.color, backgroundColor: status.bg, borderColor: `${status.color}25` }}
        >
          {status.pulse && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
          )}
          {status.label}
        </div>

        {/* Ticket availability */}
        {event.ticketLink && !event.soldOut && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[0.55rem] font-bold text-green-400 uppercase tracking-widest backdrop-blur-md">
            Tickets Available
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div>
          <h3 className="font-display text-2xl uppercase tracking-wider text-white leading-tight group-hover:text-gold transition-colors duration-300 line-clamp-2">
            {event.title}
          </h3>
          {event.subtitle && (
            <p className="text-[0.65rem] font-medium text-muted/70 uppercase tracking-widest mt-0.5">{event.subtitle}</p>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[0.65rem] text-muted">
            <Calendar size={11} className="text-gold shrink-0" />
            <span>{format(startDate, 'EEE, MMM d · h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-[0.65rem] text-muted">
              <MapPin size={11} className="text-purple-400 shrink-0" />
              <span className="truncate">{event.venue}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
          {(event.capacity || event.attendees) && (
            <div className="flex items-center gap-2 text-[0.65rem] text-muted">
              <Users size={11} className="text-cyan-400 shrink-0" />
              <span>{event.attendees ?? 0} / {event.capacity ?? '∞'} attending</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-[0.7rem] text-muted/60 leading-relaxed line-clamp-2 flex-1">
            {event.description}
          </p>
        )}

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-full border border-white/8 bg-white/[0.03] text-[0.5rem] font-bold text-muted uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          {event.price != null ? (
            <div>
              <p className="text-[0.5rem] text-muted uppercase">From</p>
              <p className="font-display text-xl text-gold leading-tight">
                {event.price === 0 ? 'FREE' : `GHS ${Number(event.price).toLocaleString()}`}
              </p>
            </div>
          ) : <div />}

          {event.ticketLink ? (
            <a
              href={event.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all duration-200"
            >
              Get Tickets <ArrowRight size={11} />
            </a>
          ) : event.slug ? (
            <Link
              href={`/events/${event.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/60 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Details <ArrowRight size={11} />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full py-28 flex flex-col items-center gap-5 text-center"
    >
      <div className="w-20 h-20 rounded-full border border-white/8 bg-white/[0.03] flex items-center justify-center text-muted/30">
        {isFiltered ? <Filter size={28} /> : <Music size={28} />}
      </div>
      <div className="space-y-2">
        <p className="font-display text-2xl uppercase tracking-widest text-white/20">
          {isFiltered ? 'No Events Match' : 'No Events Yet'}
        </p>
        <p className="text-sm text-muted/40 max-w-xs">
          {isFiltered
            ? 'Try adjusting your filters or clear them to see all events.'
            : 'Check back soon — events are added regularly.'}
        </p>
      </div>
    </motion.div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ['All', 'Concert', 'Festival', 'Club', 'Corporate', 'Wedding', 'Private', 'Other'];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const db = useFirestore();
  const { content } = useCMSContent('events');

  const [events, setEvents]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [category, setCategory]       = useState('All');
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      snap => { setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      ()   => setLoading(false),
    );
    return unsub;
  }, [db]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: events.length };
    events.forEach(e => { if (e.category) counts[e.category] = (counts[e.category] || 0) + 1; });
    return counts;
  }, [events]);

  // Filtered list
  const filtered = useMemo(() => {
    let r = events;
    if (category !== 'All') r = r.filter(e => e.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return r;
  }, [events, category, searchQuery]);

  const isFiltered = category !== 'All' || searchQuery.trim().length > 0;

  return (
    <main className="flex flex-col w-full min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.12] scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        </div>
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-400/5 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 py-24 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <SectionLabel className="justify-center">Live &amp; Upcoming</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display uppercase text-white leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 9rem)' }}
          >
            EVENTS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-base max-w-lg mx-auto leading-relaxed"
          >
            {content?.hero?.subtitle ?? "Ghana's most vibrant concerts, festivals, club nights and private events — all in one place."}
          </motion.p>

          {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/8 text-[0.65rem] font-bold text-muted uppercase tracking-widest"
            >
              <Zap size={12} className="text-yellow-400" />
              {events.length} {events.length === 1 ? 'Event' : 'Events'} Listed
            </motion.div>
          )}
        </div>
      </section>

      {/* ── STICKY FILTER BAR ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#020B18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
            {ALL_CATEGORIES.map(cat => {
              const count = categoryCounts[cat];
              if (cat !== 'All' && !count) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full border text-[0.6rem] font-bold uppercase tracking-widest transition-all duration-200 shrink-0',
                    category === cat
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(255,209,102,0.25)]'
                      : 'bg-transparent text-muted border-white/10 hover:border-white/25 hover:text-white',
                  )}
                >
                  {cat}
                  {count != null && (
                    <span className={cn(
                      'text-[0.5rem] px-1.5 py-0.5 rounded-full font-bold',
                      category === cat ? 'bg-black/20 text-black' : 'bg-white/8 text-muted',
                    )}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events…"
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 h-9 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/40 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-muted hover:text-white hover:border-white/25 transition-all"
            >
              {searchOpen ? <X size={14} /> : <Search size={14} />}
            </button>
          </div>
        </div>

        {isFiltered && (
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-3 flex items-center gap-3">
            <span className="text-[0.55rem] font-bold text-muted uppercase tracking-widest">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { setCategory('All'); setSearchQuery(''); setSearchOpen(false); }}
              className="flex items-center gap-1 text-[0.55rem] font-bold text-yellow-400/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"
            >
              <X size={10} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ── EVENTS GRID ──────────────────────────────────────────────── */}
      <section className="flex-1 bg-[#020B18] py-12 lg:py-16 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[420px] rounded-2xl animate-pulse border border-white/5 bg-white/[0.03]" />
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.length > 0
                  ? filtered.map(ev => <EventCard key={ev.id} event={ev} />)
                  : <EmptyState key="empty" isFiltered={isFiltered} />}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── HOST CTA ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black border-t border-white/5 py-24 px-6 lg:px-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-yellow-400/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <SectionLabel>For Organizers</SectionLabel>
            <h2 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              HOST YOUR EVENT<br />WITH ASTROWAVE
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-md">
              {content?.cta?.description ?? 'List your event, access Ghana\'s top talent roster, and manage bookings — all from one dashboard.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="h-14 px-10 text-sm font-bold tracking-[0.2em]">
                  <Sparkles size={15} className="mr-2" /> GET IN TOUCH
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="ghost" size="lg" className="h-14 px-10 text-sm border border-white/10 hover:border-purple-400 hover:text-purple-400">
                  <Play size={15} className="mr-2" /> EXPLORE PLATFORM
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Zap,      label: 'AI Talent Matching', sub: 'Find the perfect performer',     color: '#FFD166' },
              { icon: Star,     label: 'Verified Roster',    sub: 'Wave Score rated artists',        color: '#A855F7' },
              { icon: Calendar, label: 'Event Dashboard',    sub: 'Manage everything in one place',  color: '#06B6D4' },
              { icon: Users,    label: 'Community Trust',    sub: 'Backed by real reviews',          color: '#00FF87' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-white/5 bg-[#070F1F] hover:border-white/10 transition-all space-y-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}12`, color: item.color }}
                >
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[0.6rem] text-muted mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </main>
  );
}
