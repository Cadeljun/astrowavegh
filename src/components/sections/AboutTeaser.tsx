'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { staggerContainer, scaleIn, fadeUp } from '@/lib/animations';

export default function AboutTeaser() {
  const stats = [
    { value: '2+', label: 'DJs Managed' },
    { value: '1', label: 'Artist Signed' },
    { value: '100%', label: 'Commitment' },
    { value: '∞', label: 'Potential' },
  ];

  return (
    <section className="bg-light-bg py-32 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={fadeUp} 
          className="lg:col-span-7 space-y-8"
        >
          <SectionHeading 
            theme="light"
            label="Our Story"
            title="A Movement Built For Africa."
            subtitle="AstroWave isn't just an entertainment brand — it's a creative ecosystem that connects talent, events, and opportunities across Ghana and beyond."
          />
          <Link href="/about">
            <Button variant="ghost" className="p-0 text-green-dark font-bold tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
              DISCOVER ASTROWAVE <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer} 
          className="lg:col-span-5 grid grid-cols-2 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={scaleIn}>
              <Card theme="light" accentColor="green" className="p-10 text-center space-y-2">
                <p className="display-md text-green leading-none">{stat.value}</p>
                <p className="text-[0.7rem] font-bold text-light-subtext uppercase tracking-widest">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
