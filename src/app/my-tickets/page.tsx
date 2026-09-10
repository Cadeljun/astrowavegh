'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, Loader2, Calendar, MapPin, Clock, Download, Copy, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

export default function MyTicketsPage() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const q = query(
        collection(db, 'tickets'),
        where('email', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      const found = snap.docs.map(d => d.data());
      setTickets(found);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group tickets by event
  const grouped = tickets.reduce((acc: any, t: any) => {
    const key = t.eventTitle || 'Mask Mirage Party';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/tickets" className="text-xs uppercase tracking-widest mb-4 block" style={{ color: '#B4B4B4' }}>
            ← Back to Tickets
          </Link>
          <h1 className="font-display text-3xl uppercase mb-2" style={{ color: '#F5F5F5' }}>My Tickets</h1>
          <p className="text-sm" style={{ color: '#B4B4B4' }}>Enter the email you used to purchase</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg font-bold text-sm uppercase"
              style={{ background: '#DAAF48', color: '#090909' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin mx-auto" style={{ color: '#DAAF48' }} />
          </div>
        )}

        {!loading && searched && tickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket size={48} className="mx-auto mb-4" style={{ color: 'rgba(180,180,180,0.3)' }} />
            <h3 className="font-display text-xl uppercase mb-2" style={{ color: '#F5F5F5' }}>No Tickets Found</h3>
            <p className="text-sm" style={{ color: '#B4B4B4' }}>No tickets found for {email}</p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([eventTitle, eventTickets]: [string, any]) => (
              <div key={eventTitle}>
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DAAF48' }}>
                  {eventTitle}
                </h2>
                <div className="space-y-3">
                  {eventTickets.map((ticket: any) => (
                    <div
                      key={ticket.ticketId}
                      className="p-5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm font-bold" style={{ color: '#DAAF48' }}>{ticket.ticketId}</p>
                          <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>{ticket.ticketType} • GH¢{ticket.price}</p>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full text-[0.55rem] font-bold uppercase"
                          style={{
                            background: ticket.status === 'valid' ? 'rgba(0,200,83,0.1)' : ticket.status === 'used' ? 'rgba(218,175,72,0.1)' : 'rgba(239,68,68,0.1)',
                            color: ticket.status === 'valid' ? '#00C853' : ticket.status === 'used' ? '#DAAF48' : '#EF4444',
                          }}
                        >
                          {ticket.status === 'valid' ? 'Valid' : ticket.status === 'used' ? 'Used' : ticket.status}
                        </span>
                      </div>

                      {/* QR Code */}
                      {ticket.qrUrl && (
                        <div className="text-center py-3">
                          <div className="inline-block p-3 bg-white rounded-lg">
                            <img src={ticket.qrUrl} alt={`QR for ${ticket.ticketId}`} className="w-32 h-32" />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => copyId(ticket.ticketId)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs uppercase"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#B4B4B4' }}
                        >
                          {copiedId === ticket.ticketId ? <CheckCircle size={12} /> : <Copy size={12} />}
                          {copiedId === ticket.ticketId ? 'Copied' : 'Copy ID'}
                        </button>
                        {ticket.qrUrl && (
                          <a
                            href={ticket.qrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs uppercase"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#B4B4B4' }}
                          >
                            <Download size={12} /> QR Code
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
