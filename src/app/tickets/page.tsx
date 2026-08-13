'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Users, Music, ArrowRight, Loader2, CheckCircle, Instagram, ExternalLink, X, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';
import { generateTicketId } from '@/lib/tickets';

// Ticket types
const TICKETS = [
  {
    id: 'standard',
    name: 'GENERAL ADMISSION',
    price: 50,
    perUnit: 'per person',
    description: 'Standard entry',
    features: ['Entry to event', 'Access to main area', 'Complimentary mask'],
  },
  {
    id: 'group',
    name: 'GROUP OF 4',
    price: 180,
    perUnit: 'per group',
    description: 'Squad deal — save GH¢20',
    features: ['4 entries', 'Priority entry', 'Complimentary masks', 'Save GH¢20'],
    popular: true,
  },
];

export default function TicketsPage() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [previewTicketId] = useState(generateTicketId());

  // Countdown
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

  const selectedTicketData = TICKETS.find(t => t.id === selectedTicket);

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setShowCheckout(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketData || !formData.email || !formData.name) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: selectedTicketData.price,
          ticketType: selectedTicketData.name,
          name: formData.name,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Payment failed');
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* Subtle golden glow background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20" style={{ background: 'radial-gradient(circle, rgba(218,175,72,0.3) 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ── HEADER ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-[18px] font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: '#DAAF48' }}>
            ASTROWAVE EVENTS
          </p>
          <h1 className="font-display uppercase leading-[0.9] mb-4" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', color: '#F5F5F5', letterSpacing: '-0.02em' }}>
            MASK<br />MIRAGE
          </h1>
          <p className="text-[22px] font-bold uppercase tracking-[0.15em] mb-8" style={{ color: '#DAAF48' }}>
            THE MASK MIRAGE PARTY 🎭
          </p>

          {/* Event details */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: '#DAAF48' }} />
              <span className="text-[28px] font-semibold" style={{ color: '#F5F5F5', letterSpacing: '0.05em' }}>10 OCTOBER 2026</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: '#DAAF48' }} />
              <span className="text-[28px] font-semibold" style={{ color: '#F5F5F5', letterSpacing: '0.05em' }}>9:00 PM</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} style={{ color: '#DAAF48' }} />
              <span className="text-[28px] font-semibold" style={{ color: '#F5F5F5', letterSpacing: '0.05em' }}>COACHES LOUNGE, EAST LEGON</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex justify-center gap-4 mb-12">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins' },
              { value: timeLeft.seconds, label: 'Secs' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(218,175,72,0.05)', border: '1px solid rgba(218,175,72,0.15)' }}>
                  <span className="font-display text-3xl" style={{ color: '#F5F5F5' }}>{String(item.value).padStart(2, '0')}</span>
                </div>
                <p className="text-[0.55rem] font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TICKET PREVIEW ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <div className="transform scale-75 lg:scale-90 origin-top">
            <MaskMirageTicket
              ticketId={previewTicketId}
              name="Your Name"
              ticketType="GENERAL ADMISSION"
            />
          </div>
        </motion.div>

        {/* ── TICKET SELECTION ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-[14px] font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: '#DAAF48' }}>ADMISSION</p>
            <h2 className="font-display text-3xl uppercase" style={{ color: '#F5F5F5' }}>GET YOUR TICKET</h2>
          </div>

          <div className="space-y-4 mb-8">
            {TICKETS.map((ticket) => (
              <motion.button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left p-6 rounded-xl transition-all"
                style={{
                  background: selectedTicket === ticket.id ? 'rgba(218,175,72,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedTicket === ticket.id ? 'rgba(218,175,72,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl uppercase tracking-wider" style={{ color: '#F5F5F5' }}>{ticket.name}</h3>
                      {ticket.popular && (
                        <span className="px-3 py-1 rounded-full text-[0.55rem] font-bold uppercase tracking-widest" style={{ background: 'rgba(218,175,72,0.1)', color: '#DAAF48', border: '1px solid rgba(218,175,72,0.2)' }}>
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-3" style={{ color: '#B4B4B4' }}>{ticket.description}</p>
                    <div className="space-y-1">
                      {ticket.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle size={12} style={{ color: '#DAAF48' }} />
                          <span className="text-[0.7rem]" style={{ color: '#B4B4B4' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-[0.55rem] font-bold uppercase tracking-widest mb-1" style={{ color: '#B4B4B4' }}>Price</p>
                    <p className="font-display text-3xl" style={{ color: '#F5F5F5' }}>GH¢{ticket.price}</p>
                    <p className="text-[0.55rem]" style={{ color: '#B4B4B4' }}>{ticket.perUnit}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Table reservation */}
          <div className="p-5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="font-display text-lg uppercase tracking-wider" style={{ color: '#F5F5F5' }}>Table Reservation</h3>
              <p className="text-xs" style={{ color: '#B4B4B4' }}>Premium tables with bottle service</p>
            </div>
            <span className="px-4 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-widest" style={{ background: 'rgba(218,175,72,0.08)', color: '#DAAF48', border: '1px solid rgba(218,175,72,0.15)' }}>
              Coming Soon
            </span>
          </div>
        </motion.div>

        {/* ── CHECKOUT ─────────────────────────────────────── */}
        <AnimatePresence>
          {showCheckout && selectedTicketData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
              <div className="relative z-10 w-full max-w-md rounded-2xl p-8" style={{ background: '#090909', border: '1px solid rgba(218,175,72,0.2)' }}>
                <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4" style={{ color: '#B4B4B4' }}>
                  <X size={20} />
                </button>

                <div className="text-center mb-6">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#DAAF48' }}>Complete Your Purchase</p>
                  <h3 className="font-display text-2xl uppercase" style={{ color: '#F5F5F5' }}>{selectedTicketData.name}</h3>
                  <p className="font-display text-3xl mt-2" style={{ color: '#DAAF48' }}>GH¢{selectedTicketData.price}</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="text-[0.55rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Full Name</label>
                    <input
                      required
                      className="w-full p-4 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
                      placeholder="Your name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[0.55rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Email</label>
                    <input
                      required
                      type="email"
                      className="w-full p-4 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <p className="text-[0.5rem] mt-1" style={{ color: '#B4B4B4' }}>Your ticket will be sent here</p>
                  </div>
                  <div>
                    <label className="text-[0.55rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Phone (Optional)</label>
                    <input
                      className="w-full p-4 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
                      placeholder="+233 xxx xxx xxxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-lg font-bold text-sm uppercase tracking-[0.15em] text-black transition-all"
                    style={{ background: '#DAAF48' }}
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : `PAY GH¢${selectedTicketData.price}`}
                  </button>

                  <p className="text-center text-[0.5rem]" style={{ color: '#B4B4B4' }}>
                    Secure payment powered by Paystack
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <div className="text-center mt-16 space-y-4">
          <a
            href="https://instagram.com/astrowaveevent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition-all"
            style={{ border: '1px solid rgba(218,175,72,0.2)', color: '#DAAF48' }}
          >
            <Instagram size={14} />
            FOLLOW @ASTROWAVEEVENT
          </a>
          <p className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(180,180,180,0.3)' }}>
            © 2026 AstroWave Entertainment • Accra, Ghana
          </p>
        </div>
      </div>
    </div>
  );
}
