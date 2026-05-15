'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import EventCard from '@/components/events/EventCard';
import { staggerContainer, fadeUp } from '@/lib/animations';

const events = [
  {
    name: 'MASK MIRAGE',
    category: 'NIGHTLIFE',
    date: 'TBA',
    venue: 'Accra, Ghana',
    description: 'A mysterious high-energy nightlife experience where identity meets music and fashion.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800&h=600&auto=format&fit=crop'
  },
  {
    name: 'SPLASH & SEDUCTION',
    category: 'ALL DAY PARTY',
    date: 'TBA',
    venue: 'Accra, Ghana',
    description: 'Daytime pool vibes meet nightlife energy in one complete lifestyle experience.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&h=600&auto=format&fit=crop'
  }
];

export default function FeaturedEvents() {
  return (
    <section className="bg-[var(--color-black)] py-32 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading 
          label="EXPERIENCES"
          title="UPCOMING EVENTS"
          subtitle="Step into the wave."
          align="center"
          className="mb-20"
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {events.map((event, i) => (
            <motion.div key={i} variants={fadeUp}>
              <EventCard {...event} />
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center">
          <Link href="/events">
            <Button variant="ghost">VIEW ALL EVENTS &rarr;</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
