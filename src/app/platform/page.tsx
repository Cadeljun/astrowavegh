
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, Zap, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';

export default function PlatformLandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="absolute inset-0 z-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255, 209, 102, 0.15), transparent 70%)' }} />
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <SectionLabel className="justify-center">ASTROWAVE PLATFORM</SectionLabel>
            <h1 className="display-2xl text-glow-gold mb-6 uppercase">WHERE EVENTS FIND SOUL.</h1>
            <p className="body-lg text-muted max-w-2xl mx-auto mb-12">
              The professional ecosystem connecting Ghana's elite organizers with world-class creative talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/register?role=organizer">
                <Button size="lg" className="h-16 px-10">FIND TALENT <Users size={18} className="ml-2" /></Button>
              </Link>
              <Link href="/auth/register?role=talent">
                <Button variant="secondary" size="lg" className="h-16 px-10">LIST YOURSELF <Zap size={18} className="ml-2" /></Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Entry Points */}
      <section className="py-24 px-6 lg:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={scaleIn}>
              <Card className="p-12 h-full flex flex-col justify-between group" glowColor="gold">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gold/10 w-fit text-gold group-hover:scale-110 transition-transform">
                    <Calendar size={32} />
                  </div>
                  <h2 className="display-md text-white">FOR ORGANIZERS</h2>
                  <p className="body-md text-muted">
                    Post events, search curated talent, and manage bookings in one secure place. Let our AI match you with the perfect vibe.
                  </p>
                </div>
                <Link href="/auth/login" className="mt-10">
                  <Button variant="ghost" className="p-0 hover:translate-x-2 transition-transform">GO TO DASHBOARD <ArrowRight size={16} /></Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="p-12 h-full flex flex-col justify-between group" glowColor="purple">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-purple/10 w-fit text-purple group-hover:scale-110 transition-transform">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="display-md text-white">FOR TALENT</h2>
                  <p className="body-md text-muted">
                    Build a professional profile, showcase your sets, and get booked for the biggest experiences in the country.
                  </p>
                </div>
                <Link href="/auth/login" className="mt-10">
                  <Button variant="ghost" className="p-0 hover:translate-x-2 transition-transform text-purple">MANAGE ROSTER <ArrowRight size={16} /></Button>
                </Link>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
