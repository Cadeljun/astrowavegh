'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Loader2, CheckCircle, X, CreditCard, Instagram, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const TICKET_TYPES = [
  {
    id: 'standard',
    name: 'Standard',
    price: 50,
    unit: 'per person',
  },
  {
    id: 'group',
    name: 'Group of 4',
    price: 180,
    unit: 'per group',
    badge: 'Save GH¢20',
    fixedQty: 4,
  },
];

export default function TicketsPage() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

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

  const selectedTicketData = TICKET_TYPES.find(t => t.id === selectedTicket);
  const isGroup = selectedTicketData?.id === 'group';
  const ticketQty = isGroup ? 4 : quantity;
  const totalAmount = selectedTicketData ? (isGroup ? selectedTicketData.price : selectedTicketData.price * quantity) : 0;

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    const ticket = TICKET_TYPES.find(t => t.id === ticketId);
    if (ticket?.fixedQty) {
      setQuantity(ticket.fixedQty);
    }
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
          amount: totalAmount,
          ticketType: selectedTicketData.name,
          name: formData.name,
          quantity: ticketQty,
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
      {/* Subtle glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute right-0 top-1/3 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(218,175,72,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

        {/* ── FLYER ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
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
              target="_blank"
              rel="noopener noreferrer"
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
            <button
              key={ticket.id}
              onClick={() => handleSelectTicket(ticket.id)}
              className="w-full text-left p-5 rounded-xl flex items-center justify-between transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
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
                <span className="font-display text-2xl" style={{ color: '#F5F5F5' }}>GH¢{ticket.price}</span>
                <ArrowRight size={16} style={{ color: '#B4B4B4' }} />
              </div>
            </button>
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
            target="_blank"
            rel="noopener noreferrer"
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

      {/* ── CHECKOUT MODAL ────────────────────────────────── */}
      {showCheckout && selectedTicketData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
            style={{ background: '#0A0A0A', border: '1px solid rgba(218,175,72,0.15)' }}
          >
            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4" style={{ color: '#B4B4B4' }}>
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#DAAF48' }}>Complete Purchase</p>
              <h3 className="font-display text-2xl uppercase" style={{ color: '#F5F5F5' }}>{selectedTicketData.name}</h3>
            </div>

            {/* Quantity selector (only for standard tickets) */}
            {!isGroup && (
              <div className="mb-6">
                <label className="text-[0.5rem] font-bold uppercase tracking-widest block mb-3 text-center" style={{ color: '#B4B4B4' }}>Number of Tickets</label>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Minus size={18} style={{ color: '#F5F5F5' }} />
                  </button>
                  <span className="font-display text-4xl w-16 text-center" style={{ color: '#F5F5F5' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Plus size={18} style={{ color: '#F5F5F5' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Price summary */}
            <div className="p-4 rounded-xl mb-6 text-center" style={{ background: 'rgba(218,175,72,0.05)', border: '1px solid rgba(218,175,72,0.1)' }}>
              <p className="text-[0.5rem] font-bold uppercase tracking-widest mb-1" style={{ color: '#B4B4B4' }}>
                {isGroup ? 'Group of 4' : `${quantity} × GH¢${selectedTicketData.price}`}
              </p>
              <p className="font-display text-3xl" style={{ color: '#DAAF48' }}>GH¢{totalAmount}</p>
              {quantity > 1 && !isGroup && (
                <p className="text-[0.5rem] mt-1" style={{ color: '#B4B4B4' }}>{quantity} tickets will be generated</p>
              )}
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="text-[0.5rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Full Name</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F5' }}
                  placeholder="Your name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[0.5rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F5' }}
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <p className="text-[0.45rem] mt-1" style={{ color: '#B4B4B4' }}>
                  {quantity > 1 ? `${quantity} tickets will be sent to this email` : 'Your ticket will be sent here'}
                </p>
              </div>
              <div>
                <label className="text-[0.5rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Phone</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F5' }}
                  placeholder="+233 xxx xxx xxxx"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
                style={{ background: '#DAAF48', color: '#090909' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : `PAY GH¢${totalAmount}`}
              </button>

              <p className="text-center text-[0.45rem]" style={{ color: '#B4B4B4' }}>
                Secure payment by Paystack
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
