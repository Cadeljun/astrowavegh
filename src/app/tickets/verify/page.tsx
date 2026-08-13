'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Download, Ticket } from 'lucide-react';
import Link from 'next/link';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [data, setData] = useState<any>(null);
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
        setError('Could not verify payment');
      }
    };

    verifyPayment();
  }, [reference]);

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
            </div>

            {/* Tickets */}
            <div className="space-y-8">
              {data.tickets.map((ticket: any, index: number) => (
                <div key={ticket.ticketId}>
                  {data.quantity > 1 && (
                    <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#B4B4B4' }}>
                      Ticket {index + 1} of {data.quantity}
                    </p>
                  )}
                  <div className="flex justify-center">
                    <MaskMirageTicket
                      ticketId={ticket.ticketId}
                      name={data.name}
                      ticketType={ticket.ticketType}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center mt-10 gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
              >
                <Download size={14} />
                Save All Tickets
              </button>
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
