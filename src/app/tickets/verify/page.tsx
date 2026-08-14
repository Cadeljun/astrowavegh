'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Download, Ticket, Mail, Copy } from 'lucide-react';
import Link from 'next/link';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setError('No payment reference found');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const result = await res.json();

        if (result.success) {
          setStatus('success');
          setData(result);
        } else {
          setStatus('failed');
          setError(result.error || 'Payment verification failed');
        }
      } catch (err: any) {
        setStatus('failed');
        setError('Could not verify payment. Please contact support.');
      }
    };

    const timer = setTimeout(verifyPayment, 2000);
    return () => clearTimeout(timer);
  }, [reference]);

  const copyTicketId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link */}
        <div className="mb-8">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-sm" style={{ color: '#B4B4B4' }}>
            <ArrowLeft size={14} />
            Back to Tickets
          </Link>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: '#DAAF48' }} />
            <h2 className="font-display text-xl uppercase" style={{ color: '#F5F5F5' }}>Verifying Payment</h2>
            <p className="text-sm mt-2" style={{ color: '#B4B4B4' }}>Please wait while we confirm your ticket...</p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Success header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(218,175,72,0.1)', border: '2px solid rgba(218,175,72,0.2)' }}>
                <CheckCircle size={40} style={{ color: '#DAAF48' }} />
              </div>
              <h2 className="font-display text-3xl uppercase mb-3" style={{ color: '#F5F5F5' }}>
                {data.quantity > 1 ? 'Tickets Confirmed' : 'Ticket Confirmed'}
              </h2>
              <p className="text-sm" style={{ color: '#B4B4B4' }}>
                Thank you, {data.name}!
              </p>
            </div>

            {/* Email confirmation */}
            <div className="p-5 rounded-xl mb-8 flex items-center gap-4" style={{ background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)' }}>
              <Mail size={20} style={{ color: '#00C853' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#F5F5F5' }}>
                  {data.emailSent ? 'Confirmation email sent' : 'Email will be sent shortly'}
                </p>
                <p className="text-xs" style={{ color: '#B4B4B4' }}>{data.email}</p>
              </div>
            </div>

            {/* Ticket summary */}
            <div className="p-6 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>Your Tickets</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(218,175,72,0.1)', color: '#DAAF48' }}>
                  {data.quantity} {data.quantity > 1 ? 'tickets' : 'ticket'}
                </span>
              </div>

              <div className="space-y-3">
                {data.tickets.map((ticket: any, index: number) => (
                  <div key={ticket.ticketId} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      <Ticket size={16} style={{ color: '#DAAF48' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#F5F5F5' }}>{ticket.ticketType}</p>
                        <p className="font-mono text-xs" style={{ color: '#DAAF48' }}>{ticket.ticketId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyTicketId(ticket.ticketId)}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: copiedId === ticket.ticketId ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)' }}
                    >
                      {copiedId === ticket.ticketId ? (
                        <CheckCircle size={14} style={{ color: '#00C853' }} />
                      ) : (
                        <Copy size={14} style={{ color: '#B4B4B4' }} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs mt-4 text-center" style={{ color: 'rgba(180,180,180,0.5)' }}>
                Total: GH¢{data.amount}
              </p>
            </div>

            {/* Download buttons */}
            <div className="space-y-4 mb-8">
              <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: '#DAAF48' }}>
                Download Your Ticket{data.quantity > 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.tickets.map((ticket: any, index: number) => (
                  <MaskMirageTicket
                    key={ticket.ticketId}
                    ticketId={ticket.ticketId}
                    name={data.name}
                    ticketType={ticket.ticketType}
                    index={index}
                    total={data.tickets.length}
                  />
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm" style={{ color: '#F5F5F5' }}>Show your ticket at the entrance</p>
              <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>Screenshot, download, or show your email confirmation</p>
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <XCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="font-display text-2xl uppercase mb-2" style={{ color: '#F5F5F5' }}>Payment Failed</h2>
            <p className="mb-4" style={{ color: '#B4B4B4' }}>{error}</p>
            <p className="text-xs mb-8" style={{ color: 'rgba(180,180,180,0.5)' }}>
              Reference: {reference || 'N/A'}
            </p>
            <Link href="/tickets">
              <button className="px-8 py-3 rounded-lg font-bold text-sm uppercase" style={{ background: '#DAAF48', color: '#090909' }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#DAAF48' }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
