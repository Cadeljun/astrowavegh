'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';

const links = [
  { name: 'About',      href: '/about' },
  { name: 'Events',     href: '/events' },
  { name: 'Management', href: '/management' },
  { name: 'Platform',   href: '/platform' },
  { name: 'Contact',    href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen]         = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Pages with full-bleed hero photos — navbar stays transparent/dark on these
  const isHeroPage = ['/', '/events', '/platform', '/management', '/about'].includes(pathname);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scrolled: always white. Not scrolled on hero page: transparent over photo.
  const scrolled = isScrolled || !isHeroPage;

  return (
    <nav className={cn(
      'fixed top-0 left-0 w-full z-[1000] transition-all duration-300 px-6 lg:px-12',
      scrolled
        ? 'h-20 bg-white/97 backdrop-blur-xl border-b border-[#C8E6D4] shadow-sm'
        : 'h-28 bg-transparent'
    )}>
      <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between">
        <Logo height={32} />

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-10">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              className={cn(
                'text-[0.75rem] font-semibold uppercase tracking-[0.15em] transition-colors relative',
                scrolled
                  ? pathname === link.href
                    ? 'text-[#00C853]'
                    : 'text-[#2A4434] hover:text-[#00C853]'
                  : pathname === link.href
                    ? 'text-[#00C853]'
                    : 'text-white/80 hover:text-white',
                pathname === link.href && 'after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-[#00C853] after:rounded-full'
              )}>
              {link.name}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <Link href={'/organizer/dashboard'}>
                <button className={cn(
                  'h-10 px-6 rounded-lg text-xs font-bold uppercase tracking-widest border-2 transition-all',
                  scrolled
                    ? 'border-[#00C853] text-[#00C853] hover:bg-[#00C853] hover:text-white'
                    : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                )}>
                  Dashboard
                </button>
              </Link>
              <button onClick={logout}
                className={cn('transition-colors', scrolled ? 'text-[#567060] hover:text-red-500' : 'text-white/50 hover:text-white')}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="ml-4">
              <button className="h-10 px-8 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #00C853, #0EA5E9)', boxShadow: '0 0 20px rgba(0,200,83,0.3)' }}>
                Access Portal
              </button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setIsOpen(!isOpen)}
          className={cn('lg:hidden p-2 transition-colors', scrolled ? 'text-[#0B1F14]' : 'text-white')}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-white z-[999] p-8 pt-28 flex flex-col gap-8">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-6 text-[#0B1F14]">
            <X size={32} />
          </button>
          {links.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
              className={cn(
                'font-display text-4xl font-bold uppercase transition-colors',
                pathname === link.href ? 'text-[#00C853]' : 'text-[#0B1F14] hover:text-[#00C853]'
              )}>
              {link.name}
            </Link>
          ))}
          <div className="pt-8 border-t border-[#C8E6D4]">
            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
              <button className="w-full h-16 text-lg font-bold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #00C853, #0EA5E9)' }}>
                Access Portal
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
