'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Users, Music, Heart, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

const divisions = [
  { icon: Zap, title: 'Events', desc: 'Immersive parties, concerts, and nightlife experiences that feel like cultural moments.', accent: 'green' as const, link: '/events' },
  { icon: Users, title: 'Management', desc: 'Representing DJs and artists — building careers, securing deals, and shaping identities.', accent: 'blue' as const, link: '/management' },
  { icon: Music, title: 'Records', desc: 'A future home for African music — artist development, production, and distribution.', accent: 'cyan' as const, link: null, status: 'Coming Soon' },
  { icon: Heart, title: 'Cares', desc: 'Youth empowerment, creative education, and community impact initiatives.', accent: 'green' as const, link: null, status: 'Coming Soon' }
];

export default function EcosystemSection() {
  return (
    <section className="bg-light-surface py-32 px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <SectionHeading 
          theme="light"
          align="center"
          label="What We Do"
          title="The AstroWave Ecosystem"
          subtitle="Four divisions. One unstoppable wave."
          className="mb-20"
        />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {divisions.map((div, i) => {
            const Icon = div.icon;
            const isComingSoon = !!div.status;
            
            return (
              <motion.div key={i} variants={scaleIn} className="h-full">
                <Card 
                  theme="light" 
                  accentColor={div.accent} 
                  className={cn(
                    "h-full p-10 flex flex-col justify-between group",
                    isComingSoon && "opacity-70"
                  )}
                >
                  <div className="space-y-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                      div.accent === 'green' ? "bg-green-bg-light text-green" : 
                      div.accent === 'blue' ? "bg-blue-bg-light text-blue" : "bg-cyan-bg-light text-cyan"
                    )}>
                      <Icon size={28} />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <h3 className="font-display text-2xl text-light-text uppercase tracking-tight">{div.title}</h3>
                         {isComingSoon && <Badge variant="coming-soon">{div.status}</Badge>}
                      </div>
                      <p className="body-md text-light-subtext">{div.desc}</p>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-light-border">
                    {div.link ? (
                      <Link href={div.link} className={cn(
                        "flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-all",
                        div.accent === 'green' ? "text-green-dark hover:text-green" : "text-blue hover:text-blue-light"
                      )}>
                        EXPLORE DIVISION <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </Link>
                    ) : (
                      <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-light-muted">Locked Module</span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
