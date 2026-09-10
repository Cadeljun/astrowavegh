'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Download, Ticket, Mail, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setError('No payment reference found');
      return;
    }

    // Poll for tickets (webhook may take a few seconds)
    const pollForTickets = async () => {
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds max

      const check = async () => {
        attempts++;
        
        // Look for tickets with this payment reference
        const q = query(
          collection(db, 'tickets'),
          where('paymentReference', '==', reference)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const foundTickets = snap.docs.map(d => d.data());
          setTickets(foundTickets);
          setStatus('success');
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(check, 2000); // Check every 2 seconds
        } else {
          setStatus('failed');
          setError('Tickets are being generated. Please check your email in a few minutes.');
        }
      };

      check();
    };

    pollForTickets();
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
            <h2 className="font-display text-xl uppercase" style={{ color: '#F5F5F5' }}>Generating Your Tickets</h2>
            <p className="text-sm mt-2" style={{ color: '#B4B4B4' }}>Creating QR codes and sending to your email...</p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && tickets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(218,175,72,0.1)', border: '2px solid rgba(218,175,72,0.2)' }}>
                <CheckCircle size={40} style={{ color: '#DAAF48' }} />
              </div>
              <h2 className="font-display text-3xl uppercase mb-3" style={{ color: '#F5F5F5' }}>
                {tickets.length > 1 ? 'Tickets Confirmed' : 'Ticket Confirmed'}
              </h2>
              <p className="text-sm" style={{ color: '#B4B4B4' }}>
                Thank you, {tickets[0]?.name}!
              </p>
            </div>

            {/* Email confirmation */}
            <div className="p-5 rounded-xl mb-8 flex items-center gap-4" style={{ background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)' }}>
              <Mail size={20} style={{ color: '#00C853' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#F5F5F5' }}>Confirmation email sent</p>
                <p className="text-xs" style={{ color: '#B4B4B4' }}>{tickets[0]?.email}</p>
              </div>
            </div>

            {/* Ticket cards with QR codes */}
            <div className="space-y-4 mb-8">
              {tickets.map((ticket, index) => (
                <div key={ticket.ticketId} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>
                        Ticket {index + 1} of {tickets.length}
                      </p>
                      <p className="font-mono text-lg font-bold mt-1" style={{ color: '#DAAF48' }}>
                        {ticket.ticketId}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(218,175,72,0.1)', color: '#DAAF48' }}>
                      {ticket.ticketType}
                    </span>
                  </div>

                  {/* QR Code */}
                  {ticket.qrUrl && (
                    <div className="text-center py-4">
                      <div className="inline-block p-4 bg-white rounded-xl">
                        <img src={ticket.qrUrl} alt={`QR for ${ticket.ticketId}`} className="w-48 h-48" />
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#B4B4B4' }}>Scan at entrance</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => copyTicketId(ticket.ticketId)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all"
                      style={{
                        background: copiedId === ticket.ticketId ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${copiedId === ticket.ticketId ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: copiedId === ticket.ticketId ? '#00C853' : '#B4B4B4',
                      }}
                    >
                      {copiedId === ticket.ticketId ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copiedId === ticket.ticketId ? 'Copied' : 'Copy ID'}
                    </button>
                    {ticket.qrUrl && (
                      <a
                        href={ticket.qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs uppercase tracking-widest"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#B4B4B4' }}
                      >
                        <Download size={14} />
                        Save QR
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-center mb-8">
              <p className="text-xs" style={{ color: 'rgba(180,180,180,0.5)' }}>
                Total: GH¢{tickets.reduce((sum, t) => sum + (t.price || 0), 0)}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm" style={{ color: '#F5F5F5' }}>Show the QR code at the entrance</p>
              <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>Or save this page / check your email</p>
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <XCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="font-display text-2xl uppercase mb-2" style={{ color: '#F5F5F5' }}>
              {error.includes('being generated') ? 'Processing Payment' : 'Payment Failed'}
            </h2>
            <p className="mb-4" style={{ color: '#B4B4B4' }}>{error}</p>
            <p className="text-xs mb-8" style={{ color: 'rgba(180,180,180,0.5)' }}>
              Reference: {reference || 'N/A'}
            </p>
            <Link href="/tickets">
              <button className="px-8 py-3 rounded-lg font-bold text-sm uppercase" style={{ background: '#DAAF48', color: '#090909' }}>
                Back to Tickets
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
