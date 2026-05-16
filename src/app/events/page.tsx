'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import EventCard from '@/components/events/EventCard';
import { fadeUp, fadeIn, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCMSContent } from '@/lib/cms/useCMS';

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
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40 grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=800&auto=format&fit=crop')`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <div className="relative z-20 text-center px-6">
          <motion.div variants={fadeIn} initial="hidden" animate="show"><SectionLabel className="justify-center">{hero.label}</SectionLabel></motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="display-xl text-glow-gold mb-4">{hero.heading}</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="body-lg text-muted max-w-2xl mx-auto">{hero.subtext}</motion.p>
        </div>
      </section>

      <nav className="sticky top-[64px] lg:top-[72px] z-[100] bg-black/80 backdrop-blur-xl border-b border-border-dark py-4 px-6 lg:px-12 overflow-x-auto scrollbar-hide">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-start lg:justify-center gap-4">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={cn("whitespace-nowrap px-6 py-2.5 rounded-full border text-[0.8rem] font-semibold tracking-widest uppercase transition-all duration-300", activeTab === cat ? "bg-gold-dim text-gold border-gold" : "bg-transparent text-muted border-border-dark hover:text-white")}>{cat}</button>
          ))}
        </div>
      </nav>

      <section className="py-32 px-6 lg:px-12 bg-surface" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading label="ALL EXPERIENCES" title="UPCOMING EVENTS" className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {loading ? [1, 2, 3].map((i) => <div key={i} className="h-[480px] bg-white/5 animate-pulse rounded-lg border border-white/5" />) : filteredEvents.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event: any) => (
                  <motion.div key={event.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                    <EventCard name={event.name} category={event.category} date={new Date(event.date).toLocaleDateString()} venue={event.venue} description={event.description} imageUrl={event.imageUrl || 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800&h=600&auto=format&fit=crop'} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4"><Calendar size={64} className="text-muted opacity-20" /><h3 className="display-md text-muted">No events currently scheduled.</h3></div>}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-black">
        <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-screen-2xl mx-auto">
          <Card className="relative p-12 lg:p-20 text-center space-y-8 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ background: 'linear-gradient(45deg, var(--color-purple), var(--color-gold))' }} />
            <h2 className="display-lg">{hostCta.heading}</h2>
            <p className="body-lg text-muted max-w-2xl mx-auto">{hostCta.subtext}</p>
            <Link href="/contact"><Button size="lg" className="px-12">{hostCta.cta}</Button></Link>
          </Card>
        </motion.div>
      </section>
    </article>
  );
}