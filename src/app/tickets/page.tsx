'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Users, Music, ArrowRight, Loader2, CheckCircle, Instagram, ExternalLink, X, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Ticket types
const TICKETS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 50,
    perUnit: 'per person',
    description: 'General admission',
    features: ['Entry to event', 'Access to main area', 'Complimentary mask'],
    popular: false,
  },
  {
    id: 'group',
    name: 'Group of 4',
    price: 180,
    perUnit: 'per group',
    description: 'Squad deal — save GHS 20',
    features: ['4 entries', 'Priority entry for group', 'Complimentary masks', 'Save GHS 20'],
    popular: true,
  },
];

// Event details
const EVENT = {
  name: 'MASK MIRAGE PARTY',
  tagline: 'An Elegant Masquerade Experience',
  date: 'Friday, 10th October 2026',
  time: '9:00 PM - Till Late',
  venue: 'TBA — Accra, Ghana',
  description: 'An unforgettable night of mystery, music, and premium vibes. DJs, live performances, cocktails, and an atmosphere like no other. Masks on. Lights low. Let the night take over.',
};

export default function TicketsPage() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

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
      // Initialize Paystack payment
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

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/tickets" className="flex items-center gap-3">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-8" />
          </Link>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl"
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

          {/* Event details */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Calendar size={16} className="mx-auto mb-2 text-purple-400" />
                <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Date</p>
                <p className="text-white text-xs font-medium mt-1">{EVENT.date}</p>
              </div>
              <div>
                <Clock size={16} className="mx-auto mb-2 text-[#00C853]" />
                <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Time</p>
                <p className="text-white text-xs font-medium mt-1">{EVENT.time}</p>
              </div>
              <div>
                <MapPin size={16} className="mx-auto mb-2 text-blue-400" />
                <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Venue</p>
                <p className="text-white text-xs font-medium mt-1">{EVENT.venue}</p>
              </div>
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
                <p className="font-display text-2xl text-white">{String(item.value).padStart(2, '0')}</p>
                <p className="text-[0.5rem] font-bold text-white/40 uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Ticket Selection */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Ticket size={18} className="text-purple-400" />
              <h2 className="font-display text-xl text-white uppercase tracking-wider">Select Your Ticket</h2>
            </div>

            {TICKETS.map((ticket) => (
              <motion.button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-6 rounded-2xl border transition-all ${
                  selectedTicket === ticket.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg text-white uppercase tracking-wider">{ticket.name}</h3>
                      {ticket.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[0.55rem] font-bold uppercase tracking-widest">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mb-3">{ticket.description}</p>
                    <div className="space-y-1">
                      {ticket.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle size={10} className="text-[#00C853]" />
                          <span className="text-white/60 text-[0.65rem]">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-[0.55rem] font-bold text-white/40 uppercase">Price</p>
                    <p className="font-display text-2xl text-white">GHS {ticket.price}</p>
                    <p className="text-white/40 text-[0.55rem]">{ticket.perUnit}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Checkout Form */}
          <AnimatePresence>
            {showCheckout && selectedTicketData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-purple-400" />
                    <h3 className="font-display text-lg text-white uppercase tracking-wider">Checkout</h3>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedTicketData.name} Ticket</p>
                    <p className="text-white/50 text-xs">Mask Mirage Party</p>
                  </div>
                  <p className="font-display text-xl text-[#00C853]">GHS {selectedTicketData.price}</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Full Name</label>
                    <input
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <p className="text-white/30 text-[0.55rem] mt-1">Your ticket will be sent to this email</p>
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Phone (Optional)</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm"
                      placeholder="+233 xxx xxx xxxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full h-14 rounded-xl font-bold text-sm tracking-[0.15em] uppercase text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #00C853)', boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={18} />
                        PAY GHS {selectedTicketData.price}
                      </>
                    )}
                  </button>

                  <p className="text-center text-white/30 text-[0.55rem]">
                    Secure payment powered by Paystack
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Reservation - Coming Soon */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-white uppercase tracking-wider mb-1">Table Reservation</h3>
                <p className="text-white/50 text-xs">Premium tables with bottle service</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[0.6rem] font-bold uppercase tracking-widest">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Social follow */}
          <div className="text-center space-y-4 mb-8">
            <a
              href="https://instagram.com/astrowaveevent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white/60 border border-white/10 hover:border-white/25 hover:text-white transition-all"
            >
              <Instagram size={14} />
              FOLLOW @ASTROWAVEEVENT FOR UPDATES
            </a>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pb-8">
            <p className="text-[0.5rem] font-bold text-white/20 uppercase tracking-widest">Organized by</p>
            <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider">AstroWave Entertainment</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
