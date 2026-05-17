'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CalendarCheck, Megaphone, TrendingUp, Smartphone, Music, Camera, DollarSign, Loader2, Send } from 'lucide-react';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TalentCard from '@/components/talent/TalentCard';
import { fadeUp, fadeIn, staggerContainer, scaleIn, heroTextReveal } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCMSContent } from '@/lib/cms/useCMS';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const services = [
  { icon: Briefcase, title: "BRAND DEALS", desc: "Connecting talent with brands for meaningful partnerships.", color: 'gold' as const },
  { icon: CalendarCheck, title: "BOOKING MGMT", desc: "Handling all performance and appearance bookings professionally.", color: 'purple' as const },
  { icon: Megaphone, title: "PUBLIC RELATIONS", desc: "Managing image, press coverage, and media relationships.", color: 'cyan' as const },
  { icon: TrendingUp, title: "CAREER STRATEGY", desc: "Long-term planning and roadmapping for sustainable success.", color: 'gold' as const },
  { icon: Smartphone, title: "SOCIAL GROWTH", desc: "Building and managing online presence across all platforms.", color: 'purple' as const },
  { icon: Music, title: "EVENT PLACEMENTS", desc: "Securing performance slots at events, festivals, and shows.", color: 'cyan' as const },
  { icon: Camera, title: "IMAGE MGMT", desc: "Creative direction for photoshoots, videos, and visuals.", color: 'gold' as const },
  { icon: DollarSign, title: "REVENUE STRATEGY", desc: "Maximising income streams across music, events, and brand.", color: 'purple' as const },
];

export default function ManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', stageName: '', role: 'DJ', email: '', phone: '', socialLink: '', bio: '' });

  const { content: hero } = useCMSContent('management', 'hero', {
    label: 'TALENT & CAREERS',
    heading: 'ASTROWAVE MANAGEMENT',
    subtext: 'We don\'t just manage talent — we build legacies. From DJs to artists, we turn passion into sustainable careers.',
    cta: 'JOIN OUR ROSTER'
  });

  const { content: servicesContent } = useCMSContent('management', 'services', {
    label: 'OUR SERVICES',
    heading: 'WHAT WE OFFER',
    subtitle: 'Everything a creative needs to grow.'
  });

  const { content: joinContent } = useCMSContent('management', 'join', {
    label: 'WORK WITH US',
    heading: 'JOIN THE ROSTER',
    subtext: 'Think you have what it takes to ride the wave? Submit your details and our team will be in touch.'
  });

  const talentQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent'), where('active', '==', true));
  }, [db]);

  const { data: talent, loading: talentLoading } = useCollection(talentQuery);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const inquiryData = { ...formData, timestamp: serverTimestamp() };
    const colRef = collection(db, 'talent_inquiries');

    addDoc(colRef, inquiryData)
      .then(() => {
        toast({ title: "Application Received!", description: "The team will review your profile." });
        setFormData({ name: '', stageName: '', role: 'DJ', email: '', phone: '', socialLink: '', bio: '' });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: inquiryData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(168, 85, 247, 0.12), transparent 70%)' }} />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show"><SectionLabel className="justify-center">{hero.label}</SectionLabel></motion.div>
          <motion.h1 variants={heroTextReveal} initial="hidden" animate="show" className="display-xl text-glow-purple mb-6 whitespace-pre-line">{hero.heading}</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.9 }} className="body-lg text-muted max-w-xl mx-auto mb-10">{hero.subtext}</motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 1.1 }}><Button size="lg" onClick={() => document.getElementById('join-roster')?.scrollIntoView({ behavior: 'smooth' })}>{hero.cta}</Button></motion.div>
        </div>
      </section>

      <section className="bg-surface py-32 px-6 lg:px-12 relative" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading label={servicesContent.label} title={servicesContent.heading} subtitle={servicesContent.subtitle} align="center" className="mb-20" />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="p-8 h-full group" glowColor={s.color}>
                  <s.icon size={32} className={cn("mb-6 transition-transform group-hover:scale-110", s.color === 'gold' ? 'text-gold' : s.color === 'purple' ? 'text-purple' : 'text-cyan')} />
                  <h3 className="font-display text-[1.4rem] text-white uppercase tracking-wider mb-2">{s.title}</h3>
                  <p className="body-md text-muted text-sm line-clamp-2">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading label="THE ROSTER" title="OUR TALENT" subtitle="The faces of AstroWave." align="center" className="mb-20" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {talentLoading ? [1, 2, 3].map(i => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-md border border-white/5" />) : talent && talent.length > 0 ? (
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="contents">
                {talent.map((item: any) => <motion.div key={item.id} variants={scaleIn}><TalentCard name={item.name} role={item.role as any} bio={item.bio} imageUrl={item.imageUrl || 'https://picsum.photos/seed/talent/400/400'} /></motion.div>)}
              </motion.div>
            ) : <div className="col-span-full text-center py-20"><p className="body-lg text-muted italic">Roster details coming soon.</p></div>}
          </div>
        </div>
      </section>

      <section id="join-roster" className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <SectionLabel className="justify-center">{joinContent.label}</SectionLabel>
            <h2 className="display-md text-glow-purple mb-4">{joinContent.heading}</h2>
            <p className="body-md text-muted">{joinContent.subtext}</p>
          </motion.div>
          <motion.div variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Card className="p-8 md:p-12">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold" placeholder="Stage Name" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select className="w-full bg-[#111118] border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option value="DJ">DJ</option><option value="Artist">Artist</option><option value="Influencer">Influencer</option></select>
                  <input required type="email" className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <textarea required rows={4} className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold resize-none" placeholder="Describe your sound..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                <Button disabled={isSubmitting} type="submit" size="lg" className="w-full">{isSubmitting ? <Loader2 className="animate-spin" /> : 'SUBMIT APPLICATION'}</Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
