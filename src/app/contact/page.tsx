'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Instagram, Loader2, Send, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { fadeUp, fadeIn, staggerContainer, scaleIn } from '@/lib/animations';
import { useCMSContent } from '@/lib/cms/useCMS';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Link from 'next/link';

function TikTokIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function YouTubeIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const enquiryTypes = [
  { value: 'Event Booking', icon: '🎭', desc: 'Book talent for your event' },
  { value: 'Talent Inquiry', icon: '🎤', desc: 'Join the AstroWave roster' },
  { value: 'Partnership', icon: '🤝', desc: 'Brand or media collaboration' },
  { value: 'General Enquiry', icon: '💬', desc: 'Anything else' },
];

const contactInfo = [
  { icon: Mail, label: 'EMAIL', value: 'astrowaveevent@gmail.com', href: 'mailto:astrowaveevent@gmail.com' },
  { icon: Phone, label: 'CALL', value: 'Available on request', href: null },
  { icon: MapPin, label: 'LOCATION', value: 'Accra, Ghana', href: null },
  { icon: Clock, label: 'HOURS', value: 'Mon - Sat, 9AM - 6PM GMT', href: null },
];

export default function ContactPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });

  const { content: hero } = useCMSContent('contact', 'hero', {
    label: 'GET IN TOUCH',
    heading: "LET'S TALK.",
    subtext: 'Bookings, partnerships, talent inquiries — we\'re ready when you are.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const contactData = { ...formData, timestamp: serverTimestamp() };
    const colRef = collection(db, 'contacts');

    addDoc(colRef, contactData)
      .then(() => {
        toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
        setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
        setSubmitted(true);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: contactData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  const socials = [
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/astrowaveevent' },
    { icon: TikTokIcon, label: 'TikTok', href: 'https://tiktok.com/@astrowaveevent' },
    { icon: YouTubeIcon, label: 'YouTube', href: 'https://youtube.com/@astrowaveevent' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden bg-[#020B18]">
        <div className="absolute inset-0 z-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0, 200, 83, 0.12), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[1]" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div variants={fadeIn} initial="hidden" animate="show">
            <p className="text-[0.65rem] font-bold text-[#00C853] uppercase tracking-[0.35em] mb-4">{hero.label}</p>
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="font-display uppercase leading-[0.9] text-white mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
            {hero.heading}
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
            {hero.subtext}
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ──────────────────────────────────── */}
      <section className="px-6 lg:px-12 -mt-8 relative z-10">
        <div className="max-w-screen-2xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, i) => (
              <motion.div key={info.label} variants={scaleIn} className="bg-white rounded-2xl border border-[#C8E6D4] p-6 text-center hover:border-[#00C853] transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 rounded-xl bg-[#00C853]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#00C853]/20 transition-colors">
                  <info.icon size={20} className="text-[#00C853]" />
                </div>
                <p className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest mb-2">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="text-sm font-medium text-[#0B1F14] hover:text-[#00C853] transition-colors">{info.value}</a>
                ) : (
                  <p className="text-sm font-medium text-[#0B1F14]">{info.value}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FORM + SOCIAL ───────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-7">
            {submitted ? (
              <div className="bg-[#F0FAF5] border border-[#C8E6D4] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-6">
                  <Send size={32} className="text-[#00C853]" />
                </div>
                <h3 className="font-display text-2xl text-[#0B1F14] uppercase mb-3">Message Sent!</h3>
                <p className="text-[#567060] mb-6">We'll get back to you within 24 hours.</p>
                <Button onClick={() => setSubmitted(false)} variant="ghost" className="border border-[#C8E6D4]">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#C8E6D4] p-8 md:p-12">
                <h2 className="font-display text-2xl text-[#0B1F14] uppercase mb-2">Send a Message</h2>
                <p className="text-[#567060] text-sm mb-8">Fill in the form and we'll respond as soon as possible.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Enquiry type */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {enquiryTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, subject: type.value})}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          formData.subject === type.value
                            ? 'border-[#00C853] bg-[#00C853]/5 shadow-sm'
                            : 'border-[#C8E6D4] hover:border-[#00C853]/50'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-[0.6rem] font-bold text-[#0B1F14] uppercase tracking-wider">{type.value}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest mb-2 block">Full Name *</label>
                      <input required className="w-full bg-[#F0FAF5] border border-[#C8E6D4] rounded-xl p-4 text-[#0B1F14] focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 outline-none transition-all text-sm" placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest mb-2 block">Email *</label>
                      <input required type="email" className="w-full bg-[#F0FAF5] border border-[#C8E6D4] rounded-xl p-4 text-[#0B1F14] focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 outline-none transition-all text-sm" placeholder="you@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest mb-2 block">Phone (Optional)</label>
                    <input className="w-full bg-[#F0FAF5] border border-[#C8E6D4] rounded-xl p-4 text-[#0B1F14] focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 outline-none transition-all text-sm" placeholder="+233 xxx xxx xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest mb-2 block">Message *</label>
                    <textarea required rows={5} className="w-full bg-[#F0FAF5] border border-[#C8E6D4] rounded-xl p-4 text-[#0B1F14] focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 outline-none transition-all text-sm resize-none" placeholder="Tell us about your event, inquiry, or idea..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                  </div>

                  <Button disabled={loading} type="submit" size="lg" className="w-full h-14 text-sm font-bold tracking-[0.15em]">
                    {loading ? <Loader2 className="animate-spin" /> : 'SEND MESSAGE'}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-5 space-y-8">
            {/* Quick links */}
            <div className="bg-[#020B18] rounded-2xl p-8 text-white">
              <h3 className="font-display text-xl uppercase mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link href="/auth/register" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div>
                    <p className="font-bold text-sm">Book Talent</p>
                    <p className="text-white/50 text-xs">Find DJs, MCs, performers</p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 group-hover:text-[#00C853] transition-colors" />
                </Link>
                <Link href="/events" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div>
                    <p className="font-bold text-sm">Browse Events</p>
                    <p className="text-white/50 text-xs">See what's happening in Ghana</p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 group-hover:text-[#00C853] transition-colors" />
                </Link>
                <Link href="/management" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div>
                    <p className="font-bold text-sm">Join the Roster</p>
                    <p className="text-white/50 text-xs">Apply as talent</p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 group-hover:text-[#00C853] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-[#C8E6D4] p-8">
              <h3 className="font-display text-xl text-[#0B1F14] uppercase mb-2">Follow the Wave</h3>
              <p className="text-[#567060] text-sm mb-6">Stay updated on events, talent, and culture.</p>
              <div className="space-y-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#C8E6D4] hover:border-[#00C853] hover:bg-[#F0FAF5] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#020B18] flex items-center justify-center">
                      <social.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0B1F14]">{social.label}</p>
                      <p className="text-[0.65rem] text-[#567060]">@astrowaveevent</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-[#C8E6D4] group-hover:text-[#00C853] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
