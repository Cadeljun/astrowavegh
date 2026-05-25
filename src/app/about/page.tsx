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
import { useCMSContent } from '@/lib/cms/useCMS';

export default function AboutPage() {
  const { content: hero } = useCMSContent('about', 'hero', {
    label: 'WHO WE ARE',
    heading: 'THE WAVE BEGINS HERE.',
    subtext: 'Born in Accra. Built for Africa. Destined for the world.'
  });

  const { content: story } = useCMSContent('about', 'story', {
    label: 'OUR STORY',
    heading: 'From a Vision To a Movement.',
    para1: 'AstroWave was founded by Calvin Mensah Delali, known as Uzy — a visionary creative with a passion for music, culture, and the energy of African youth.',
    para2: 'The brand was built to solve a real problem: young African creatives had immense talent but lacked platforms, management, and world-class experiences to match their ambition.',
    para3: 'AstroWave was created to change that — bringing together events, talent management, music, and community under one bold identity.',
    quote: '"WE\'RE NOT JUST BUILDING A BRAND. WE\'RE BUILDING A GENERATION."',
    quoteAuthor: '— Calvin Mensah Delali (Uzy), Founder'
  });

  const { content: vision } = useCMSContent('about', 'vision', {
    visionTitle: 'OUR VISION',
    visionBody: 'To become Africa\'s leading creative powerhouse — uniting music, culture, and innovation to inspire, entertain, and empower the next generation.',
    missionTitle: 'OUR MISSION',
    missionBody: 'To redefine entertainment by creating world-class events, nurturing creative talent, producing authentic African music, and driving positive change through community-focused initiatives.'
  });

  const { content: valuesContent } = useCMSContent('about', 'values', {
    label: 'WHAT DRIVES US',
    heading: 'OUR CORE VALUES'
  });

  const values = [
    { icon: Palette, title: 'Creativity', desc: 'Encouraging originality, imagination, and artistic freedom.', color: 'green' as const },
    { icon: Handshake, title: 'Collaboration', desc: 'Building strong partnerships between artists, brands, and communities.', color: 'blue' as const },
    { icon: Star, title: 'Excellence', desc: 'Delivering high-quality experiences, productions, and services.', color: 'sky' as const },
    { icon: Lightbulb, title: 'Innovation', desc: 'Using new ideas and technology to shape the future of entertainment.', color: 'green' as const },
    { icon: Globe, title: 'Community', desc: 'Creating spaces where people feel connected, included, and empowered.', color: 'blue' as const },
    { icon: Shield, title: 'Authenticity', desc: 'Representing real African culture, sounds, and stories without imitation.', color: 'sky' as const },
  ];

  const iconColorMap = { green: 'text-green', blue: 'text-blue', sky: 'text-sky', muted: 'text-muted' };

  return (
    <div className="flex flex-col w-full">
      <section className="relative min-h-[80vh] h-screen w-full flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="absolute inset-0 z-0 opacity-40" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(14, 165, 233, 0.08), transparent 70%)' }} />
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.2 }}><SectionLabel className="justify-center">{hero.label}</SectionLabel></motion.div>
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-xl lg:display-2xl text-glow-blue mb-6 whitespace-pre-line leading-none">{hero.heading}</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.8 }} className="body-lg text-muted max-w-xl mx-auto text-sm sm:text-base lg:text-lg">{hero.subtext}</motion.p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown size={28} className="text-muted" /></div>
      </section>

      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionLabel>{story.label}</SectionLabel>
            <h2 className="display-md lg:display-lg mb-8">{story.heading}</h2>
            <div className="space-y-6 text-muted body-lg text-sm sm:text-base">
              <p>{story.para1}</p>
              <p>{story.para2}</p>
              <p>{story.para3}</p>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Card className="p-8 lg:p-10 border-t-2 border-t-green bg-card relative overflow-hidden group" glowColor="green">
              <span className="absolute -top-4 -right-4 text-[6rem] lg:text-[10rem] font-display text-green opacity-[0.05] leading-none pointer-events-none">"</span>
              <p className="font-display text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] text-white leading-tight mb-8">{story.quote}</p>
              <div className="flex flex-col"><span className="font-body text-xs sm:text-sm font-bold text-white uppercase tracking-widest">{story.quoteAuthor}</span></div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="bg-light py-20 lg:py-32 px-6 lg:px-12 relative" style={{ clipPath: 'polygon(0 30px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Card className="p-8 lg:p-10 h-full border-t-2 border-t-green" glowColor="green">
              <Eye size={32} className="text-green mb-6" />
              <h3 className="display-md mb-4 text-white text-xl sm:text-2xl">{vision.visionTitle}</h3>
              <p className="body-md text-muted text-sm sm:text-base">{vision.visionBody}</p>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className="p-8 lg:p-10 h-full border-t-2 border-t-blue" glowColor="blue">
              <Target size={32} className="text-blue mb-6" />
              <h3 className="display-md mb-4 text-white text-xl sm:text-2xl">{vision.missionTitle}</h3>
              <p className="body-md text-muted text-sm sm:text-base">{vision.missionBody}</p>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading label={valuesContent.label} title={valuesContent.heading} align="center" className="mb-12 lg:mb-20" />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {values.map((v, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="p-8 lg:p-10 text-center group h-full" glowColor={v.color as any}>
                  <v.icon size={32} className={cn("mx-auto mb-6 transition-transform group-hover:scale-110", iconColorMap[v.color as keyof typeof iconColorMap])} />
                  <h4 className="font-display text-[1.4rem] lg:text-[1.8rem] text-white uppercase tracking-wider mb-4">{v.title}</h4>
                  <p className="body-md text-muted text-sm leading-relaxed">{v.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <CTABanner />
    </div>
  );
}