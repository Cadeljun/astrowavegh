'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Award, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fadeUp, staggerContainer, heroTextReveal } from '@/lib/animations';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Cinematic Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue/10 via-black to-green/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,135,0.05),transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl space-y-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Badge variant="live" className="mb-4">🌊 Now Live in Ghana</Badge>
          </motion.div>
          
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-2xl leading-none">
            VIBES BEYOND<br /><span className="text-green text-glow-green">THE HORIZON.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.8 }} className="body-lg text-muted max-w-2xl mx-auto italic">
            "Africa's next-generation entertainment powerhouse—uniting music, culture, and innovation."
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">GET STARTED <ArrowRight size={16} className="ml-2" /></Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">DISCOVER MORE</Button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ArrowRight className="rotate-90" />
        </div>
      </section>

      {/* Ecosystem Teaser */}
      <section className="py-24 px-6 lg:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <p className="label text-green tracking-[0.4em]">Ecosystem</p>
            <h2 className="display-lg">THE WAVE IS HERE.</h2>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'ASTROWAVE EVENTS', desc: 'Immersive parties and festivals that redefine African nightlife.', color: 'green' },
              { icon: Users, title: 'MANAGEMENT', desc: 'Elite representation for DJs, artists, and creators.', color: 'purple' },
              { icon: Award, title: 'MATCH ENGINE', desc: 'Smart algorithms connecting talent with global opportunities.', color: 'blue' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="p-10 h-full group" glowColor={item.color as any}>
                  <div className={`p-4 rounded-lg bg-${item.color}-dim text-${item.color} w-fit mb-8`}>
                    <item.icon size={32} />
                  </div>
                  <h3 className="font-display text-3xl mb-4 tracking-wider">{item.title}</h3>
                  <p className="body-md text-muted leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}