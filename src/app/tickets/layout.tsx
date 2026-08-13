'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, ScanLine, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scannerAuth, setScannerAuth] = useState(false);

  // Check if scanner is logged in
  useEffect(() => {
    const isAuth = sessionStorage.getItem('scanner_auth');
    setScannerAuth(!!isAuth);
  }, []);

  const navItems = [
    { label: 'Tickets', href: '/tickets', icon: Ticket },
    { 
      label: 'Scan', 
      href: scannerAuth ? '/scanner' : '/scanner/login', 
      icon: ScanLine 
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-6 py-4" style={{ background: 'rgba(9,9,9,0.95)', borderBottom: '1px solid rgba(218,175,72,0.1)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/tickets" className="flex items-center gap-3">
            <img src="/logo/astrowave-logo.svg" alt="AstroWave" className="h-7" style={{ filter: 'brightness(0) invert(1) brightness(0.9)' }} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-widest transition-all",
                  isActive(item.href)
                    ? "text-[#DAAF48]"
                    : "text-[#B4B4B4] hover:text-[#F5F5F5]"
                )}
                style={isActive(item.href) ? { background: 'rgba(218,175,72,0.1)' } : {}}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-lg"
            style={{ color: '#B4B4B4' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="sm:hidden mt-4 pb-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-[0.75rem] font-bold uppercase tracking-widest transition-all",
                  isActive(item.href)
                    ? "text-[#DAAF48]"
                    : "text-[#B4B4B4] hover:text-[#F5F5F5]"
                )}
                style={isActive(item.href) ? { background: 'rgba(218,175,72,0.1)' } : {}}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── PAGE CONTENT ──────────────────────────────────────── */}
      {children}
    </div>
  );
}
