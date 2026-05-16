'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Clock, Instagram, Twitter, Music, Youtube, Facebook, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/Button';
import { fadeUp, fadeIn, staggerContainer } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';

export default function ContactPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' });

  const { content: hero } = useCMSContent('contact', 'hero', {
    label: 'GET IN TOUCH',
    heading: "LET'S TALK.",
    subtext: 'Bookings, partnerships, talent inquiries — we\'re ready when you are.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contacts'), { ...formData, timestamp: serverTimestamp() });
      toast({ title: "Message sent!" });
      setFormData({ name: '', email: '', subject: 'General Enquiry', message: '' });
    } catch { toast({ variant: "destructive", title: "Error" }); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden bg-[var(--color-black)]">
        <div className="absolute inset-0 z-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 209, 102, 0.1), transparent)' }} />
        <div className="relative z-10 text-center px-6">
          <motion.div variants={fadeIn} initial="hidden" animate="show"><SectionLabel className="justify-center">{hero.label}</SectionLabel></motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="display-xl text-glow-gold mb-4">{hero.heading}</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="body-md text-[var(--color-muted)]">{hero.subtext}</motion.p>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-7">
            <Card className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required type="email" className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <select className="w-full bg-[#111118] border border-border rounded-sm p-4 font-body text-white" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}><option value="Event Booking">Event Booking</option><option value="Talent Inquiry">Talent Inquiry</option><option value="General Enquiry">General Enquiry</option></select>
                <textarea required rows={5} className="w-full bg-white/5 border border-border rounded-sm p-4 font-body text-white resize-none" placeholder="Message..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                <Button disabled={loading} type="submit" size="lg" className="w-full">{loading ? <Loader2 className="animate-spin" /> : 'SEND MESSAGE'}</Button>
              </form>
            </Card>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <div className="flex gap-6"><Mail size={20} className="text-gold" /><div><h4 className="label mb-1">EMAIL US</h4><p className="body-md text-white">info@astrowave.live</p></div></div>
              <Divider className="opacity-10 my-0" /><div className="flex gap-6"><MapPin size={20} className="text-gold" /><div><h4 className="label mb-1">BASED IN</h4><p className="body-md text-white">Accra, Ghana</p></div></div>
              <Divider className="opacity-10 my-0" /><div className="space-y-4"><h4 className="label">FOLLOW THE WAVE</h4><div className="flex gap-4">{[Instagram, Twitter, Music].map((Icon, i) => <Icon key={i} size={18} className="text-muted" />)}</div></div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}