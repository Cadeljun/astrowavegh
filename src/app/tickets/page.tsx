'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, ExternalLink, Instagram, ShieldCheck } from 'lucide-react';
import { trackBeginCheckout } from '@/components/GoogleAnalytics';
import { EGOTICKETS_URL } from '@/lib/tickets';

export default function TicketsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    trackBeginCheckout();
  }, []);

  useEffect(() => {
    const eventDate = new Date('2026-10-10T21:00:00').getTime();
    const timer = setInterval(() => {
      const diff = eventDate - Date.now();
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

  // Background image from Cloudinary
  const bgImage = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1789011146/tpjly1tuahsdasbgvzdb.png';

  return (
    <div className="min-h-screen relative" style={{ background: '#090909' }}>
      {/* Background image with reduced opacity */}
      <div className="fixed inset-0 z-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.08 }}
        />
      </div>

      {/* Subtle glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute right-0 top-1/3 w-[600px] h-[600px]"
          style={{ background: 'radial-gradient(circle, rgba(218,175,72,0.06) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* ── FLYER ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(218,175,72,0.15)' }}>
            <img
              src="https://res.cloudinary.com/dmd5bq3va/image/upload/v1786593422/gkbqxs9qvggzxd0ocy77.jpg"
              alt="Mask Mirage Party"
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* ── EVENT INFO ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1
            className="font-display text-4xl sm:text-5xl uppercase leading-[0.9] mb-3"
            style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}
          >
            MASK MIRAGE
          </h1>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-6" style={{ color: '#DAAF48' }}>
            THE MASK MIRAGE PARTY 🎭
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: '#DAAF48' }} />
              <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>10 OCT 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: '#DAAF48' }} />
              <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>9:00 PM</span>
            </div>
            <a
              href="https://maps.google.com/?q=Coaches+Lounge+East+Legon+Accra+Ghana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <MapPin size={14} style={{ color: '#DAAF48' }} />
              <span className="text-sm font-medium underline" style={{ color: '#F5F5F5' }}>
                COACHES LOUNGE, EAST LEGON
              </span>
            </a>
          </div>

          {/* Countdown */}
          <div className="flex justify-center gap-3">
            {[
              { value: timeLeft.days, label: 'D' },
              { value: timeLeft.hours, label: 'H' },
              { value: timeLeft.minutes, label: 'M' },
              { value: timeLeft.seconds, label: 'S' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-1"
                  style={{ background: 'rgba(218,175,72,0.05)', border: '1px solid rgba(218,175,72,0.12)' }}
                >
                  <span className="font-display text-xl" style={{ color: '#F5F5F5' }}>
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[0.5rem] font-bold uppercase" style={{ color: '#B4B4B4' }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TICKETS ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#DAAF48' }}>
              OFFICIAL TICKETS
            </p>
            <div className="flex items-center gap-1.5 text-[0.65rem] font-medium" style={{ color: '#00C853' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
              <span>Available Now</span>
            </div>
          </div>

          {/* Standard Ticket Card linking directly to eGoTickets */}
          <a
            href={EGOTICKETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBeginCheckout()}
            className="group block p-6 rounded-2xl transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(218,175,72,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(218,175,72,0.3)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-2xl uppercase tracking-wider" style={{ color: '#F5F5F5' }}>
                    Standard Ticket
                  </h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest"
                    style={{
                      background: 'rgba(218,175,72,0.15)',
                      color: '#DAAF48',
                      border: '1px solid rgba(218,175,72,0.35)',
                    }}
                  >
                    Standard
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#B4B4B4' }}>
                  Per person • Full access to Mask Mirage with top DJs, live entertainment, and immersive masquerade experience.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[0.7rem] font-medium" style={{ color: '#DAAF48' }}>
                  <ShieldCheck size={14} />
                  <span>Direct checkout via eGoTickets</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                <div className="text-left sm:text-right">
                  <span className="text-[0.6rem] uppercase tracking-wider block font-semibold" style={{ color: '#B4B4B4' }}>
                    Price
                  </span>
                  <span className="font-display text-3xl sm:text-4xl" style={{ color: '#DAAF48' }}>
                    GH¢50
                  </span>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#e4be5c]"
                  style={{ background: '#DAAF48', color: '#090909' }}
                >
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </a>

          {/* Primary Action Button */}
          <a
            href={EGOTICKETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBeginCheckout()}
            className="w-full h-14 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            style={{
              background: '#DAAF48',
              color: '#090909',
              boxShadow: '0 4px 20px rgba(218,175,72,0.25)',
            }}
          >
            <Ticket size={18} />
            <span>Register on eGoTickets</span>
            <ExternalLink size={16} />
          </a>

          <p className="text-center text-[0.65rem] tracking-wider uppercase pt-2" style={{ color: 'rgba(180,180,180,0.6)' }}>
            Official Ticketing Partner: <span style={{ color: '#DAAF48' }}>eGoTickets Ghana</span>
          </p>
        </motion.div>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <div className="text-center pt-8 space-y-4">
          <a
            href="https://instagram.com/astrowaveevent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-all hover:text-[#DAAF48]"
            style={{ color: '#B4B4B4' }}
          >
            <Instagram size={14} />
            @ASTROWAVEEVENT
          </a>
          <p className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(180,180,180,0.3)' }}>
            © 2026 AstroWave Entertainment • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
