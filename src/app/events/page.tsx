'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    label: 'Live Experiences',
    heading: 'The Events',
    subtext: 'Immersive. Energetic. Unforgettable.'
  });

  const { content: hostCta } = useCMSContent('events', 'host_cta', {
    heading: 'Want to Host with AstroWave?',
    subtext: 'Partner with us to create unforgettable experiences. We handle production, talent, marketing and everything in between.',
    cta: 'Get in Touch'
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
      {/* Hero Section: DARK Theme */}
      <section className="relative h-[55vh] lg:h-[60vh] w-full flex items-center justify-center overflow-hidden bg-dark-bg grain px-6">
        <div className="absolute inset-0 z-0 opacity-40 grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=800&auto=format&fit=crop')`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/40 to-dark-bg z-10" />
        <div className="relative z-20 text-center max-w-3xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <SectionLabel theme="dark" className="justify-center">{hero.label}</SectionLabel>
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="display-xl text-glow-green mb-4 leading-none">
            {hero.heading}
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="body-lg text-dark-subtext max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
            {hero.subtext}
          </motion.p>
        </div>
      </section>

      {/* Filter Navigation: Adapts to dark bg */}
      <nav className="sticky top-[64px] lg:top-[80px] z-[100] bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border py-4 px-6 overflow-x-auto scrollbar-hide">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-start sm:justify-center gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-full border text-[0.7rem] sm:text-[0.8rem] font-semibold tracking-widest uppercase transition-all duration-300", 
                activeTab === cat 
                  ? "bg-green-bg-dark text-green border-green" 
                  : "bg-transparent text-dark-subtext border-dark-border hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Events Grid Section: LIGHT SURFACE Theme */}
      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-light-surface relative" style={{ clipPath: 'polygon(0 30px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            theme="light" 
            label="All Experiences" 
            title="Upcoming Events" 
            className="mb-12 lg:mb-16" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-[400px] lg:h-[480px] bg-white animate-pulse rounded-lg border border-light-border" />)
            ) : filteredEvents.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event: any) => (
                  <motion.div 
                    key={event.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ duration: 0.3 }} 
                    className="h-full"
                  >
                    <EventCard 
                      name={event.name} 
                      category={event.category} 
                      date={new Date(event.date).toLocaleDateString()} 
                      venue={event.venue} 
                      description={event.description} 
                      imageUrl={event.imageUrl || 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800&h=600&auto=format&fit=crop'} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Calendar size={48} className="text-light-muted opacity-20" />
                <h3 className="display-md text-light-subtext text-xl lg:text-2xl">No events currently scheduled.</h3>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Host CTA: LIGHT Theme */}
      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-light-bg">
        <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-screen-2xl mx-auto">
          <Card 
            theme="light" 
            accentColor="green"
            className="relative p-8 sm:p-12 lg:p-20 text-center space-y-6 lg:space-y-8 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ background: 'linear-gradient(45deg, var(--blue), var(--green))' }} />
            <h2 className="display-lg text-light-text text-[1.8rem] sm:text-[2.5rem] lg:text-[3.5rem]">
              {hostCta.heading}
            </h2>
            <p className="body-lg text-light-subtext max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
              {hostCta.subtext}
            </p>
            <Link href="/contact" className="inline-block">
              <Button size="lg" className="px-8 lg:px-12 w-full sm:w-auto">
                {hostCta.cta}
              </Button>
            </Link>
          </Card>
        </motion.div>
      </section>
    </article>
  );
}
