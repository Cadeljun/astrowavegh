'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Instagram, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const EGOTICKETS_URL = 'https://egotickets.com/events/the-mask-mirage-party/register';

const TICKET_TYPES = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'GH¢50',
    unit: 'per person',
    badge: null,
  },
  {
    id: 'group',
    name: 'Group of 4',
    price: 'GH¢180',
    unit: 'per group',
    badge: 'Save GH¢20',
  },
  {
    id: 'complimentary',
    name: 'Complimentary',
    price: 'GH¢0.20',
    unit: 'invite only',
    badge: 'Invite',
  },
];

export default function TicketsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  const bgImage = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1789011146/tpjly1tuahsdasbgvzdb.png';

  return (
    <div className="min-h-screen relative" style={{ background: '#090909' }}>
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" style={{ opacity: 0.08 }} />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute right-0 top-1/3 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(218,175,72,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

        {/* ── FLYER ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(218,175,72,0.15)' }}>
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
          <h1 className="font-display text-4xl sm:text-5xl uppercase leading-[0.9] mb-3" style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}>
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
            <a href="https://maps.google.com/?q=Coaches+Lounge+East+Legon+Accra+Ghana"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MapPin size={14} style={{ color: '#DAAF48' }} />
              <span className="text-sm font-medium underline" style={{ color: '#F5F5F5' }}>COACHES LOUNGE, EAST LEGON</span>
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
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-1" style={{ background: 'rgba(218,175,72,0.05)', border: '1px solid rgba(218,175,72,0.12)' }}>
                  <span className="font-display text-xl" style={{ color: '#F5F5F5' }}>{String(item.value).padStart(2, '0')}</span>
                </div>
                <p className="text-[0.5rem] font-bold uppercase" style={{ color: '#B4B4B4' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TICKETS ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-8"
        >
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DAAF48' }}>SELECT TICKET</p>

          {TICKET_TYPES.map((ticket) => (
            <a
              key={ticket.id}
              href={EGOTICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left p-5 rounded-xl flex items-center justify-between transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg uppercase tracking-wider" style={{ color: '#F5F5F5' }}>{ticket.name}</h3>
                  {ticket.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-bold uppercase" style={{ background: 'rgba(218,175,72,0.1)', color: '#DAAF48' }}>
                      {ticket.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>{ticket.unit}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl" style={{ color: '#F5F5F5' }}>{ticket.price}</span>
                <ArrowRight size={16} style={{ color: '#DAAF48' }} />
              </div>
            </a>
          ))}

          {/* Table reservation */}
          <div className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h3 className="font-display text-base uppercase tracking-wider" style={{ color: '#F5F5F5' }}>Table Reservation</h3>
              <p className="text-xs" style={{ color: '#B4B4B4' }}>Premium tables with bottle service</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-[0.55rem] font-bold uppercase" style={{ background: 'rgba(218,175,72,0.06)', color: '#DAAF48' }}>
              Coming Soon
            </span>
          </div>
        </motion.div>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <div className="text-center pt-8 space-y-4">
          <a
            href="https://instagram.com/astrowaveevent"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-all"
            style={{ color: '#B4B4B4' }}
          >
            <Instagram size={14} />
            @ASTROWAVEEVENT
          </a>
          <p className="text-[0.45rem] uppercase tracking-widest" style={{ color: 'rgba(180,180,180,0.25)' }}>
            © 2026 AstroWave Entertainment
          </p>
        </div>
      </div>
    </div>
  );
}