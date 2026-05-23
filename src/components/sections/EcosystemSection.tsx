'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Users, Music, Heart, Lock } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCMSContent } from '@/lib/cms/useCMS';

const divisions = [
  { icon: Zap, title: 'ASTROWAVE EVENTS', desc: 'Immersive parties, concerts, festivals, and nightlife experiences that feel like cultural moments.', badge: 'active', color: 'green' as const, link: '/events', cta: 'Explore Events →' },
  { icon: Users, title: 'ASTROWAVE MANAGEMENT', desc: 'Representing DJs, artists, and creatives — building careers, securing deals, and shaping identities.', badge: 'active', color: 'blue' as const, link: '/management', cta: 'Meet The Talent →' },
  { icon: Music, title: 'ASTROWAVE RECORDS', desc: 'A future home for African music — artist development, production, and distribution.', badge: 'coming-soon', color: 'muted' as const, link: null, cta: 'Coming Soon' },
  { icon: Heart, title: 'ASTROWAVE CARES', desc: 'Youth empowerment, creative education, and community impact initiatives across Africa.', badge: 'coming-soon', color: 'muted' as const, link: null, cta: 'Coming Soon' }
];

const colorStyles = {
  green: { iconBg: 'bg-green-dim', iconColor: 'text-green', ctaColor: 'text-green' },
  blue: { iconBg: 'bg-blue-dim', iconColor: 'text-blue', ctaColor: 'text-blue' },
  muted: { iconBg: 'bg-dark', iconColor: 'text-muted', ctaColor: 'text-muted' }
};

export default function EcosystemSection() {
  const { content } = useCMSContent('home', 'ecosystem', {
    label: 'WHAT WE DO',
    heading: 'THE ASTROWAVE ECOSYSTEM',
    subtitle: 'Four divisions. One unstoppable wave.'
  });

  return (
    <section 
      className="bg-[var(--color-light)] py-32 px-6 lg:px-12 relative"
      style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}
    >
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeading 
          label={content.label}
          title={content.heading}
          subtitle={content.subtitle}
          align="center"
          className="mb-20"
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {divisions.map((div, i) => {
            const Icon = div.icon;
            const isComingSoon = div.badge === 'coming-soon';
            const styles = colorStyles[div.color as keyof typeof colorStyles];
            
            return (
              <motion.div key={i} variants={scaleIn}>
                <Card className={cn(isComingSoon ? 'opacity-60' : '')} glowColor={div.color as any}>
                  <div className={isComingSoon ? '' : 'hover:-translate-y-1 transition-transform duration-300'}>
                    <div className="p-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className={cn("p-3 rounded-lg", styles.iconBg, styles.iconColor)}><Icon size={28} /></div>
                        <Badge variant={div.badge as any}>{div.badge === 'active' ? 'Active' : 'Coming Soon'}</Badge>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-display text-[1.8rem] tracking-wide text-white uppercase">{div.title}</h3>
                        <p className="body-md text-muted">{div.desc}</p>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        {div.link ? (
                          <Link href={div.link} className={cn("font-body text-[0.85rem] font-bold tracking-widest uppercase hover:underline", styles.ctaColor)}>{div.cta}</Link>
                        ) : (
                          <div className="flex items-center gap-2 font-body text-[0.85rem] font-bold tracking-widest uppercase text-muted"><Lock size={12} />{div.cta}</div>
                        )}
                      </div>
                    </div>
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
