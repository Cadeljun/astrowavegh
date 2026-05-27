'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { Calendar, MapPin } from 'lucide-react';

export default function FeaturedEvents() {
  const events = [
    { title: 'Mask Mirage', category: 'Nightlife', date: 'Dec 24, 2024', venue: 'The Labadi Beach', img: 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800&h=600&auto=format&fit=crop' },
    { title: 'Splash & Seduction', category: 'Pool Party', date: 'Jan 1, 2025', venue: 'Skybar 25', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&h=600&auto=format&fit=crop' }
  ];

  return (
    <section className="bg-dark-surface py-32 px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading 
          theme="dark"
          align="center"
          label="Experiences"
          title="Upcoming Events"
          gradient
          className="mb-20"
        />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
        >
          {events.map((event, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card theme="dark" accentColor="green" className="group overflow-hidden">
                <div className="aspect-[16/9] relative overflow-hidden">
                   <img src={event.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={event.title} />
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                   <div className="absolute top-6 left-6">
                      <Badge variant="active">{event.category}</Badge>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <h3 className="font-display text-3xl text-white uppercase tracking-tight">{event.title}</h3>
                      <div className="flex items-center gap-6 text-[0.8rem] text-dark-subtext font-medium">
                         <span className="flex items-center gap-2"><Calendar size={14} className="text-green" /> {event.date}</span>
                         <span className="flex items-center gap-2"><MapPin size={14} className="text-green" /> {event.venue}</span>
                      </div>
                   </div>
                   <Link href="/events" className="inline-block w-full">
                      <Button className="w-full h-12">SECURE TICKETS</Button>
                   </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link href="/events">
            <Button variant="outline-dark">VIEW ALL EVENTS</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}