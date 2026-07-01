'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ArrowRight, X, Zap, Play, Music, Filter } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useCMSContent } from '@/lib/cms/useCMS';
import { cn } from '@/lib/utils';
import { format, isPast, isFuture, isToday, differenceInHours } from 'date-fns';

function getStatus(event: any) {
  const start = event.startDate?.toDate?.() ?? new Date(event.startDate);
  const end   = event.endDate?.toDate?.()   ?? (event.endDate ? new Date(event.endDate) : null);
  if (event.soldOut)                                                      return { label: 'Sold Out', color: '#6B8CAE', pulse: false };
  if (end && isPast(end))                                                  return { label: 'Ended',    color: '#6B8CAE', pulse: false };
  if (isToday(start) || (!isPast(start) && differenceInHours(start, new Date()) < 4))
                                                                           return { label: 'LIVE NOW', color: '#00FF87', pulse: true };
  if (isFuture(start))                                                     return { label: 'Upcoming', color: '#FFD166', pulse: false };
  return                                                                         { label: 'Scheduled', color: '#A855F7', pulse: false };
}

const FALLBACKS: Record<string, string> = {
  Concert:   'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
  Festival:  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  Club:      'https://images.unsplash.com/photo-1574786527860-f2e274867c99?w=800&q=80',
  Corporate: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
  Wedding:   'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
  default:   'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
};

