'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Download, Share2, Image } from 'lucide-react';
import Link from 'next/link';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number[]>([]);

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
        setError('Could not verify payment. Please contact support with your payment reference.');
      }
    };

    // Small delay to ensure Paystack has processed
    const timer = setTimeout(verifyPayment, 2000);
    return () => clearTimeout(timer);
  }, [reference]);

  const saveTicketAsImage = async (index: number) => {
    setSaving(index);
    try {
      const { toPng } = await import('html-to-image');
      const ticketEl = document.getElementById(`ticket-${index}`);
      if (!ticketEl) return;

      const dataUrl = await toPng(ticketEl, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#090909',
      });

      // Download
      const link = document.createElement('a');
      link.download = `Mask-Mirage-Ticket-${data?.tickets[index]?.ticketId || index + 1}.png`;
      link.href = dataUrl;
      link.click();

      setSaved(prev => [...prev, index]);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(null);
    }
  };

  const saveAllTickets = async () => {
    if (!data?.tickets) return;
    for (let i = 0; i < data.tickets.length; i++) {
      await saveTicketAsImage(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      <div className="max-w-[1500px] mx-auto px-6 py-12">
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
            <p className="text-sm mt-2" style={{ color: '#B4B4B4' }}>Please wait...</p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Success header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(218,175,72,0.1)' }}>
                <CheckCircle size={32} style={{ color: '#DAAF48' }} />
              </div>
              <h2 className="font-display text-3xl uppercase mb-2" style={{ color: '#F5F5F5' }}>
                {data.quantity > 1 ? 'Tickets Confirmed' : 'Ticket Confirmed'}
              </h2>
              <p style={{ color: '#B4B4B4' }}>
                {data.quantity > 1
                  ? `${data.quantity} tickets sent to ${data.email}`
                  : `Ticket sent to ${data.email}`}
              </p>
              {data.emailSent && (
                <p className="text-xs mt-2" style={{ color: '#00C853' }}>✓ Confirmation email sent</p>
              )}
            </div>

            {/* Save All Button */}
            {data.quantity > 1 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={saveAllTickets}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest"
                  style={{ background: '#DAAF48', color: '#090909' }}
                >
                  <Download size={16} />
                  Save All Tickets ({data.quantity})
                </button>
              </div>
            )}

            {/* Tickets */}
            <div className="space-y-12">
              {data.tickets.map((ticket: any, index: number) => (
                <div key={ticket.ticketId}>
                  {data.quantity > 1 && (
                    <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#B4B4B4' }}>
                      Ticket {index + 1} of {data.quantity}
                    </p>
                  )}
                  
                  {/* Ticket with ID for screenshot */}
                  <div id={`ticket-${index}`} className="flex justify-center">
                    <MaskMirageTicket
                      ticketId={ticket.ticketId}
                      name={data.name}
                      ticketType={ticket.ticketType}
                    />
                  </div>

                  {/* Save button for each ticket */}
                  <div className="flex justify-center mt-4 gap-3">
                    <button
                      onClick={() => saveTicketAsImage(index)}
                      disabled={saving === index}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all"
                      style={{
                        background: saved.includes(index) ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${saved.includes(index) ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: saved.includes(index) ? '#00C853' : '#B4B4B4',
                      }}
                    >
                      {saving === index ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : saved.includes(index) ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Image size={14} />
                      )}
                      {saved.includes(index) ? 'Saved' : 'Save as Image'}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ticket.ticketId);
                        alert('Ticket ID copied!');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#B4B4B4' }}
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="text-center mt-12 space-y-3">
              <p className="text-xs" style={{ color: '#B4B4B4' }}>
                Screenshot or save your tickets. Show the QR code or Ticket ID at the entrance.
              </p>
              <p className="text-xs" style={{ color: 'rgba(180,180,180,0.5)' }}>
                A confirmation email has been sent to {data.email}
              </p>
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <XCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="font-display text-2xl uppercase mb-2" style={{ color: '#F5F5F5' }}>Payment Failed</h2>
            <p className="mb-8" style={{ color: '#B4B4B4' }}>{error}</p>
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
