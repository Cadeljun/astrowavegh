'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Globe2,
  Mic2,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { getWaveRank } from '@/lib/algorithms/waveScore';
import { cn } from '@/lib/utils';
import { useCMSContent } from '@/lib/cms/useCMS';

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || target === 0) return;
    const steps = 60;
    let count = 0;
    const timer = window.setInterval(() => {
      count += target / steps;
      if (count >= target) {
        setCurrent(target);
        window.clearInterval(timer);
      } else {
        setCurrent(Math.floor(count));
      }
    }, 1200 / steps);
    return () => window.clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{current.toLocaleString()}{suffix}</span>;
}

const MARQUEE_ITEMS = [
  'DJ SET',
  'LIVE BAND',
  'MC HYPE',
  'AFROBEATS',
  'HIGHLIFE',
  'AMAPIANO',
  'SPOKEN WORD',
  'COMEDIAN',
  'DANCER',
  'VOCALIST',
  'SAXOPHONIST',
];

function Marquee({ reverse = false, dark = false, items = MARQUEE_ITEMS }: { reverse?: boolean; dark?: boolean; items?: string[] }) {
  const displayItems = [...items, ...items];
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex w-max items-center whitespace-nowrap"
      >
        {displayItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center">
            <span className={cn(
              'px-5 font-display text-[0.95rem] uppercase tracking-[0.18em] sm:px-7 sm:text-lg',
              dark ? 'text-[#F7F4EC]/90' : 'text-[#10231D]',
            )}>
              {item}
            </span>
            <span className={cn('text-xs', dark ? 'text-[#C7FF51]' : 'text-[#879781]')}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function SectionKicker({ children, tone = 'lime' }: { children: React.ReactNode; tone?: 'lime' | 'dark' | 'cream' }) {
  return (
    <p className={cn(
      'mb-4 flex items-center gap-3 text-[0.63rem] font-bold uppercase tracking-[0.28em]',
      tone === 'lime' && 'text-[#6D8A27]',
      tone === 'dark' && 'text-[#C7FF51]',
      tone === 'cream' && 'text-[#C7FF51]',
    )}>
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}

function TalentCard({ talent, index }: { talent: any; index: number }) {
  const rank = getWaveRank(talent.waveScore || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.55 }}
      className="group relative overflow-hidden rounded-[1.5rem] bg-[#13231D] shadow-[0_18px_55px_rgba(16,35,29,0.12)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={talent.photoURL || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=85'}
          alt={talent.stageName || 'AstroWave talent'}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110D] via-[#07110D]/15 to-transparent" />
        <div className="absolute inset-0 bg-[#C7FF51]/10 opacity-0 transition duration-500 group-hover:opacity-100" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-[#07110D]/45 px-3 py-1.5 text-[0.56rem] font-bold uppercase tracking-[0.15em] text-white/85 backdrop-blur-md">
            <span className={cn('h-1.5 w-1.5 rounded-full', talent.available ? 'bg-[#C7FF51]' : 'bg-white/40')} />
            {talent.available ? 'Open to book' : 'In rotation'}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F7F4EC] px-2.5 py-1.5 text-xs font-bold text-[#10231D]">
            <Zap size={11} className="text-[#849F28]" fill="currentColor" />
            {(talent.waveScore || 0).toFixed(1)}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-display text-2xl uppercase leading-none tracking-[0.02em] text-white sm:text-3xl">
            {talent.stageName || 'Featured creative'}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-[0.59rem] font-bold uppercase tracking-[0.15em] text-white/60">
            <span className="truncate">{talent.category || 'Live act'} · {talent.city || 'Ghana'}</span>
            <span className="shrink-0 text-[#C7FF51]">{rank.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EventRow({ event, index }: { event: any; index: number }) {
  const startDate = event.startDate?.toDate?.() ?? (event.startDate ? new Date(event.startDate) : null);
  const month = startDate ? new Intl.DateTimeFormat('en', { month: 'short' }).format(startDate).toUpperCase() : '—';
  const day = startDate ? startDate.getDate() : '—';

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group flex items-center gap-4 border-b border-white/10 py-5 transition-colors hover:border-[#C7FF51]/50 sm:gap-6"
    >
      <div className="w-12 shrink-0 text-center sm:w-16">
        <p className="font-display text-3xl leading-none text-[#F7F4EC] sm:text-4xl">{day}</p>
        <p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.2em] text-[#C7FF51]">{month}</p>
      </div>
      <div className="h-10 w-px shrink-0 bg-white/15" />
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-14 sm:w-14">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=240&q=85'}
          alt={event.title || 'AstroWave event'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg uppercase tracking-[0.03em] text-[#F7F4EC] transition-colors group-hover:text-[#C7FF51] sm:text-2xl">
          {event.title || 'Live experience'}
        </p>
        <p className="mt-1 truncate text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/45">
          {event.venue || 'Venue TBA'}{event.city ? ` · ${event.city}` : ''}
        </p>
      </div>
      <span className="hidden shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[0.56rem] font-bold uppercase tracking-[0.16em] text-white/55 md:inline-flex">
        {event.category || 'Event'}
      </span>
      <ArrowUpRight size={17} className="shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C7FF51]" />
    </motion.div>
  );
}

export default function HomePage() {
  const db = useFirestore();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  const { content: heroContent } = useCMSContent('home', 'hero', {
    label: "Ghana's creative signal",
    heading: 'VIBES BEYOND THE HORIZON',
    subtext: 'AI-powered talent matching for the nights, stages and stories that move Ghana forward.',
  });
  const { content: marqueeContent } = useCMSContent('home', 'marquee', {
    items: 'DJ SET, LIVE BAND, MC HYPE, AFROBEATS, HIGHLIFE, AMAPIANO, SPOKEN WORD, COMEDIAN, DANCER, VOCALIST, SAXOPHONIST',
  });
  const { content: ctaContent } = useCMSContent('home', 'cta', {
    organizerHeading: 'PLANNING AN EVENT?',
    organizerText: 'Post your brief and let our matching engine find the right energy for the room.',
    talentHeading: 'ARE YOU A CREATIVE?',
    talentText: 'Build your profile, earn your Wave Score and get discovered by the people shaping the next big night.',
  });

  const [stats, setStats] = useState({ talents: 0, events: 0, bookings: 0 });
  const [talents, setTalents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);
  const marqueeItems = (marqueeContent.items || '').split(',').map((item: string) => item.trim()).filter(Boolean);

  useEffect(() => {
    async function load() {
      try {
        const [talentCount, eventCount, bookingCount] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'events')),
          getCountFromServer(collection(db, 'bookings')),
        ]);
        setStats({ talents: talentCount.data().count, events: eventCount.data().count, bookings: bookingCount.data().count });
      } catch {
        // The live counters are intentionally quiet when the public data source is unavailable.
      }
    }
    load();
  }, [db]);

  useEffect(() => {
    const talentQuery = query(collection(db, 'talent_profiles'), where('active', '==', true), orderBy('waveScore', 'desc'), limit(6));
    return onSnapshot(talentQuery, snapshot => setTalents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), () => {});
  }, [db]);

  useEffect(() => {
    const eventQuery = query(collection(db, 'events'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(5));
    return onSnapshot(eventQuery, snapshot => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), () => {});
  }, [db]);

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#F7F4EC] text-[#10231D]">
      <section ref={heroRef} className="relative flex min-h-[min(860px,94svh)] items-center overflow-hidden bg-[#07110D]">
        <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.12]">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=2200&q=90"
            alt="Crowd moving under concert lights"
            className="h-full w-full object-cover object-center opacity-55"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,13,0.97)_0%,rgba(7,17,13,0.8)_38%,rgba(7,17,13,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(199,255,81,0.16),transparent_28%)]" />
        <div className="hero-grid absolute inset-0 opacity-25" />

        <motion.div style={{ y: textY }} className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 pt-28 sm:px-10 lg:px-16 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.65fr)] lg:gap-20">
            <div className="max-w-3xl">
              <div className="mb-8 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[#C7FF51]">
                <span className="h-2 w-2 rounded-full bg-[#C7FF51] shadow-[0_0_18px_rgba(199,255,81,0.8)]" />
                {heroContent.label}
              </div>
              <h1 className="max-w-4xl font-display text-[clamp(3.9rem,9vw,8.5rem)] uppercase leading-[0.84] tracking-[-0.055em] text-[#F7F4EC]">
                Find the<br />
                <span className="text-[#C7FF51]">energy</span><br />
                that moves<br />
                the room.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                {heroContent.subtext}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/platform" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#C7FF51] px-7 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:bg-[#F2FFC8] active:scale-[0.98]">
                  Explore the roster
                  <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/auth/register" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/25 px-7 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-white transition hover:border-[#C7FF51] hover:bg-white/10 active:scale-[0.98]">
                  Plan an event
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/45">
                <span className="flex items-center gap-2"><ShieldCheck size={13} className="text-[#C7FF51]" /> Verified talent</span>
                <span className="flex items-center gap-2"><Clock3 size={13} className="text-[#C7FF51]" /> 24hr response</span>
                <span className="flex items-center gap-2"><Globe2 size={13} className="text-[#C7FF51]" /> Accra → Ghana</span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="ml-auto max-w-[360px] rotate-2 rounded-[2rem] border border-white/15 bg-[#10231D]/65 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[1.35rem] bg-[#142B23]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&q=85" alt="Performer under stage light" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07110D] via-transparent to-[#07110D]/20" />
                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                      <span className="rounded-full bg-[#C7FF51] px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D]">Live signal</span>
                      <Sparkles size={18} className="text-[#C7FF51]" />
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-white/50">Tonight · Accra</p>
                      <p className="mt-2 font-display text-4xl uppercase leading-none tracking-tight text-white">Make it<br /><span className="text-[#C7FF51]">unmissable.</span></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-white/10">
                    <div className="bg-[#10231D] p-4"><p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-white/40">Wave score</p><p className="mt-1 font-display text-2xl text-white">98.4</p></div>
                    <div className="bg-[#10231D] p-4"><p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-white/40">Vibe match</p><p className="mt-1 font-display text-2xl text-[#C7FF51]">94%</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-7 left-6 z-10 flex items-center gap-3 text-[0.55rem] font-bold uppercase tracking-[0.28em] text-white/35 sm:left-10 lg:left-16">
          <span className="h-px w-12 bg-white/25" />
          Accra / 05°33′N 00°12′W
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-7 right-6 z-10 flex items-center gap-2 text-[0.55rem] font-bold uppercase tracking-[0.28em] text-white/35 sm:right-10 lg:right-16">
          Scroll to explore <ChevronDown size={14} />
        </motion.div>
      </section>

      <div className="border-y border-[#C7FF51]/25 bg-[#10231D] py-4"><Marquee dark items={marqueeItems} /></div>

      <section className="mx-auto grid w-full max-w-[1440px] gap-14 px-6 py-24 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-16 lg:py-32">
        <div>
          <SectionKicker>More than a marketplace</SectionKicker>
          <h2 className="max-w-xl font-display text-[clamp(3rem,6vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.04em] text-[#10231D]">
            The city<br /><span className="text-[#849F28]">is the stage.</span>
          </h2>
        </div>
        <div className="max-w-xl self-end">
          <p className="text-xl leading-8 text-[#354B40] sm:text-2xl sm:leading-9">AstroWave connects the people who create the atmosphere with the people who know exactly how they want to feel.</p>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#68786C]">From a first dance to a sold-out rooftop, discover trusted Ghanaian talent, share a brief, and let the right energy find you.</p>
          <Link href="/about" className="group mt-8 inline-flex items-center gap-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#10231D]">
            Our point of view <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#10231D]/20 transition group-hover:bg-[#10231D] group-hover:text-[#F7F4EC]"><ArrowUpRight size={15} /></span>
          </Link>
        </div>
      </section>

      <section className="border-y border-[#D8D8C9] bg-[#ECE9DF] px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#CFCFC0] bg-[#CFCFC0] lg:grid-cols-4">
          {[
            { label: 'Verified talent', value: stats.talents, suffix: '+', icon: Users },
            { label: 'Events in motion', value: stats.events, suffix: '+', icon: CalendarDays },
            { label: 'Successful bookings', value: stats.bookings, suffix: '+', icon: Star },
            { label: 'Cities connected', value: 6, suffix: '', icon: Globe2 },
          ].map(({ label, value, suffix, icon: Icon }) => (
            <div key={label} className="bg-[#F7F4EC] p-7 transition hover:bg-white sm:p-10">
              <Icon size={17} className="text-[#849F28]" />
              <p className="mt-8 font-display text-5xl leading-none tracking-[-0.04em] text-[#10231D] sm:text-6xl"><AnimatedNumber target={value} suffix={suffix} /></p>
              <p className="mt-3 max-w-[120px] text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#778279]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mb-12 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <SectionKicker>Ranked by the wave</SectionKicker>
            <h2 className="font-display text-[clamp(3rem,6vw,6.5rem)] uppercase leading-[0.86] tracking-[-0.04em] text-[#10231D]">Featured<br /><span className="text-[#849F28]">talent.</span></h2>
          </div>
          <Link href="/platform" className="group inline-flex items-center gap-3 self-start rounded-full border border-[#10231D]/20 px-5 py-3 text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:border-[#10231D] hover:bg-[#10231D] hover:text-[#F7F4EC] md:self-end">
            Explore full roster <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        {talents.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">{talents.map((talent, index) => <TalentCard key={talent.id} talent={talent} index={index} />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-[1.5rem] bg-[#E0DED3]" />)}</div>
        )}
      </section>

      <section className="bg-[#10231D] px-6 py-24 text-[#F7F4EC] sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <SectionKicker tone="dark">The live calendar</SectionKicker>
            <h2 className="font-display text-[clamp(3rem,6vw,6.5rem)] uppercase leading-[0.86] tracking-[-0.04em]">Be there<br /><span className="text-[#C7FF51]">when it happens.</span></h2>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/50">Find the rooms, rooftops and late-night rituals shaping the next chapter of Ghanaian culture.</p>
            <Link href="/events" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#C7FF51] px-5 py-3 text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:bg-[#F2FFC8]">
              View all events <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div>
            {events.length > 0 ? events.map((event, index) => <EventRow key={event.id} event={event} index={index} />) : Array.from({ length: 4 }).map((_, index) => <div key={index} className="my-2 h-[82px] animate-pulse rounded-xl bg-white/5" />)}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[560px] overflow-hidden bg-[#C7FF51] p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[1px] border-[#10231D]/15" />
          <div className="absolute -right-2 -top-2 h-36 w-36 rounded-full border-[1px] border-[#10231D]/15" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-[#10231D]/55"><span>01 / Organizers</span><Mic2 size={18} /></div>
            <div className="mt-24 max-w-lg lg:mt-32">
              <h3 className="font-display text-[clamp(3rem,5vw,5.4rem)] uppercase leading-[0.86] tracking-[-0.04em] text-[#10231D]">{ctaContent.organizerHeading}</h3>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#10231D]/65">{ctaContent.organizerText}</p>
              <Link href="/auth/register" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#10231D] px-6 py-4 text-[0.67rem] font-extrabold uppercase tracking-[0.16em] text-[#C7FF51] transition hover:bg-[#21392E]">Start a brief <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
        <div className="relative min-h-[560px] overflow-hidden bg-[#E4DED1] p-8 sm:p-12 lg:p-16">
          <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=85" alt="Performer on stage" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#E4DED1] via-[#E4DED1]/80 to-[#E4DED1]/35" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-[#10231D]/55"><span>02 / Creatives</span><Sparkles size={18} /></div>
            <div className="mt-24 max-w-lg lg:mt-32">
              <h3 className="font-display text-[clamp(3rem,5vw,5.4rem)] uppercase leading-[0.86] tracking-[-0.04em] text-[#10231D]">{ctaContent.talentHeading}</h3>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#10231D]/65">{ctaContent.talentText}</p>
              <Link href="/auth/register" className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#10231D]/30 px-6 py-4 text-[0.67rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:bg-[#10231D] hover:text-[#F7F4EC]">Join the roster <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F4EC] px-6 py-20 text-center sm:px-10 lg:px-16 lg:py-28">
        <SectionKicker>Stay in the signal</SectionKicker>
        <h2 className="mx-auto max-w-3xl font-display text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.84] tracking-[-0.05em] text-[#10231D]">Your next<br /><span className="text-[#849F28]">great night</span> starts here.</h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/platform" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#10231D] px-7 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#F7F4EC] transition hover:bg-[#29483A]">Discover AstroWave <ArrowUpRight size={16} /></Link>
          <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex h-14 items-center gap-3 rounded-full border border-[#10231D]/20 px-7 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:border-[#10231D]"><Play size={15} fill="currentColor" /> Watch the signal</button>
        </div>
      </section>

      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-[9000] flex items-center justify-center p-5 sm:p-8">
            <motion.button type="button" aria-label="Close showreel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVideoOpen(false)} className="absolute inset-0 cursor-default bg-[#07110D]/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#F7F4EC] shadow-2xl">
              <div className="flex aspect-video items-center justify-center bg-[#10231D] p-8 text-center sm:p-16">
                <div><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#C7FF51]/50 bg-[#C7FF51]/10 text-[#C7FF51]"><Play size={27} fill="currentColor" /></div><p className="mt-6 font-display text-3xl uppercase tracking-[0.04em] text-[#F7F4EC]">Coming soon</p><p className="mt-2 text-sm text-white/45">The AstroWave showreel is in production.</p></div>
              </div>
              <button type="button" onClick={() => setVideoOpen(false)} aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#07110D]/40 text-white transition hover:bg-[#C7FF51] hover:text-[#10231D]"><X size={18} /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
