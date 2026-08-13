'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Users, Music, ArrowRight, Loader2, CheckCircle, Instagram, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Event details
const EVENT = {
  name: 'MASK MIRAGE PARTY',
  tagline: 'An Elegant Masquerade Experience',
  date: 'Friday, 10th October 2026',
  time: '9:00 PM - Till Late',
  venue: 'TBA — Accra, Ghana',
  description: 'An unforgettable night of mystery, music, and premium vibes. DJs, live performances, cocktails, and an atmosphere like no other. Masks on. Lights low. Let the night take over.',
  highlights: [
    { icon: Music, text: 'Live DJs & Performers' },
    { icon: Users, text: 'Exclusive Guest List' },
    { icon: Ticket, text: 'Limited Tickets Available' },
  ],
  socials: {
    instagram: 'https://instagram.com/astrowaveevent',
  }
};

export default function TicketsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer
  useEffect(() => {
    const eventDate = new Date('2026-10-10T21:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = eventDate - now;
      
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020B18] flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#00C853]/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Grid pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-8" />
          </Link>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          {/* Event badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[0.6rem] font-bold text-purple-400 uppercase tracking-widest">Upcoming Event</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-[0.9] mb-4"
            >
              MASK<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #00C853)' }}>
                MIRAGE
              </span>
            </motion.h1>
            <p className="text-white/50 text-lg">{EVENT.tagline}</p>
          </div>

          {/* Event details card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 space-y-6">
            {/* Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Calendar size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Date</p>
                  <p className="text-white font-medium">{EVENT.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 flex items-center justify-center">
                  <Clock size={18} className="text-[#00C853]" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Time</p>
                  <p className="text-white font-medium">{EVENT.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MapPin size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Venue</p>
                  <p className="text-white font-medium">{EVENT.venue}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed">{EVENT.description}</p>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3">
              {EVENT.highlights.map((h, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-white/5">
                  <h.icon size={16} className="mx-auto mb-2 text-purple-400" />
                  <p className="text-[0.55rem] font-bold text-white/60 uppercase tracking-wider">{h.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins' },
              { value: timeLeft.seconds, label: 'Secs' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="font-display text-2xl sm:text-3xl text-white">{String(item.value).padStart(2, '0')}</p>
                <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <a
              href="https://instagram.com/astrowaveevent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl font-bold text-sm tracking-[0.15em] uppercase text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #A855F7, #00C853)', boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}
            >
              <Instagram size={18} />
              DM FOR TICKETS
              <ArrowRight size={16} />
            </a>

            <a
              href="https://instagram.com/astrowaveevent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white/60 border border-white/10 hover:border-white/25 hover:text-white transition-all"
            >
              <ExternalLink size={14} />
              FOLLOW @ASTROWAVEEVENT FOR UPDATES
            </a>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-[0.55rem] font-bold text-white/20 uppercase tracking-widest">Organized by</p>
            <p className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider">AstroWave Entertainment</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
