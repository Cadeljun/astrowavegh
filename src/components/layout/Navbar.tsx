'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, User, LogOut } from 'lucide-react';
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[1000] transition-all duration-300 px-6 lg:px-12",
      isScrolled ? "h-16 bg-black/80 backdrop-blur-xl border-b border-white/5" : "h-24 bg-transparent"
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
                "text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-colors",
                pathname === link.href ? "text-green" : "text-muted hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4 ml-6">
              <Link href={user.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard'}>
                <Button variant="ghost" size="sm" className="h-10"><LayoutDashboard size={14} className="mr-2" /> DASHBOARD</Button>
              </Link>
              <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors"><LogOut size={18} /></button>
            </div>
          ) : (
            <Link href="/auth/login" className="ml-6">
              <Button size="sm" className="h-10 px-8">LOGIN</Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] bg-black z-[999] p-8 flex flex-col gap-8 animate-in slide-in-from-top-4">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-display uppercase tracking-widest text-white"
            >
              {link.name}
            </Link>
          ))}
          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
            <Button className="w-full h-14">ACCESS PORTAL</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}