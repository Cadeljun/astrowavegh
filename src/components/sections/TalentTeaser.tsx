'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { staggerContainer, scaleIn } from '@/lib/animations';
import { MapPin, Star } from 'lucide-react';

export default function TalentTeaser() {
  const talents = [
    { name: 'DJ Horizon', role: 'DJ', city: 'Accra', score: 4.8, img: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=400&h=400&auto=format&fit=crop' },
    { name: 'Uzy', role: 'Artist', city: 'Accra', score: 4.9, img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&h=400&auto=format&fit=crop' },
    { name: 'MC Flow', role: 'MC', city: 'Kumasi', score: 4.6, img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400&h=400&auto=format&fit=crop' }
  ];

  return (
    <section className="bg-light-bg py-32 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading 
          theme="light"
          align="center"
          label="Our Roster"
          title="The Talent"
          subtitle="The faces behind the wave."
          className="mb-20"
        />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20"
        >
          {talents.map((t, i) => (
            <motion.div key={i} variants={scaleIn}>
              <Card theme="light" accentColor={t.role === 'DJ' ? 'green' : 'blue'} className="p-8 text-center group">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-light-surface group-hover:border-green transition-all shadow-xl">
                   <img src={t.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={t.name} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl text-light-text uppercase tracking-tight">{t.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                       <Badge variant="active" theme="light" className={t.role === 'DJ' ? "bg-green-bg-light text-green-dark" : "bg-blue-bg-light text-blue"}>
                         {t.role}
                       </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[0.8rem] text-light-subtext font-medium">
                     <span className="flex items-center gap-1.5"><MapPin size={14} className="text-green-dark" /> {t.city}</span>
                     <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-bg-light text-green-dark font-bold text-[0.65rem] border border-green/20">
                        <Star size={10} fill="currentColor" /> {t.score}
                     </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link href="/management">
            <Button variant="outline-light">DISCOVER ALL TALENT</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}