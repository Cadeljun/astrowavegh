'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';

const links = [
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Management', href: '/management' },
  { name: 'Platform', href: '/platform' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isHeroPage = ['/', '/events', '/platform', '/management', '/about'].includes(pathname);
  const isDark = isHeroPage && !isScrolled && !isOpen;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav className={cn(
      'fixed left-0 top-0 z-[1000] w-full px-5 transition-all duration-300 sm:px-8 lg:px-12',
      isScrolled || !isHeroPage ? 'bg-[#F7F4EC]/95 shadow-[0_12px_35px_rgba(16,35,29,0.07)] backdrop-blur-xl' : 'bg-transparent',
    )}>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between lg:h-[88px]">
        <Logo height={31} variant={isDark ? 'white' : 'dark'} />

        <div className="hidden items-center gap-8 lg:flex">
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                'relative py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.17em] transition-colors',
                isDark ? 'text-white/65 hover:text-white' : 'text-[#354B40] hover:text-[#10231D]',
                active && (isDark ? 'text-[#C7FF51]' : 'text-[#849F28]'),
              )}>
                {link.name}
                {active && <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current" />}
              </Link>
            );
          })}
          {user ? (
            <div className="ml-2 flex items-center gap-4">
              <Link href="/organizer/dashboard" className={cn(
                'rounded-full border px-5 py-2.5 text-[0.63rem] font-extrabold uppercase tracking-[0.16em] transition',
                isDark ? 'border-white/25 text-white hover:border-[#C7FF51] hover:text-[#C7FF51]' : 'border-[#10231D]/20 text-[#10231D] hover:border-[#10231D]',
              )}>Dashboard</Link>
              <button type="button" onClick={logout} aria-label="Sign out" className={cn('transition-colors', isDark ? 'text-white/45 hover:text-white' : 'text-[#68786C] hover:text-[#10231D]')}><LogOut size={17} /></button>
            </div>
          ) : (
            <Link href="/auth/login" className="ml-2 inline-flex items-center rounded-full bg-[#C7FF51] px-5 py-3 text-[0.63rem] font-extrabold uppercase tracking-[0.16em] text-[#10231D] transition hover:bg-[#F2FFC8]">Access portal</Link>
          )}
        </div>

        <button type="button" onClick={() => setIsOpen(value => !value)} aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} className={cn('rounded-full p-2 transition-colors lg:hidden', isDark ? 'text-white' : 'text-[#10231D]')}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-0 flex min-h-screen flex-col bg-[#F7F4EC] px-6 pb-10 pt-28 sm:px-10 lg:hidden">
          <div className="absolute right-5 top-5 sm:right-8"><button type="button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="rounded-full p-2 text-[#10231D]"><X size={25} /></button></div>
          <div className="flex flex-col gap-5">
            {links.map(link => <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={cn('font-display text-5xl uppercase leading-none tracking-[-0.03em]', pathname === link.href ? 'text-[#849F28]' : 'text-[#10231D]')}>{link.name}</Link>)}
          </div>
          <div className="mt-auto border-t border-[#D8D8C9] pt-6">
            {user ? <Link href="/organizer/dashboard" onClick={() => setIsOpen(false)} className="flex h-14 items-center justify-center rounded-full bg-[#10231D] text-sm font-extrabold uppercase tracking-[0.16em] text-[#C7FF51]">Open dashboard</Link> : <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex h-14 items-center justify-center rounded-full bg-[#10231D] text-sm font-extrabold uppercase tracking-[0.16em] text-[#C7FF51]">Access portal</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}
