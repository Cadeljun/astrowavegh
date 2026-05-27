'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[1000] transition-all duration-[var(--transition-base)] px-6 lg:px-12",
      isScrolled 
        ? "h-20 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border shadow-md" 
        : "h-28 bg-transparent"
    )}>
      <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between">
        <Logo height={32} />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-[0.75rem] font-semibold uppercase tracking-[0.15em] transition-colors relative",
                pathname === link.href ? "text-green" : "text-white/70 hover:text-white",
                pathname === link.href && "after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-green"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4 ml-6">
              <Link href={user.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard'}>
                <Button variant="outline-dark" size="sm" className="h-10">Dashboard</Button>
              </Link>
              <button onClick={logout} className="text-dark-muted hover:text-red-400 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="ml-6">
              <Button size="sm" className="h-10 px-8">Access Portal</Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-dark-bg z-[999] p-8 pt-32 flex flex-col gap-10 animate-in fade-in zoom-in-95">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-6 text-white"><X size={32} /></button>
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-4xl font-display font-bold text-white hover:text-green transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-10 border-t border-dark-border">
            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-16 text-lg">Access Portal</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
