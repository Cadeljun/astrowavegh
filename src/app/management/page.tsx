'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  CalendarCheck, 
  Megaphone, 
  TrendingUp, 
  Smartphone, 
  Music, 
  Camera, 
  DollarSign,
  Loader2,
  Send
} from 'lucide-react';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import TalentCard from '@/components/talent/TalentCard';
import { fadeUp, fadeIn, staggerContainer, scaleIn, heroTextReveal } from '@/lib/animations';
import { cn } from '@/lib/utils';

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

const stats = [
  { value: '2+', label: 'DJs Managed' },
  { value: '1', label: 'Artist Signed' },
  { value: '100%', label: 'Commitment' },
  { value: '∞', label: 'Potential' },
];

export default function ManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stageName: '',
    role: 'DJ',
    email: '',
    phone: '',
    socialLink: '',
    bio: ''
  });

  const talentQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent'), where('active', '==', true));
  }, [db]);

  const { data: talent, loading: talentLoading } = useCollection(talentQuery);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'talent_inquiries'), {
        ...formData,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Application Received!",
        description: "The team will review your profile and catch the wave back.",
      });

      setFormData({
        name: '',
        stageName: '',
        role: 'DJ',
        email: '',
        phone: '',
        socialLink: '',
        bio: ''
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollToJoin = () => {
    const el = document.getElementById('join-roster');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO */}
      <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{ 
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(168, 85, 247, 0.12), transparent 70%)' 
          }}
        />
        {/* Grain overlay is global via body::before */}
        
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
          <span className="font-display text-[20rem] text-white opacity-[0.02] leading-none tracking-tighter hidden lg:block">
            MGMT
          </span>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <SectionLabel className="justify-center">TALENT & CAREERS</SectionLabel>
          </motion.div>
          <motion.h1 
            variants={heroTextReveal} 
            initial="hidden" 
            animate="show" 
            className="display-xl text-glow-purple mb-6 whitespace-pre-line"
          >
            ASTROWAVE{'\n'}MANAGEMENT
          </motion.h1>
          <motion.p 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.9 }}
            className="body-lg text-muted max-w-xl mx-auto mb-10"
          >
            We don&apos;t just manage talent — we build legacies. From DJs to artists, we turn passion into sustainable careers.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 1.1 }}
          >
            <Button size="lg" onClick={handleScrollToJoin}>JOIN OUR ROSTER</Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: WHAT WE OFFER */}
      <section className="bg-surface py-32 px-6 lg:px-12 relative" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="OUR SERVICES"
            title="WHAT WE OFFER"
            subtitle="Everything a creative needs to grow."
            align="center"
            className="mb-20"
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} variants={scaleIn}>
                  <Card className="p-8 h-full group" glowColor={s.color}>
                    <Icon size={32} className={cn(
                      "mb-6 transition-transform group-hover:scale-110",
                      s.color === 'gold' ? 'text-gold' : s.color === 'purple' ? 'text-purple' : 'text-cyan'
                    )} />
                    <h3 className="font-display text-[1.4rem] text-white uppercase tracking-wider mb-2">{s.title}</h3>
                    <p className="body-md text-muted text-sm line-clamp-2">{s.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: TALENT ROSTER */}
      <section className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-screen-2xl mx-auto">
          <SectionHeading 
            label="THE ROSTER"
            title="OUR TALENT"
            subtitle="The faces of AstroWave."
            align="center"
            className="mb-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {talentLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-md border border-white/5" />
              ))
            ) : talent && talent.length > 0 ? (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="contents"
              >
                {talent.map((item: any) => (
                  <motion.div key={item.id} variants={scaleIn}>
                    <TalentCard 
                      name={item.name}
                      role={item.role as any}
                      bio={item.bio}
                      imageUrl={item.imageUrl || 'https://picsum.photos/seed/talent/400/400'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="body-lg text-muted italic">Roster details coming soon. The wave is rising.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY ASTROWAVE */}
      <section className="py-32 px-6 lg:px-12 bg-surface relative" style={{ clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
            <div>
              <SectionLabel>WHY US</SectionLabel>
              <h2 className="display-md mb-6 text-white">We Grow With You.</h2>
              <div className="space-y-6 text-muted body-md">
                <p>AstroWave Management is not a transactional agency. We are partners invested in your long-term success.</p>
                <p>We bring together event access, media connections, brand relationships, and creative direction — all under one roof.</p>
                <p>Our talent doesn&apos;t just perform. They build empires.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-display text-[2.5rem] text-gold leading-none">{stat.value}</div>
                  <div className="label text-[0.65rem]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            className="space-y-6"
          >
            <motion.div variants={fadeIn}>
              <Card className="p-10 relative overflow-hidden group">
                <span className="absolute -top-4 -right-4 text-7xl font-display text-gold opacity-[0.05] leading-none pointer-events-none">"</span>
                <p className="body-lg text-white font-medium mb-6 italic leading-relaxed">
                  "AstroWave didn&apos;t just book me shows. They built my brand from the ground up."
                </p>
                <div className="flex flex-col">
                  <span className="font-body font-bold text-white uppercase tracking-widest text-sm">— DJ Horizon</span>
                  <span className="font-body text-muted text-xs uppercase tracking-widest">AstroWave DJ</span>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} transition={{ delay: 0.2 }}>
              <Card className="p-10 relative overflow-hidden group">
                <span className="absolute -top-4 -right-4 text-7xl font-display text-purple opacity-[0.05] leading-none pointer-events-none">"</span>
                <p className="body-lg text-white font-medium mb-6 italic leading-relaxed">
                  "The support, strategy, and network AstroWave brings is unmatched in Ghana&apos;s creative scene."
                </p>
                <div className="flex flex-col">
                  <span className="font-body font-bold text-white uppercase tracking-widest text-sm">— Uzy</span>
                  <span className="font-body text-muted text-xs uppercase tracking-widest">AstroWave Artist</span>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: JOIN THE ROSTER */}
      <section id="join-roster" className="py-32 px-6 lg:px-12 bg-black">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionLabel className="justify-center">WORK WITH US</SectionLabel>
            <h2 className="display-md text-glow-purple mb-4">JOIN THE ROSTER</h2>
            <p className="body-md text-muted">
              Think you have what it takes to ride the wave? Submit your details and our team will be in touch.
            </p>
          </motion.div>

          <motion.div 
            variants={scaleIn} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
          >
            <Card className="p-8 md:p-12">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Full Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Stage Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="DJ Wave"
                      value={formData.stageName}
                      onChange={e => setFormData({...formData, stageName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Role</label>
                    <select 
                      className="w-full bg-[#111118] border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="DJ">DJ</option>
                      <option value="Artist">Artist</option>
                      <option value="Influencer">Influencer</option>
                      <option value="Model">Model</option>
                      <option value="Content Creator">Content Creator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Email Address</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Phone Number</label>
                    <input 
                      type="tel"
                      className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="+233 00 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Social Media Link</label>
                    <input 
                      type="url"
                      className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all"
                      placeholder="instagram.com/yourhandle"
                      value={formData.socialLink}
                      onChange={e => setFormData({...formData, socialLink: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label text-[0.65rem]">Tell Us About Yourself</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white focus:outline-none focus:border-gold transition-all resize-none"
                    placeholder="Describe your sound, your reach, and your vision..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <Button 
                  disabled={isSubmitting} 
                  type="submit" 
                  size="lg" 
                  className="w-full group"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <>
                      SUBMIT APPLICATION
                      <Send size={16} className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
