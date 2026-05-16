'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Target, Palette, Handshake, Star, Lightbulb, Globe, Shield, ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import CTABanner from '@/components/sections/CTABanner';
import { fadeUp, fadeIn, staggerContainer, scaleIn, heroTextReveal } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  const values = [
    { icon: Palette, title: 'Creativity', desc: 'Encouraging originality, imagination, and artistic freedom.', color: 'gold' as const },
    { icon: Handshake, title: 'Collaboration', desc: 'Building strong partnerships between artists, brands, and communities.', color: 'purple' as const },
    { icon: Star, title: 'Excellence', desc: 'Delivering high-quality experiences, productions, and services.', color: 'cyan' as const },
    { icon: Lightbulb, title: 'Innovation', desc: 'Using new ideas and technology to shape the future of entertainment.', color: 'gold' as const },
    { icon: Globe, title: 'Community', desc: 'Creating spaces where people feel connected, included, and empowered.', color: 'purple' as const },
    { icon: Shield, title: 'Authenticity', desc: 'Representing real African culture, sounds, and stories without imitation.', color: 'cyan' as const },
  ];

  const iconColorMap = {
    gold: 'text-gold',
    purple: 'text-purple',
    cyan: 'text-cyan',
    muted: 'text-muted'
  };

  const problems = [
    { id: '01', title: 'Lack of Platforms for Young Creatives', desc: 'Talent exists in abundance, but structured opportunities are scarce.' },
    { id: '02', title: 'Ordinary Entertainment Experiences', desc: 'The youth demand more than just a party; they crave immersive storytelling.' },
    { id: '03', title: 'Disconnection Between Creatives', desc: 'Silos prevent the cross-pollination of ideas that drive industry growth.' },
    { id: '04', title: 'Limited Industry Structure', desc: 'Professional management and PR are often the missing links to global success.' },
    { id: '05', title: 'Lack of Community-Focused Entertainment', desc: 'Entertainment should empower, educate, and give back to its roots.' },
  ];

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168, 85, 247, 0.15), transparent 70%)' 
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
            <SectionLabel className="justify-center">WHO WE ARE</SectionLabel>
          </motion.div>
          <motion.h1 
            variants={heroTextReveal} 
            initial="hidden" 
            animate="show" 
            className="display-2xl text-glow-purple mb-6 whitespace-pre-line"
          >
            THE WAVE BEGINS HERE.
          </motion.h1>
          <motion.p 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.8 }}
            className="body-lg text-muted max-w-xl mx-auto"
          >
            Born in Accra. Built for Africa. Destined for the world.
          </motion.p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={28} className="text-muted" />
        </div>
      </section>

      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionLabel>OUR STORY</SectionLabel>
            <h2 className="display-md mb-8">From a Vision To a Movement.</h2>
            <div className="space-y-6 text-muted body-lg">
              <p>
                AstroWave was founded by Calvin Mensah Delali, known as Uzy — a visionary creative with a passion for music, culture, and the energy of African youth.
              </p>
              <p>
                The brand was built to solve a real problem: young African creatives had immense talent but lacked platforms, management, and world-class experiences to match their ambition.
              </p>
              <p>
                AstroWave was created to change that — bringing together events, talent management, music, and community under one bold identity.
              </p>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Card className="p-10 border-t-2 border-t-gold bg-card relative overflow-hidden group">
              <span className="absolute -top-4 -right-4 text-[10rem] font-display text-gold opacity-[0.05] leading-none pointer-events-none">"</span>
              <p className="font-display text-[2rem] md:text-[2.5rem] text-white leading-tight mb-8">
                "WE&apos;RE NOT JUST BUILDING A BRAND. WE&apos;RE BUILDING A GENERATION."
              </p>
              <div className="flex flex-col">
                <span className="font-body font-bold text-white">— Calvin Mensah Delali (Uzy)</span>
                <span className="font-body text-muted text-sm">Founder</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section 
        className="bg-surface py-32 px-6 lg:px-12 relative"
        style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}
      >
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Card className="p-10 h-full border-t-2 border-t-gold" glowColor="gold">
              <Eye size={32} className="text-gold mb-6" />
              <h3 className="display-md mb-4 text-white">OUR VISION</h3>
              <p className="body-md text-muted">
                To become Africa&apos;s leading creative powerhouse — uniting music, culture, and innovation to inspire, entertain, and empower the next generation.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className="p-10 h-full border-t-2 border-t-purple" glowColor="purple">
              <Target size={32} className="text-purple mb-6" />
              <h3 className="display-md mb-4 text-white">OUR MISSION</h3>
              <p className="body-md text-muted">
                To redefine entertainment by creating world-class events, nurturing creative talent, producing authentic African music, and driving positive change through community-focused initiatives.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="WHAT DRIVES US" 
            title="OUR CORE VALUES" 
            align="center" 
            className="mb-20"
          />
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} variants={scaleIn}>
                  <Card className="p-10 text-center group" glowColor={v.color}>
                    <Icon 
                      size={32} 
                      className={cn(
                        "mx-auto mb-6 transition-transform group-hover:scale-110",
                        iconColorMap[v.color]
                      )} 
                    />
                    <h4 className="font-display text-[1.8rem] text-white uppercase tracking-wider mb-4">{v.title}</h4>
                    <p className="body-md text-muted">{v.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 lg:px-12 bg-surface">
        <div className="max-w-4xl mx-auto">
          <SectionHeading 
            label="THE PROBLEM" 
            title="WHY ASTROWAVE EXISTS" 
            className="mb-20"
          />
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="space-y-12"
          >
            {problems.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className="group">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <span className="font-display text-[5rem] text-gold opacity-30 leading-none">
                    {p.id}
                  </span>
                  <div className="space-y-2">
                    <h4 className="font-display text-[1.8rem] text-white uppercase tracking-wider group-hover:text-gold transition-colors">
                      {p.title}
                    </h4>
                    <p className="body-md text-muted">{p.desc}</p>
                  </div>
                </div>
                {i < problems.length - 1 && <Divider className="opacity-10 mt-12" />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
