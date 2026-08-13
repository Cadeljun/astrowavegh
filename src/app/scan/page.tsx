'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, AlertTriangle, Loader2, LogOut, Users, Ticket, Zap, X, Video, VideoOff } from 'lucide-react';
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

export default function ScanPage() {
  const router = useRouter();
  const db = useFirestore();
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<any>(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, remaining: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Check scanner auth
  useEffect(() => {
    const isAuth = sessionStorage.getItem('scanner_auth');
    if (!isAuth) {
      router.replace('/scan/login');
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
    stopCamera();
    sessionStorage.removeItem('scanner_auth');
    sessionStorage.removeItem('scanner_user');
    router.push('/scan/login');
  };

  // Verify ticket
  const verifyTicket = useCallback(async (ticketId: string) => {
    // Prevent duplicate scans
    const cleanId = ticketId.trim().toUpperCase();
    if (cleanId === lastScanned) return;
    setLastScanned(cleanId);
    setTimeout(() => setLastScanned(null), 3000);

    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: cleanId }),
      });
      const data = await res.json();
      setResult(data);
      if (data.status === 'VALID' || data.status === 'USED') {
        setRecentScans(prev => [{
          id: cleanId,
          status: data.status,
          name: data.ticket?.name || 'Unknown',
          ticketType: data.ticket?.ticketType || 'Standard',
          time: new Date().toLocaleTimeString(),
        }, ...prev].slice(0, 20));
      }
    } catch (err) {
      setResult({ status: 'ERROR', message: 'Network error — try again' });
    } finally {
      setVerifying(false);
    }
  }, [lastScanned]);

  // Start camera scanner
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);

    try {
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode } = await import('html5-qrcode');

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!scannerRef.current) {
        setCameraError('Scanner element not found');
        setCameraActive(false);
        return;
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerInstanceRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR code scanned
          if (decodedText && decodedText.startsWith('MM26-')) {
            verifyTicket(decodedText);
          } else {
            setResult({ status: 'INVALID', message: 'Invalid QR code format' });
          }
        },
        (errorMessage) => {
          // Ignore scan errors (normal when no QR in view)
        }
      );
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : error.name === 'NotFoundError'
          ? 'No camera found. Please connect a camera.'
          : `Camera error: ${error.message || 'Unknown error'}`
      );
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (e) {
        // Ignore stop errors
      }
      scannerInstanceRef.current = null;
    }
    setCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

        {/* Stats */}
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

        {/* Camera Scanner */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(218,175,72,0.03)', border: '1px solid rgba(218,175,72,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Camera size={20} style={{ color: '#DAAF48' }} />
              <div>
                <h2 className="font-display text-lg uppercase" style={{ color: '#F5F5F5' }}>QR Scanner</h2>
                <p className="text-xs" style={{ color: '#B4B4B4' }}>Point camera at ticket QR code</p>
              </div>
            </div>
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase"
                style={{ background: '#DAAF48', color: '#090909' }}
              >
                <Video size={14} />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              >
                <VideoOff size={14} />
                Stop Camera
              </button>
            )}
          </div>

          {/* Camera error */}
          {cameraError && (
            <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} style={{ color: '#EF4444' }} className="mt-0.5" />
                <div>
                  <p className="text-sm" style={{ color: '#EF4444' }}>{cameraError}</p>
                  <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>
                    Make sure you're using HTTPS and have granted camera permissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR Scanner Container */}
          <div 
            id="qr-reader" 
            ref={scannerRef}
            className="rounded-xl overflow-hidden"
            style={{ 
              minHeight: cameraActive ? '300px' : '0',
              background: 'rgba(0,0,0,0.3)',
              border: cameraActive ? '1px solid rgba(218,175,72,0.2)' : 'none'
            }}
          />

          {/* Camera inactive state */}
          {!cameraActive && !cameraError && (
            <div className="text-center py-8">
              <Camera size={48} className="mx-auto mb-3" style={{ color: '#DAAF48', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: '#B4B4B4' }}>Click "Start Camera" to begin scanning</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(180,180,180,0.5)' }}>Camera permission required</p>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#B4B4B4' }}>Manual Entry</h3>
          <form onSubmit={handleManualSubmit} className="flex gap-3">
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
              style={{ background: 'rgba(218,175,72,0.1)', border: '1px solid rgba(218,175,72,0.3)', color: '#DAAF48' }}
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
                background: result.status === 'VALID' ? 'rgba(0,200,83,0.08)' :
                            result.status === 'USED' ? 'rgba(218,175,72,0.08)' :
                            'rgba(239,68,68,0.08)',
                border: `2px solid ${
                  result.status === 'VALID' ? 'rgba(0,200,83,0.3)' :
                  result.status === 'USED' ? 'rgba(218,175,72,0.3)' :
                  'rgba(239,68,68,0.3)'
                }`,
              }}
            >
              {result.status === 'VALID' && <CheckCircle size={72} className="mx-auto mb-4" style={{ color: '#00C853' }} />}
              {result.status === 'USED' && <AlertTriangle size={72} className="mx-auto mb-4" style={{ color: '#DAAF48' }} />}
              {(result.status === 'INVALID' || result.status === 'ERROR') && <XCircle size={72} className="mx-auto mb-4" style={{ color: '#EF4444' }} />}

              <h2 className="font-display text-4xl uppercase mb-2" style={{ color: '#F5F5F5' }}>
                {result.status === 'VALID' ? '✓ VALID ENTRY' :
                 result.status === 'USED' ? '⚠ ALREADY SCANNED' :
                 '✗ INVALID TICKET'}
              </h2>
              <p className="text-sm mb-4" style={{ color: '#B4B4B4' }}>{result.message}</p>

              {result.ticket && (
                <div className="inline-block px-6 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-sm font-medium" style={{ color: '#F5F5F5' }}>{result.ticket.name}</p>
                  <p className="text-xs" style={{ color: '#B4B4B4' }}>{result.ticket.ticketType} • {result.ticket.id}</p>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="mt-6 px-8 py-3 rounded-lg text-sm uppercase tracking-widest font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
              >
                Scan Next Ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>Recent Scans</h3>
              <span className="text-xs" style={{ color: 'rgba(180,180,180,0.4)' }}>{recentScans.length} scans</span>
            </div>
            {recentScans.map((scan, i) => (
              <motion.div
                key={`${scan.id}-${scan.time}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
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
              </motion.div>
            ))}
          </div>
        )}

        {/* Live attendance bar */}
        <div className="p-4 rounded-xl flex items-center justify-center gap-3" style={{ background: 'rgba(0,200,83,0.03)', border: '1px solid rgba(0,200,83,0.1)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B4B4B4' }}>
            Live • {stats.checkedIn} of {stats.total} checked in ({stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%)
          </p>
        </div>
      </div>
    </div>
  );
}
