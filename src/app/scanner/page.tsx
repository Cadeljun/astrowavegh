'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, AlertTriangle, Loader2, LogOut, Users, Ticket, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

type ScanResult = {
  status: 'VALID' | 'USED' | 'INVALID' | 'ERROR';
  message: string;
  ticket?: {
    id: string;
    name: string;
    ticketType: string;
    checkedInAt?: any;
  };
} | null;

export default function ScannerPage() {
  const router = useRouter();
  const db = useFirestore();

  const [authenticated, setAuthenticated] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, remaining: 0 });

  // Check scanner auth
  useEffect(() => {
    const isAuth = sessionStorage.getItem('scanner_auth');
    if (!isAuth) {
      router.replace('/scanner/login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  // Load stats
  useEffect(() => {
    if (!db || !authenticated) return;

    const unsub = onSnapshot(collection(db, 'tickets'), (snap) => {
      const tickets = snap.docs.map(d => d.data());
      const total = tickets.length;
      const checkedIn = tickets.filter(t => t.status === 'used').length;
      setStats({ total, checkedIn, remaining: total - checkedIn });
    });

    return () => unsub();
  }, [db, authenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem('scanner_auth');
    sessionStorage.removeItem('scanner_user');
    router.push('/scanner/login');
  };

  const verifyTicket = async (ticketId: string) => {
    setVerifying(true);
    setResult(null);

    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketId.trim().toUpperCase() }),
      });

      const data = await res.json();
      setResult(data);

      if (data.status === 'VALID' || data.status === 'USED') {
        setRecentScans(prev => [{
          id: ticketId.toUpperCase(),
          status: data.status,
          name: data.ticket?.name || 'Unknown',
          ticketType: data.ticket?.ticketType || 'Standard',
          time: new Date().toLocaleTimeString(),
        }, ...prev].slice(0, 10));
      }
    } catch (err) {
      setResult({ status: 'ERROR', message: 'Network error — try again' });
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      verifyTicket(manualInput);
      setManualInput('');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#DAAF48' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4" style={{ background: 'rgba(9,9,9,0.95)', borderBottom: '1px solid rgba(218,175,72,0.1)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(218,175,72,0.1)' }}>
              <Zap size={16} style={{ color: '#DAAF48' }} />
            </div>
            <div>
              <h1 className="font-display text-lg uppercase tracking-wider" style={{ color: '#F5F5F5' }}>Ticket Scanner</h1>
              <p className="text-[0.5rem] uppercase tracking-widest" style={{ color: '#B4B4B4' }}>Mask Mirage Party</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs" style={{ color: '#B4B4B4' }}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Tickets', value: stats.total, icon: Ticket, color: '#F5F5F5' },
            { label: 'Checked In', value: stats.checkedIn, icon: CheckCircle, color: '#00C853' },
            { label: 'Remaining', value: stats.remaining, icon: Users, color: '#DAAF48' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <stat.icon size={16} className="mb-2" style={{ color: stat.color, opacity: 0.6 }} />
              <p className="font-display text-2xl" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[0.55rem] font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Scanner Area */}
        <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(218,175,72,0.03)', border: '1px solid rgba(218,175,72,0.1)' }}>
          <Camera size={48} className="mx-auto mb-4" style={{ color: '#DAAF48', opacity: 0.5 }} />
          <h2 className="font-display text-xl uppercase mb-2" style={{ color: '#F5F5F5' }}>Scan Ticket QR</h2>
          <p className="text-sm mb-6" style={{ color: '#B4B4B4' }}>Point camera at ticket QR code or enter ID manually</p>

          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value.toUpperCase())}
              placeholder="MM26-XXXXXXXX"
              className="flex-1 px-4 py-3 rounded-lg text-sm font-mono uppercase outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
            />
            <button
              type="submit"
              disabled={verifying || !manualInput.trim()}
              className="px-6 py-3 rounded-lg font-bold text-sm uppercase"
              style={{ background: '#DAAF48', color: '#090909' }}
            >
              {verifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </form>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-2xl text-center"
              style={{
                background: result.status === 'VALID' ? 'rgba(0,200,83,0.05)' :
                            result.status === 'USED' ? 'rgba(218,175,72,0.05)' :
                            'rgba(239,68,68,0.05)',
                border: `1px solid ${
                  result.status === 'VALID' ? 'rgba(0,200,83,0.2)' :
                  result.status === 'USED' ? 'rgba(218,175,72,0.2)' :
                  'rgba(239,68,68,0.2)'
                }`,
              }}
            >
              {result.status === 'VALID' && <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#00C853' }} />}
              {result.status === 'USED' && <AlertTriangle size={64} className="mx-auto mb-4" style={{ color: '#DAAF48' }} />}
              {(result.status === 'INVALID' || result.status === 'ERROR') && <XCircle size={64} className="mx-auto mb-4" style={{ color: '#EF4444' }} />}

              <h2 className="font-display text-3xl uppercase mb-2" style={{ color: '#F5F5F5' }}>
                {result.status === 'VALID' ? '✓ VALID' :
                 result.status === 'USED' ? '⚠ ALREADY USED' :
                 '✗ INVALID'}
              </h2>
              <p className="text-sm mb-4" style={{ color: '#B4B4B4' }}>{result.message}</p>

              {result.ticket && (
                <div className="space-y-1">
                  <p className="text-sm" style={{ color: '#F5F5F5' }}>{result.ticket.name}</p>
                  <p className="text-xs" style={{ color: '#B4B4B4' }}>{result.ticket.ticketType} • {result.ticket.id}</p>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="mt-6 px-6 py-2 rounded-lg text-xs uppercase tracking-widest"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#B4B4B4' }}
              >
                Scan Next
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>Recent Scans</h3>
            {recentScans.map((scan, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  {scan.status === 'VALID' ? (
                    <CheckCircle size={16} style={{ color: '#00C853' }} />
                  ) : (
                    <AlertTriangle size={16} style={{ color: '#DAAF48' }} />
                  )}
                  <div>
                    <p className="text-sm" style={{ color: '#F5F5F5' }}>{scan.name}</p>
                    <p className="text-[0.55rem]" style={{ color: '#B4B4B4' }}>{scan.ticketType} • {scan.id}</p>
                  </div>
                </div>
                <p className="text-[0.6rem] font-mono" style={{ color: '#B4B4B4' }}>{scan.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
