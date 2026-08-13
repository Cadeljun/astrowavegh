'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket } from 'lucide-react';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* ── MINIMAL NAVBAR ────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-6 py-4" style={{ background: 'rgba(9,9,9,0.95)', borderBottom: '1px solid rgba(218,175,72,0.08)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-7" style={{ filter: 'brightness(0) invert(1) brightness(0.9)' }} />
          </Link>
        </div>
      </nav>

      {/* ── PAGE CONTENT ──────────────────────────────────────── */}
      {children}
    </div>
  );
}
