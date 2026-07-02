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
  const end   = event.endDate?.toDate?.() ?? (event.endDate ? new Date(event.endDate) : null);
  if (event.soldOut)                                                               return { label: 'Sold Out', color: '#5A7A65', bg: '#EAF5EF', pulse: false };
  if (end && isPast(end))                                                          return { label: 'Ended',    color: '#5A7A65', bg: '#EAF5EF', pulse: false };
  if (isToday(start) || (!isPast(start) && differenceInHours(start, new Date()) < 4))
                                                                                   return { label: 'LIVE NOW', color: '#FFFFFF', bg: '#00C853', pulse: true };
  if (isFuture(start))                                                             return { label: 'Upcoming', color: '#FFFFFF', bg: '#0EA5E9', pulse: false };
  return                                                                                { label: 'Scheduled', color: '#0EA5E9', bg: '#EAF5EF', pulse: false };
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

  return (
    <motion.article layout
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-white border border-[#D1E8DA] hover:border-[#00C853] hover:shadow-card-hover transition-all duration-500 flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={img} alt={event.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 60%)' }} />

        {/* Date badge */}
        <div className="absolute top-4 left-4 text-center px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-[#D1E8DA] shadow-card">
          <p className="font-display text-2xl text-[#0A1A10] leading-none">{format(startDate, 'd')}</p>
          <p className="text-[0.5rem] font-bold text-[#00C853] uppercase tracking-widest">{format(startDate, 'MMM').toUpperCase()}</p>
        </div>

        {/* Status */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest"
          style={{ color: status.color, backgroundColor: status.bg }}>
          {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          {status.label}
        </div>

        {event.category && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/90 border border-[#D1E8DA] text-[0.55rem] font-bold text-[#5A7A65] uppercase tracking-widest">
            {event.category}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3">
        <h3 className="font-display text-2xl text-[#0A1A10] uppercase tracking-wider leading-tight group-hover:text-[#00C853] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[0.65rem] text-[#5A7A65]">
            <Calendar size={11} className="text-[#00C853]" />
            <span>{format(startDate, 'EEEE, MMM d · h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-[0.65rem] text-[#5A7A65]">
              <MapPin size={11} className="text-[#0EA5E9]" />
              <span className="truncate">{event.venue}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-[0.7rem] text-[#5A7A65] leading-relaxed line-clamp-2 flex-1">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#EAF5EF] mt-auto">
          {event.price != null ? (
            <div>
              <p className="text-[0.5rem] text-[#5A7A65] uppercase">From</p>
              <p className="font-display text-xl text-[#00C853]">
                {event.price === 0 ? 'FREE' : `GHS ${Number(event.price).toLocaleString()}`}
              </p>
            </div>
          ) : <div />}

          {event.ticketLink ? (
            <a href={event.ticketLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #00C853, #0EA5E9)' }}>
              Get Tickets <ArrowRight size={11} />
            </a>
          ) : event.slug ? (
            <Link href={`/events/${event.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1E8DA] text-[#5A7A65] text-[0.6rem] font-bold uppercase tracking-widest hover:border-[#00C853] hover:text-[#00C853] transition-all">
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
    <main className="flex flex-col w-full min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=90" alt=""
            className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.97) 0%, rgba(10,26,16,0.65) 45%, rgba(0,0,0,0.15) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 40% 100%, rgba(0,200,83,0.20) 0%, transparent 55%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 lg:px-16 pb-16 space-y-4">
          <p className="text-[0.6rem] font-bold text-[#00C853] uppercase tracking-[0.35em]">Live &amp; Upcoming</p>
          <h1 className="font-display uppercase text-white leading-none"
            style={{ fontSize: 'clamp(4rem, 14vw, 14rem)' }}>
            EVENTS
          </h1>
          {!loading && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
              <p className="text-sm font-bold text-white/60">{events.length} events listed across Ghana</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FILTER BAR ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b-2 border-[#D1E8DA] shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
            {CATEGORIES.map(cat => {
              const count = counts[cat];
              if (cat !== 'All' && !count) return null;
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn('whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-widest transition-all shrink-0',
                    category === cat
                      ? 'bg-[#00C853] text-white shadow-glow-green'
                      : 'border border-[#D1E8DA] text-[#5A7A65] hover:border-[#00C853] hover:text-[#00C853] bg-white'
                  )}>
                  {cat}
                  {count != null && (
                    <span className={cn('text-[0.5rem] px-1.5 py-0.5 rounded-full font-bold',
                      category === cat ? 'bg-white/25 text-white' : 'bg-[#EAF5EF] text-[#5A7A65]')}>
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
                    className="w-full bg-[#F4FBF7] border border-[#D1E8DA] rounded-full px-4 h-9 text-xs text-[#0A1A10] placeholder:text-[#5A7A65]/50 focus:outline-none focus:border-[#00C853]" />
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#D1E8DA] text-[#5A7A65] hover:text-[#00C853] hover:border-[#00C853] transition-all bg-white">
              {searchOpen ? <X size={14} /> : <Search size={14} />}
            </button>
          </div>
        </div>

        {isFiltered && (
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 pb-3 flex items-center gap-3">
            <span className="text-[0.55rem] font-bold text-[#5A7A65] uppercase tracking-widest">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCategory('All'); setSearchQuery(''); setSearchOpen(false); }}
              className="flex items-center gap-1 text-[0.55rem] font-bold text-[#00C853] hover:text-[#007A33] uppercase tracking-widest transition-colors">
              <X size={10} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <section className="flex-1 py-12 lg:py-16 px-6 lg:px-16 bg-[#F4FBF7]">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[420px] rounded-2xl bg-[#EAF5EF] animate-pulse border border-[#D1E8DA]" />
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
                      <Music size={48} className="mx-auto text-[#D1E8DA]" />
                      <p className="font-display text-3xl text-[#D1E8DA] uppercase tracking-widest">
                        {isFiltered ? 'No Events Match' : 'No Events Yet'}
                      </p>
                      {isFiltered && (
                        <button onClick={() => { setCategory('All'); setSearchQuery(''); }}
                          className="text-[#00C853] text-sm hover:text-[#007A33] transition-colors font-bold">
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
      <section className="relative overflow-hidden border-t-2 border-[#D1E8DA] bg-white">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,200,83,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(14,165,233,0.06) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-16 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-[0.6rem] font-bold text-[#00C853] uppercase tracking-[0.35em]">For Organizers</p>
            <h2 className="font-display text-[#0A1A10] uppercase leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
              HOST YOUR EVENT<br />WITH ASTROWAVE
            </h2>
            <p className="text-[#5A7A65] text-base leading-relaxed max-w-md">
              List your event, access Ghana's top talent roster, and manage everything from one dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button className="flex items-center gap-3 h-14 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-white"
                  style={{ background: 'linear-gradient(135deg, #00C853, #0EA5E9)' }}>
                  GET IN TOUCH <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/platform">
                <button className="flex items-center gap-3 h-14 px-10 rounded-xl font-bold text-sm tracking-[0.2em] uppercase text-[#0EA5E9] border-2 border-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all">
                  EXPLORE PLATFORM <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap,      label: 'AI Matching',  sub: 'Find the right talent',     color: '#00C853' },
              { icon: Users,    label: 'Live Roster',  sub: 'Wave Score ranked artists', color: '#0EA5E9' },
              { icon: Calendar, label: 'Dashboard',    sub: 'Full event management',     color: '#00C853' },
              { icon: Play,     label: 'Real-Time',    sub: 'Instant booking flow',      color: '#0EA5E9' },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-[#D1E8DA] bg-[#F4FBF7] hover:border-[#00C853] hover:shadow-card transition-all space-y-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A1A10]">{item.label}</p>
                  <p className="text-[0.6rem] text-[#5A7A65] mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
