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
import EventSchema from '@/components/seo/EventSchema';
import { fadeUp, fadeIn, staggerContainer, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

const categories = ['All', 'Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals'];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const db = useFirestore();

  // Firestore query for active events
  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'events'), where('active', '==', true));
  }, [db]);

  const { data: events, loading } = useCollection(eventsQuery);

  // Filter logic
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (activeTab === 'All') return events;
    return events.filter((e: any) => e.category === activeTab);
  }, [events, activeTab]);

  return (
    <article className="flex flex-col w-full">
      <h1 className="sr-only">Events in Accra, Ghana | AstroWave Parties & Nightlife</h1>
      
      {/* Event Schema for primary experiences */}
      <EventSchema
        name="Mask Mirage"
        description="A mysterious high-energy nightlife experience centered around masks, identity, music and fashion in Accra, Ghana."
        startDate="2025-12-31T20:00:00"
        location="Accra, Ghana"
        imageUrl="https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=1200&h=800&auto=format&fit=crop"
        url="https://astrowave.com/events"
      />

      <EventSchema
        name="Splash & Seduction All Day Party"
        description="Daytime pool vibes collide with nighttime energy in one complete lifestyle experience in Accra, Ghana."
        startDate="2025-12-31T12:00:00"
        location="Accra, Ghana"
        imageUrl="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&h=800&auto=format&fit=crop"
        url="https://astrowave.com/events"
      />

      {/* SECTION 1: HERO */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div 
          className="absolute inset-0 z-0 opacity-40 grayscale"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=800&auto=format&fit=crop')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        
        <div className="relative z-20 text-center px-6">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <SectionLabel className="justify-center">LIVE EXPERIENCES</SectionLabel>
          </motion.div>
          <motion.h2 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            className="display-xl text-glow-gold mb-4"
          >
            THE EVENTS
          </motion.h2>
          <motion.p 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.2 }}
            className="body-lg text-muted max-w-2xl mx-auto"
          >
            Immersive. Energetic. Unforgettable.<br />
            This is what AstroWave feels like.
          </motion.p>
        </div>
      </section>

      {/* SECTION 2: FILTER TABS */}
      <nav className="sticky top-[64px] lg:top-[72px] z-[100] bg-black/80 backdrop-blur-xl border-b border-border-dark py-4 px-6 lg:px-12 overflow-x-auto scrollbar-hide">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-start lg:justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "whitespace-nowrap px-6 py-2.5 rounded-full border text-[0.8rem] font-semibold tracking-widest uppercase transition-all duration-300",
                activeTab === cat 
                  ? "bg-gold-dim text-gold border-gold" 
                  : "bg-transparent text-muted border-border-dark hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* SECTION 3: FEATURED SPOTLIGHT */}
      <section className="py-24 px-6 lg:px-12 bg-black space-y-12">
        <div className="max-w-screen-2xl mx-auto space-y-12">
          {/* Spotlight 1: Mask Mirage */}
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="relative h-[520px] rounded-lg overflow-hidden group border border-white/5"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=1200&h=800&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
            <div className="relative z-20 h-full flex flex-col justify-center px-8 lg:px-20 max-w-3xl space-y-6">
              <Badge variant="active" className="w-fit bg-purple-dim text-purple border-purple">NIGHTLIFE</Badge>
              <h3 className="display-xl text-white text-glow-purple tracking-tighter">MASK MIRAGE</h3>
              <p className="body-md text-white font-medium italic opacity-90 tracking-widest uppercase">"Identity. Music. Mystery."</p>
              <div className="flex flex-wrap items-center gap-6 text-muted text-sm font-medium">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-purple" /> TBA 2025</span>
                <span className="flex items-center gap-2"><MapPin size={16} className="text-purple" /> Accra, Ghana</span>
              </div>
              <p className="body-md text-muted max-w-xl line-clamp-3">
                A mysterious high-energy nightlife experience centered around masks, identity, music, fashion, and the culture of the night. An evening where you become whoever you want to be.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg">GET TICKETS</Button>
                <Button variant="ghost">LEARN MORE</Button>
              </div>
            </div>
          </motion.div>

          {/* Spotlight 2: Splash & Seduction */}
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="relative h-[520px] rounded-lg overflow-hidden group border border-white/5"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&h=800&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
            <div className="relative z-20 h-full flex flex-col justify-center px-8 lg:px-20 max-w-3xl space-y-6">
              <Badge variant="active" className="w-fit bg-cyan-dim text-cyan border-cyan">ALL DAY PARTY</Badge>
              <h3 className="display-xl text-white text-glow-cyan tracking-tighter">SPLASH & SEDUCTION</h3>
              <p className="body-md text-white font-medium italic opacity-90 tracking-widest uppercase">"Sun. Pool. Vibes. Night."</p>
              <div className="flex flex-wrap items-center gap-6 text-muted text-sm font-medium">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-cyan" /> TBA 2025</span>
                <span className="flex items-center gap-2"><MapPin size={16} className="text-cyan" /> Accra, Ghana</span>
              </div>
              <p className="body-md text-muted max-w-xl line-clamp-3">
                Daytime pool vibes collide with nighttime energy in one complete lifestyle experience. From sunrise to the last song — this is the all-day party redefined.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg">GET TICKETS</Button>
                <Button variant="ghost">LEARN MORE</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: ALL EVENTS GRID */}
      <section className="py-32 px-6 lg:px-12 bg-surface" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="ALL EXPERIENCES"
            title="UPCOMING EVENTS"
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[480px] bg-white/5 animate-pulse rounded-lg border border-white/5" />
              ))
            ) : filteredEvents.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event: any) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
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
                <Calendar size={64} className="text-muted opacity-20" />
                <h3 className="display-md text-muted">No events currently scheduled.</h3>
                <p className="body-md text-muted/60">Check back soon — something big is coming.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: PAST EVENTS GALLERY */}
      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="MEMORIES"
            title="PAST EVENTS"
            className="mb-16"
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                className="relative aspect-square rounded-md overflow-hidden group cursor-pointer"
              >
                <img 
                  src={`https://picsum.photos/seed/${i + 50}/600/600`} 
                  alt="AstroWave past event memory from Accra Ghana"
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                   <p className="font-display text-lg text-white mb-1">EVENT NAME</p>
                   <p className="font-body text-[0.7rem] text-gold uppercase tracking-widest">DEC 2024</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-12 text-center">
            <p className="body-md text-muted italic">Gallery coming soon. The wave is just getting started.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOST AN EVENT CTA */}
      <section className="py-24 px-6 lg:px-12 bg-black">
        <motion.div 
          variants={scaleIn} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }}
          className="max-w-screen-2xl mx-auto"
        >
          <Card className="relative p-12 lg:p-20 text-center space-y-8 overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{ background: 'linear-gradient(45deg, var(--color-purple), var(--color-gold))' }}
            />
            <h2 className="display-lg">WANT TO HOST WITH ASTROWAVE?</h2>
            <p className="body-lg text-muted max-w-2xl mx-auto">
              Partner with us to create unforgettable experiences. We handle production, talent, marketing and everything in between.
            </p>
            <Button size="lg" className="px-12">GET IN TOUCH</Button>
          </Card>
        </motion.div>
      </section>
    </article>
  );
}
