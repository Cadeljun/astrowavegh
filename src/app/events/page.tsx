'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import EventCard from '@/components/events/EventCard';
import { fadeUp, fadeIn, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCMSContent } from '@/lib/cms/useCMS';
import Link from 'next/link';

const categories = ['All', 'Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals'];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const db = useFirestore();
  
  const { content: hero } = useCMSContent('events', 'hero', {
    label: 'LIVE EXPERIENCES',
    heading: 'THE EVENTS',
    subtext: 'Immersive. Energetic. Unforgettable.'
  });

  const { content: hostCta } = useCMSContent('events', 'host_cta', {
    heading: 'WANT TO HOST WITH ASTROWAVE?',
    subtext: 'Partner with us to create unforgettable experiences. We handle production, talent, marketing and everything in between.',
    cta: 'GET IN TOUCH'
  });

  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'events'), where('active', '==', true));
  }, [db]);

  const { data: events, loading } = useCollection(eventsQuery);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (activeTab === 'All') return events;
    return events.filter((e: any) => e.category === activeTab);
  }, [events, activeTab]);

  return (
    <article className="flex flex-col w-full">
      <section className="relative h-[55vh] lg:h-[60vh] w-full flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="absolute inset-0 z-0 opacity-40 grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=800&auto=format&fit=crop')`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <div className="relative z-20 text-center max-w-3xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show"><SectionLabel className="justify-center">{hero.label}</SectionLabel></motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="display-xl text-glow-gold mb-4 leading-none">{hero.heading}</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="body-lg text-muted max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">{hero.subtext}</motion.p>
        </div>
      </section>

      <nav className="sticky top-[64px] lg:top-[80px] z-[100] bg-black/80 backdrop-blur-xl border-b border-border-dark py-4 px-6 overflow-x-auto scrollbar-hide">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-start sm:justify-center gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={cn("whitespace-nowrap px-5 py-2 rounded-full border text-[0.7rem] sm:text-[0.8rem] font-semibold tracking-widest uppercase transition-all duration-300", activeTab === cat ? "bg-gold-dim text-gold border-gold" : "bg-transparent text-muted border-border-dark hover:text-white")}>{cat}</button>
          ))}
        </div>
      </nav>

      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-surface" style={{ clipPath: 'polygon(0 30px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading label="ALL EXPERIENCES" title="UPCOMING EVENTS" className="mb-12 lg:mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
            {loading ? [1, 2, 3].map((i) => <div key={i} className="h-[400px] lg:h-[480px] bg-white/5 animate-pulse rounded-lg border border-white/5" />) : filteredEvents.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event: any) => (
                  <motion.div key={event.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="h-full">
                    <EventCard name={event.name} category={event.category} date={new Date(event.date).toLocaleDateString()} venue={event.venue} description={event.description} imageUrl={event.imageUrl || 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800&h=600&auto=format&fit=crop'} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4"><Calendar size={48} className="text-muted opacity-20" /><h3 className="display-md text-muted text-xl lg:text-2xl">No events currently scheduled.</h3></div>}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-black">
        <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-screen-2xl mx-auto">
          <Card className="relative p-8 sm:p-12 lg:p-20 text-center space-y-6 lg:space-y-8 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ background: 'linear-gradient(45deg, var(--color-purple), var(--color-gold))' }} />
            <h2 className="display-lg text-[1.8rem] sm:text-[2.5rem] lg:text-[3.5rem]">{hostCta.heading}</h2>
            <p className="body-lg text-muted max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">{hostCta.subtext}</p>
            <Link href="/contact" className="inline-block"><Button size="lg" className="px-8 lg:px-12 w-full sm:w-auto">{hostCta.cta}</Button></Link>
          </Card>
        </motion.div>
      </section>
    </article>
  );
}