function EventCard({ event }: { event: any }) {
  const status    = getStatus(event);
  const img       = event.coverImage || FALLBACKS[event.category] || FALLBACKS.default;
  const startDate = event.startDate?.toDate?.() ?? new Date(event.startDate);
  const month     = format(startDate, 'MMM').toUpperCase();
  const day       = format(startDate, 'd');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-[#080818] border border-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img src={img} alt={event.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080818 0%, rgba(8,8,24,0.2) 60%, transparent 100%)' }} />

        {/* Date badge */}
        <div className="absolute top-4 left-4 text-center px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
          <p className="font-display text-2xl text-white leading-none">{day}</p>
          <p className="text-[0.5rem] font-bold text-[#FFD166] uppercase tracking-widest">{month}</p>
        </div>

        {/* Status */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-[0.55rem] font-bold uppercase tracking-widest"
          style={{ color: status.color, backgroundColor: `${status.color}18`, borderColor: `${status.color}30` }}>
          {status.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />}
          {status.label}
        </div>

        {/* Category */}
        {event.category && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[0.55rem] font-bold text-white/60 uppercase tracking-widest">
            {event.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <h3 className="font-display text-2xl text-white uppercase tracking-wider leading-tight group-hover:text-[#FFD166] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[0.65rem] text-white/40">
            <Calendar size={11} className="text-[#FFD166]" />
            <span>{format(startDate, 'EEEE, MMM d · h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-[0.65rem] text-white/40">
              <MapPin size={11} className="text-[#A855F7]" />
              <span className="truncate">{event.venue}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-[0.7rem] text-white/30 leading-relaxed line-clamp-2 flex-1">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
          {event.price != null ? (
            <div>
              <p className="text-[0.5rem] text-white/30 uppercase">From</p>
              <p className="font-display text-xl text-[#FFD166]">
                {event.price === 0 ? 'FREE' : `GHS ${Number(event.price).toLocaleString()}`}
              </p>
            </div>
          ) : <div />}

          {event.ticketLink ? (
            <a href={event.ticketLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest text-black transition-all"
              style={{ background: 'linear-gradient(135deg, #FFD166, #F59E0B)' }}>
              Get Tickets <ArrowRight size={11} />
            </a>
          ) : event.slug ? (
            <Link href={`/events/${event.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/50 text-[0.6rem] font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all">
              Details <ArrowRight size={11} />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

const CATEGORIES = ['All', 'Concert', 'Festival', 'Club', 'Corporate', 'Wedding', 'Private', 'Other'];

export default function EventsPage() {
  const db = useFirestore();
  const { content } = useCMSContent('events');
  const [events, setEvents]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [category, setCategory]       = useState('All');
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), where('active', '==', true), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => { setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }, () => setLoading(false));
  }, [db]);

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50); }, [searchOpen]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: events.length };
    events.forEach(e => { if (e.category) c[e.category] = (c[e.category] || 0) + 1; });
    return c;
  }, [events]);

  const filtered = useMemo(() => {
    let r = events;
    if (category !== 'All') r = r.filter(e => e.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(e => e.title?.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q) || e.city?.toLowerCase().includes(q));
    }
    return r;
  }, [events, category, searchQuery]);

  const isFiltered = category !== 'All' || searchQuery.trim().length > 0;

  return (
    <main className="flex flex-col w-full min-h-screen bg-black">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=90" alt=""
            className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 lg:px-16 pb-16 space-y-4">
          <p className="text-[0.6rem] font-bold text-[#A855F7] uppercase tracking-[0.35em]">Live &amp; Upcoming</p>
          <h1 className="font-display uppercase text-white leading-none"
            style={{ fontSize: 'clamp(4rem, 14vw, 14rem)', textShadow: '0 4px 80px rgba(0,0,0,0.6)' }}>
            EVENTS
          </h1>
          {!loading && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
              <p className="text-sm font-bold text-white/50">{events.length} events listed across Ghana</p>
            </div>
          )}
        </div>
      </section>

      {/* ── STICKY FILTER BAR ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
            {CATEGORIES.map(cat => {
              const count = counts[cat];
              if (cat !== 'All' && !count) return null;
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn('whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-widest transition-all shrink-0',
                    category === cat
                      ? 'bg-[#FFD166] text-black shadow-[0_0_20px_rgba(255,209,102,0.3)]'
                      : 'border border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                  )}>
                  {cat}
                  {count != null && (
                    <span className={cn('text-[0.5rem] px-1.5 py-0.5 rounded-full font-bold',
                      category === cat ? 'bg-black/20 text-black' : 'bg-white/8 text-white/30')}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden">
                  <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events…"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-full px-4 h-9 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD166]/40" />
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all">
              {searchOpen ? <X size={14} /> : <Search size={14} />}
            </button>
          </div>
        </div>

        {isFiltered && (
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 pb-3 flex items-center gap-3">
            <span className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCategory('All'); setSearchQuery(''); setSearchOpen(false); }}
              className="flex items-center gap-1 text-[0.55rem] font-bold text-[#FFD166]/60 hover:text-[#FFD166] uppercase tracking-widest transition-colors">
              <X size={10} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <section className="flex-1 py-12 lg:py-16 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[420px] rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.length > 0
                  ? filtered.map(ev => <EventCard key={ev.id} event={ev} />)
                  : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="col-span-full py-32 text-center space-y-4">
                      <Music size={48} className="mx-auto text-white/10" />
                      <p className="font-display text-3xl text-white/15 uppercase tracking-widest">
                        {isFiltered ? 'No Events Match' : 'No Events Yet'}
                      </p>
                      {isFiltered && (
                        <button onClick={() => { setCategory('All'); setSearchQuery(''); }}
                          className="text-[#FFD166]/50 text-sm hover:text-[#FFD166] transition-colors">
                          Clear filters
                        </button>
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── HOST CTA ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.06]" style={{ background: '#080818' }}>
        <div className="absolute inset-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=80" alt=""
            className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #080818 0%, rgba(8,8,24,0.8) 50%, #080818 100%)' }} />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-16 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-[0.6rem] font-bold text-[#FFD166] uppercase tracking-[0.35em]">For Organizers</p>
            <h2 className="font-display text-white uppercase leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
              HOST YOUR EVENT<br />WITH ASTROWAVE
            </h2>
            <p className="text-white/40 text-base leading-relaxed max-w-md">
              List your event, access Ghana's top talent roster, and manage everything from one dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button className="flex items-center gap-3 h-14 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-black"
                  style={{ background: 'linear-gradient(135deg, #FFD166, #F59E0B)' }}>
                  GET IN TOUCH <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/platform">
                <button className="flex items-center gap-3 h-14 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-white border border-white/15 hover:border-[#A855F7]/50 hover:text-[#A855F7] transition-all">
                  EXPLORE PLATFORM <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap,      label: 'AI Matching',   sub: 'Find the right talent',       color: '#FFD166' },
              { icon: Users,    label: 'Live Roster',   sub: 'Wave Score ranked artists',   color: '#A855F7' },
              { icon: Calendar, label: 'Dashboard',     sub: 'Full event management',       color: '#06B6D4' },
              { icon: Play,     label: 'Real-Time',     sub: 'Instant booking flow',        color: '#00FF87' },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[0.6rem] text-white/30 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
