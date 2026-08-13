'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';
import { generateTicketId } from '@/lib/tickets';

function VerifyContent() {
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
        ticketType: 'GENERAL ADMISSION',
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

  return (
    <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center px-6 py-12">
      <div className="relative z-10 w-full max-w-[1500px]">
        {/* Back link */}
        <div className="mb-8">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <span className="text-xs">Back to Tickets</span>
          </Link>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Loader2 size={48} className="animate-spin text-[#DAAF48] mx-auto mb-4" />
            <h2 className="font-display text-xl text-white uppercase mb-2">Verifying Payment</h2>
            <p className="text-white/50 text-sm">Please wait while we confirm your ticket...</p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && ticket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Success message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#DAAF48]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#DAAF48]" />
              </div>
              <h2 className="font-display text-3xl text-white uppercase mb-2">Ticket Confirmed</h2>
              {ticket.email && (
                <p className="text-white/50 text-sm">Your ticket has been sent to {ticket.email}</p>
              )}
            </div>

            {/* Ticket */}
            <div className="flex justify-center">
              <MaskMirageTicket
                ticketId={ticket.ticketId}
                name={ticket.name || 'Ticket Holder'}
                ticketType={ticket.ticketType || 'GENERAL ADMISSION'}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-center mt-8 gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#DAAF48] transition-all text-sm"
              >
                <Download size={14} />
                Save Ticket
              </button>
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="font-display text-2xl text-white uppercase mb-2">Payment Failed</h2>
            <p className="text-white/50 text-sm mb-8">{error || 'Something went wrong.'}</p>
            <Link href="/tickets">
              <button
                className="px-8 py-3 rounded-lg font-bold text-sm text-white uppercase"
                style={{ background: 'linear-gradient(135deg, #DAAF48, #B8943F)' }}
              >
                Try Again
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyTicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#DAAF48]" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
