'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Download, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TicketDesign from '@/components/tickets/TicketDesign';
import { generateTicketId } from '@/lib/qr';

export default function VerifyTicketPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const ticketId = searchParams.get('id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // If just viewing a ticket by ID
    if (ticketId && !reference) {
      setStatus('success');
      setTicket({
        ticketId: ticketId,
        name: 'Ticket Holder',
        email: '',
        ticketType: 'Standard',
        amount: 50,
      });
      return;
    }

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
          const newTicketId = generateTicketId();
          setStatus('success');
          setTicket({
            ...data.ticket,
            ticketId: newTicketId,
          });
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
  }, [reference, ticketId]);

  const handleDownload = () => {
    // Create canvas and download ticket as image
    const ticketEl = document.getElementById('ticket-design');
    if (ticketEl) {
      // Simple approach - open print dialog
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#020B18] flex flex-col items-center justify-center px-6 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4">
            <ArrowLeft size={14} />
            <span className="text-xs">Back to Tickets</span>
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
          >
            {/* Success message */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#00C853]" />
              </div>
              <h2 className="font-display text-2xl text-white uppercase mb-2">Ticket Confirmed!</h2>
              <p className="text-white/50 text-sm">Your ticket has been sent to {ticket.email}</p>
            </div>

            {/* Ticket Design */}
            <div id="ticket-design">
              <TicketDesign
                ticketId={ticket.ticketId}
                name={ticket.name || 'Ticket Holder'}
                email={ticket.email || ''}
                ticketType={ticket.ticketType || 'Standard'}
                amount={ticket.amount || 50}
              />
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white border border-white/10 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Download size={14} />
                SAVE TICKET
              </button>

              <a
                href="https://instagram.com/astrowaveevent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-xs tracking-[0.15em] uppercase text-white/60 border border-white/10 hover:border-white/25 transition-all"
              >
                <Share2 size={14} />
                SHARE ON INSTAGRAM
              </a>
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
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
