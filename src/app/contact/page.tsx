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

export default function ContactPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Enquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        timestamp: serverTimestamp(),
      });
      
      toast({
        title: "Message sent!",
        description: "We'll catch the wave back to you soon.",
      });

      setFormData({ name: '', email: '', subject: 'General Enquiry', message: '' });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const socialIcons = [Instagram, Twitter, Music, Youtube, Facebook];

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden bg-[var(--color-black)]">
        <div 
          className="absolute inset-0 z-0 opacity-30"
          style={{ 
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 209, 102, 0.1), transparent)' 
          }}
        />
        <div className="relative z-10 text-center px-6">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <SectionLabel className="justify-center">GET IN TOUCH</SectionLabel>
          </motion.div>
          <motion.h1 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            className="display-xl text-glow-gold mb-4"
          >
            LET&apos;S TALK.
          </motion.h1>
          <motion.p 
            variants={fadeUp} 
            initial="hidden" 
            animate="show" 
            transition={{ delay: 0.2 }}
            className="body-md text-[var(--color-muted)]"
          >
            Bookings, partnerships, talent inquiries — we&apos;re ready when you are.
          </motion.p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form */}
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <Card className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Full Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-[var(--color-border)] rounded-sm p-4 font-body text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold-dim)] transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[0.65rem]">Email Address</label>
                    <input 
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-[var(--color-border)] rounded-sm p-4 font-body text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold-dim)] transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label text-[0.65rem]">Subject</label>
                  <select 
                    className="w-full bg-[#111118] border border-[var(--color-border)] rounded-sm p-4 font-body text-white focus:outline-none focus:border-[var(--color-gold)] transition-all appearance-none cursor-pointer"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="Event Booking">Event Booking</option>
                    <option value="Talent Inquiry">Talent Inquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label text-[0.65rem]">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell us about the wave you want to create..."
                    className="w-full bg-white/5 border border-[var(--color-border)] rounded-sm p-4 font-body text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold-dim)] transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button 
                  disabled={loading} 
                  type="submit" 
                  size="lg" 
                  className="w-full group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <>
                      SEND MESSAGE
                      <Send size={16} className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Info */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-12"
          >
            <div className="space-y-8">
              <motion.div variants={fadeUp} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 glass rounded-full flex items-center justify-center text-[var(--color-gold)]">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="label mb-1">EMAIL US</h4>
                  <p className="body-md text-white font-medium">info@astrowave.live</p>
                </div>
              </motion.div>

              <Divider className="opacity-10 my-0" />

              <motion.div variants={fadeUp} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 glass rounded-full flex items-center justify-center text-[var(--color-gold)]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="label mb-1">BASED IN</h4>
                  <p className="body-md text-white font-medium">Accra, Ghana</p>
                </div>
              </motion.div>

              <Divider className="opacity-10 my-0" />

              <motion.div variants={fadeUp} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 glass rounded-full flex items-center justify-center text-[var(--color-gold)]">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="label mb-1">RESPONSE TIME</h4>
                  <p className="body-md text-white font-medium">Within 24–48 hours</p>
                </div>
              </motion.div>

              <Divider className="opacity-10 my-0" />

              <motion.div variants={fadeUp} className="space-y-4">
                <h4 className="label">FOLLOW THE WAVE</h4>
                <div className="flex gap-4">
                  {socialIcons.map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
