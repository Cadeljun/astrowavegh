'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  Calendar, 
  Zap, 
  Star, 
  Check, 
  Award, 
  ArrowRight, 
  ChevronDown, 
  Loader2,
  Info,
  Clock,
  ShieldCheck
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

// ─── PARTICLE SYSTEM ─────────────────

const ParticleBackground = () => {
  const particles = useMemo(() => Array.from({ length: 25 }), []);
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            backgroundColor: i % 2 === 0 ? 'var(--color-gold)' : 'var(--color-purple)',
            left: Math.random() * 100 + '%',
            top: '110%',
          }}
          animate={{
            y: ['0%', '-120vh'],
            x: [0, (Math.random() - 0.5) * 200 + 'px'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// ─── CATEGORY DATA ───────────────────

const TALENT_CATEGORIES = [
  { emoji: '🎵', name: 'DJ', desc: 'Music & mixing' },
  { emoji: '🎤', name: 'MC', desc: 'Master of ceremonies' },
  { emoji: '🙌', name: 'Hypeman', desc: 'Energy & crowd control' },
  { emoji: '🎶', name: 'Singer', desc: 'Live vocal performance' },
  { emoji: '💃', name: 'Dancer', desc: 'Dance entertainment' },
  { emoji: '😂', name: 'Comedian', desc: 'Comedy & laughs' },
  { emoji: '🎸', name: 'Band', desc: 'Full band experience' },
  { emoji: '✨', name: 'Other', desc: 'Unique talent types' },
];

export default function PlatformLandingPage() {
  const [stats, setStats] = useState({ talents: 0, events: 0, bookings: 0 });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [featuredTalent, setFeaturedTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Wave Score Demo State
  const [demoRating, setDemoRating] = useState(4.5);
  const [demoEvents, setDemoEvents] = useState(12);
  const [demoRecency, setDemoRecency] = useState(1.0);

  const demoScore = useMemo(() => {
    // Formula: WS = [(Rating÷5) × 0.6] + [Min(Events÷20, 1) × 0.2] + (Recency × 0.2) × 5
    const breakdown = calculateWaveScore(demoRating, demoEvents, new Date(Date.now() - (1.0 - demoRecency) * 90 * 24 * 60 * 60 * 1000));
    return breakdown;
  }, [demoRating, demoEvents, demoRecency]);

  const demoRank = getWaveRank(demoScore.waveScore);

  useEffect(() => {
    async function loadData() {
      try {
        const talentSnap = await getCountFromServer(collection(db, 'talent_profiles'));
        const eventSnap = await getCountFromServer(collection(db, 'platform_events'));
        const bookingSnap = await getCountFromServer(collection(db, 'bookings'));
        
        setStats({
          talents: talentSnap.data().count || 42,
          events: eventSnap.data().count || 128,
          bookings: bookingSnap.data().count || 85
        });

        const featQuery = query(
          collection(db, 'talent_profiles'),
          where('active', '==', true),
          orderBy('waveScore', 'desc'),
          limit(6)
        );
        const featSnap = await getDocs(featQuery);
        setFeaturedTalent(featSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Get category counts
        const counts: Record<string, number> = {};
        for (const cat of TALENT_CATEGORIES) {
          const q = query(collection(db, 'talent_profiles'), where('category', '==', cat.name));
          const snap = await getCountFromServer(q);
          counts[cat.name] = snap.data().count;
        }
        setCategoryCounts(counts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black px-6">
        <ParticleBackground />
        
        <div className="relative z-10 text-center max-w-5xl space-y-8">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[0.7rem] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Now Live in Ghana
            </div>
          </motion.div>

          <motion.h1 
            variants={heroTextReveal} 
            initial="hidden" 
            animate="show"
            className="display-2xl leading-none"
          >
            FIND THE PERFECT<br />
            TALENT FOR YOUR<br />
            <span className="text-gold text-glow-gold">EVENT.</span>
          </motion.h1>

          <motion.p 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.8 }}
            className="body-lg text-muted max-w-2xl mx-auto"
          >
            AstroWave uses intelligent matching to connect event organizers with Ghana's best DJs, MCs, performers and creators. Powered by the proprietary Wave Score algorithm.
          </motion.p>

          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/auth/register?role=organizer">
              <Button size="lg" className="h-16 px-10 font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(255,209,102,0.2)]">
                <Search size={18} className="mr-2" /> I NEED TALENT
              </Button>
            </Link>
            <Link href="/auth/register?role=talent">
              <Button variant="secondary" size="lg" className="h-16 px-10 font-bold tracking-[0.2em]">
                <Mic size={18} className="mr-2" /> I'M A PERFORMER
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            variants={fadeIn} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 1.4 }}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-white/5"
          >
            {[
              { label: 'Talents', val: stats.talents },
              { label: 'Events', val: stats.events },
              { label: 'Bookings', val: stats.bookings },
              { label: 'Coverage', val: 'Ghana' }
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <p className="text-2xl font-display text-white">{typeof s.val === 'number' ? s.val + '+' : s.val}</p>
                <p className="text-[0.6rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="THE PROCESS"
            title="HOW ASTROWAVE WORKS"
            align="center"
            className="mb-24"
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { num: '01', icon: Calendar, color: 'gold', title: 'Post Your Event', desc: 'Tell us about your event — the type, date, location, and what kind of talent you need to make it unforgettable.' },
              { num: '02', icon: Zap, color: 'purple', title: 'Get Matched Instantly', desc: "Our Wave Score algorithm analyzes every talent's rating, experience, and location to find your perfect match." },
              { num: '03', icon: Star, color: 'cyan', title: 'Book & Enjoy', desc: 'Review ranked matches, send a secure booking request, and experience world-class entertainment at your experience.' },
            ].map((step, i) => (
              <motion.div key={i} variants={scaleIn} className="relative group">
                <Card className="p-10 h-full border-white/5 bg-white/[0.02] flex flex-col items-center text-center space-y-6" glowColor={step.color as any}>
                  <span className="absolute top-4 right-8 font-display text-7xl opacity-5 select-none" style={{ color: `var(--color-${step.color})` }}>{step.num}</span>
                  <div className={cn("p-6 rounded-2xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform", `text-${step.color}`)}>
                    <step.icon size={40} />
                  </div>
                  <h3 className="font-display text-3xl text-white uppercase tracking-widest">{step.title}</h3>
                  <p className="body-md text-muted leading-relaxed">{step.desc}</p>
                </Card>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-8 -translate-y-1/2 z-20 text-white/10">
                    <ArrowRight size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 3: WAVE SCORE EXPLANATION ─── */}
      <section className="bg-surface py-32 px-6 lg:px-12 relative" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-4">
              <SectionLabel>THE ALGORITHM</SectionLabel>
              <h2 className="display-lg">WHAT IS THE WAVE SCORE?</h2>
            </div>
            
            <p className="body-lg text-muted">
              Every talent on AstroWave has a Wave Score — an intelligent, real-time rating from 0 to 5 that goes beyond simple star reviews. It's designed to reward quality and consistency.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Star, label: '60% RATING', title: 'Average Rating', desc: 'Based on verified post-event reviews from real organizers.' },
                { icon: Music, label: '20% VOLUME', title: 'Experience', desc: 'Number of completed events, rewarding consistent performers.' },
                { icon: Clock, label: '20% RECENCY', title: 'Market Activity', desc: 'Recent activity is rewarded to ensure you get current talent.' }
              ].map((p, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[0.6rem] font-bold text-gold bg-gold/10 px-2 py-1 rounded-sm">{p.label}</p>
                  </div>
                  <h4 className="font-bold text-white uppercase text-sm">{p.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <Card className="p-8 bg-black/40 border-white/10" glowColor="muted">
               <div className="flex items-center gap-4 text-cyan-400 mb-4">
                  <ShieldCheck size={16} />
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest">Algorithmic Formula</span>
               </div>
               <code className="text-[0.8rem] md:text-sm font-mono text-white/80 block whitespace-pre-wrap leading-relaxed">
                  Wave Score = [(Rating÷5) × 0.6] + [Min(Events÷20, 1) × 0.2] + (Recency × 0.2) × 5
               </code>
            </Card>
          </motion.div>

          <motion.div 
            variants={scaleIn} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
             <Card className="p-10 space-y-10 border-t-2 border-gold shadow-2xl" glowColor="gold">
                <div className="text-center space-y-2">
                   <SectionLabel className="justify-center">INTERACTIVE DEMO</SectionLabel>
                   <h3 className="font-display text-3xl text-white uppercase">WAVE CALCULATOR</h3>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <label className="text-[0.7rem] font-bold text-muted uppercase tracking-widest">Avg Rating</label>
                         <span className="text-gold font-display text-xl">{demoRating.toFixed(1)} ★</span>
                      </div>
                      <Slider value={[demoRating]} min={0} max={5} step={0.1} onValueChange={([v]) => setDemoRating(v)} />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <label className="text-[0.7rem] font-bold text-muted uppercase tracking-widest">Events Completed</label>
                         <span className="text-gold font-display text-xl">{demoEvents} Gigs</span>
                      </div>
                      <Slider value={[demoEvents]} min={0} max={50} step={1} onValueChange={([v]) => setDemoEvents(v)} />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <label className="text-[0.7rem] font-bold text-muted uppercase tracking-widest">Recency Factor</label>
                         <span className="text-gold font-display text-xl">{Math.round(demoRecency * 100)}% Active</span>
                      </div>
                      <Slider value={[demoRecency]} min={0.2} max={1.0} step={0.1} onValueChange={([v]) => setDemoRecency(v)} />
                   </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col items-center">
                   <p className="text-[0.6rem] label m-0 opacity-40">CALCULATED SCORE</p>
                   <h2 className="font-display text-[6rem] text-white text-glow-gold leading-none">{demoScore.waveScore.toFixed(2)}</h2>
                   <div className="mt-4 px-6 py-2 rounded-full border border-gold/30 bg-gold/5 flex items-center gap-2">
                      <span className="text-[0.8rem] font-bold text-white uppercase tracking-[0.2em]">{demoRank.emoji} {demoRank.label}</span>
                   </div>
                </div>
             </Card>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 4: TALENT CATEGORIES ─── */}
      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="TALENT TYPES"
            title="WHO YOU CAN BOOK"
            align="center"
            className="mb-20"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TALENT_CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Link href={`/auth/register?role=organizer&category=${cat.name}`}>
                  <Card className="p-8 h-full flex flex-col items-center text-center space-y-4 group cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                    <span className="text-[3rem] group-hover:scale-110 transition-transform">{cat.emoji}</span>
                    <div>
                      <h4 className="font-display text-2xl text-white uppercase tracking-wider">{cat.name}</h4>
                      <p className="text-[0.6rem] text-muted uppercase font-bold tracking-tighter">{cat.desc}</p>
                    </div>
                    <div className="pt-2">
                       <p className="text-[0.5rem] font-bold text-gold uppercase tracking-[0.2em]">{categoryCounts[cat.name] || '...'}+ AVAILABLE</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <Link href="/auth/register">
              <Button variant="ghost" className="group">
                BROWSE ALL TALENT <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: FEATURED TALENT ─── */}
      <section className="bg-surface py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="TOP PERFORMERS"
            title="FEATURED TALENT"
            subtitle="The elite roster ranked by verified performance metrics."
            align="center"
            className="mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-[480px] bg-white/5 animate-pulse rounded-lg border border-white/5" />)
            ) : featuredTalent.map((talent) => (
              <motion.div key={talent.id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <TalentCard 
                  name={talent.stageName || talent.displayName}
                  role={talent.category}
                  bio={talent.bio}
                  imageUrl={talent.photoURL || 'https://picsum.photos/seed/talent/400/400'}
                />
                <div className="mt-4 flex justify-center">
                   <Link href="/auth/register" className="w-full">
                      <Button className="w-full h-12 text-[0.7rem] font-bold tracking-widest border-white/10 hover:border-gold">BOOK NOW</Button>
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FOR TALENTS ─── */}
      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-2 gap-20 items-center">
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="space-y-8"
          >
            <SectionLabel>FOR PERFORMERS</SectionLabel>
            <h2 className="display-lg">GROW YOUR<br /><span className="text-purple text-glow-purple">CAREER.</span></h2>
            <p className="body-lg text-muted">
              Join Ghana's smartest talent discovery platform. Create your professional identity, build your Wave Score reputation, and get discovered by premium organizers who need exactly what you offer.
            </p>
            
            <ul className="space-y-4">
              {[
                'Free to join and list yourself',
                'Get matched to premium high-budget events',
                'Build a verifiable Wave Score reputation',
                'Manage all your bookings in one central hub',
                'Grow your commercial value with every event'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-4 text-white font-bold text-sm uppercase tracking-widest">
                  <div className="p-1 rounded-full bg-purple/20 text-purple"><Check size={14} /></div>
                  {benefit}
                </li>
              ))}
            </ul>

            <Link href="/auth/register?role=talent" className="inline-block pt-4">
              <Button className="h-16 px-12 bg-purple hover:bg-purple/80 text-white border-none shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                JOIN AS TALENT <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            variants={scaleIn} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
             {/* Mockup Illustration */}
             <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple/20 to-gold/5 border border-white/10 p-8 shadow-2xl relative">
                <div className="w-full h-full rounded-xl bg-[#050505] border border-white/10 overflow-hidden flex flex-col shadow-inner">
                   <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                   </div>
                   <div className="flex-1 p-8 space-y-6">
                      <div className="h-24 w-48 bg-gold/10 border border-gold/20 rounded-lg flex flex-col justify-center px-6">
                         <div className="h-2 w-12 bg-gold/40 rounded mb-2" />
                         <div className="h-8 w-24 bg-gold rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-32 bg-white/5 rounded-lg" />
                         <div className="h-32 bg-white/5 rounded-lg" />
                      </div>
                      <div className="h-40 bg-purple/5 border border-purple/10 rounded-lg" />
                   </div>
                </div>
                {/* Floaties */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple/30 blur-[80px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold/20 blur-[80px] rounded-full" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 7: TESTIMONIALS ─── */}
      <section className="bg-surface py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="TESTIMONIALS"
            title="WHAT PEOPLE SAY"
            align="center"
            className="mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: 'Organizer', name: 'Kofi A.', location: 'Accra', quote: 'AstroWave found me the perfect DJ in minutes. The match percentage was spot on — 94% and he delivered exactly that energy.' },
              { role: 'Talent', name: 'DJ Wave', location: 'Accra', quote: 'My Wave Score helped me get noticed. I went from struggling to find gigs to being fully booked within 2 months.' },
              { role: 'Organizer', name: 'Abena M.', location: 'Kumasi', quote: 'The transparency of the match breakdown told me exactly why each talent was recommended. Total game changer for event planning.' }
            ].map((t, i) => (
              <motion.div key={i} variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="p-10 h-full flex flex-col justify-between" glowColor="muted">
                  <div className="space-y-6">
                    <div className="flex gap-1 text-gold">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                    </div>
                    <p className="body-md text-white italic leading-relaxed">"{t.quote}"</p>
                  </div>
                  <div className="pt-8 border-t border-white/5 mt-8">
                    <p className="font-bold text-white uppercase text-sm">{t.name}</p>
                    <p className="text-[0.6rem] label m-0 opacity-40 uppercase tracking-widest">{t.role} • {t.location}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner 
        overrideHeading="START YOUR WAVE TODAY."
        overrideSubtext="Join hundreds of organizers and talents already using AstroWave to create unforgettable experiences."
      />
    </div>
  );
}
