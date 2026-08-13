'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Ticket, Calendar, MapPin, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyTicketPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setError('No payment reference found');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setTicket(data.ticket);
        } else {
          setStatus('failed');
          setError(data.error || 'Payment verification failed');
        }
      } catch (err: any) {
        setStatus('failed');
        setError('Could not verify payment');
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#020B18] flex flex-col items-center justify-center px-6 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/tickets">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-8 mx-auto" />
          </Link>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <Loader2 size={48} className="animate-spin text-purple-400 mx-auto mb-4" />
            <h2 className="font-display text-xl text-white uppercase mb-2">Verifying Payment</h2>
            <p className="text-white/50 text-sm">Please wait while we confirm your ticket...</p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && ticket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-[#00C853]/30 rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-[#00C853]" />
            </div>

            <h2 className="font-display text-2xl text-white uppercase mb-2">Ticket Confirmed!</h2>
            <p className="text-white/50 text-sm mb-8">Your ticket has been sent to {ticket.email}</p>

            {/* Ticket Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-left space-y-4">
              <div className="flex items-center gap-3">
                <Ticket size={18} className="text-purple-400" />
                <div>
                  <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Ticket Type</p>
                  <p className="text-white font-medium">{ticket.ticketType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-[#00C853]" />
                <div>
                  <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Event</p>
                  <p className="text-white font-medium">Mask Mirage Party — 10 Oct 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-blue-400" />
                <div>
                  <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Venue</p>
                  <p className="text-white font-medium">TBA — Accra, Ghana</p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Reference</p>
                  <p className="text-white/60 text-xs font-mono">{ticket.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Amount</p>
                  <p className="font-display text-lg text-[#00C853]">GHS {ticket.amount}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href="https://instagram.com/astrowaveevent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white border border-white/10 hover:border-white/25 transition-all"
              >
                <Share2 size={14} />
                SHARE ON INSTAGRAM
              </a>

              <Link href="/tickets">
                <button className="w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white transition-all">
                  Back to Tickets
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-400" />
            </div>

            <h2 className="font-display text-2xl text-white uppercase mb-2">Payment Failed</h2>
            <p className="text-white/50 text-sm mb-8">{error || 'Something went wrong with your payment.'}</p>

            <div className="space-y-3">
              <Link href="/tickets">
                <button
                  className="flex items-center justify-center gap-2 w-full h-14 rounded-xl font-bold text-sm tracking-[0.15em] uppercase text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #00C853)' }}
                >
                  TRY AGAIN
                </button>
              </Link>

              <a
                href="https://instagram.com/astrowaveevent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white/60 border border-white/10 hover:border-white/25 transition-all"
              >
                CONTACT US ON INSTAGRAM
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
