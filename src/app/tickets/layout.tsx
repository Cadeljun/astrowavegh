'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Override favicon for ticket subdomain
  useEffect(() => {
    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = '/favicon-mm.png';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-6 py-4" style={{ background: 'rgba(9,9,9,0.95)', borderBottom: '1px solid rgba(218,175,72,0.08)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-7" style={{ filter: 'brightness(0) invert(1) brightness(0.9)' }} />
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#DAAF48' }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Menu */}
          <div 
            className="absolute top-[65px] left-0 right-0 shadow-xl"
            style={{ 
              background: '#FFFFFF',
              borderBottom: '2px solid #DAAF48'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 space-y-1">
              <Link
                href="/tickets"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all"
                style={{ 
                  color: pathname === '/tickets' ? '#DAAF48' : '#1a1a1a',
                  background: pathname === '/tickets' ? 'rgba(218,175,72,0.08)' : 'transparent',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Tickets
              </Link>
              <Link
                href="/scan/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all"
                style={{ 
                  color: '#1a1a1a',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Scan
              </Link>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t" style={{ borderColor: '#f0f0f0' }}>
              <p className="text-xs text-center" style={{ color: '#999', fontFamily: "'Inter', sans-serif" }}>
                © 2026 AstroWave Entertainment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ──────────────────────────────────────── */}
      {children}
    </div>
  );
}
