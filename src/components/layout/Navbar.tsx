'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Twitter, Music, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Management', href: '/management' },
  { name: 'Platform', href: '/platform' },
  { name: 'Records', href: '/records', badge: 'Soon' },
  { name: 'Cares', href: '/cares', badge: 'Soon' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, platformUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getDashboardUrl = () => {
    if (!platformUser) return '/auth/login';
    if (platformUser.role === 'talent') return '/talent/dashboard';
    return '/organizer/dashboard';
  };

  const getProfileUrl = () => {
    if (platformUser?.role === 'talent') return '/talent/profile';
    return '/organizer/profile';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-[1000] transition-all duration-300 flex items-center',
        'h-[64px] lg:h-[72px] px-6 lg:px-12',
        isScrolled 
          ? 'bg-black/90 backdrop-blur-lg border-b border-blue/20 shadow-2xl' 
          : 'bg-transparent'
      )}
    >
      <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
        <Logo height={36} />

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
          <div className="flex items-center gap-8 mr-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'font-body text-[0.85rem] font-medium tracking-[0.1em] uppercase transition-colors relative flex items-center gap-1.5',
                    isActive ? 'text-green' : 'text-muted hover:text-white'
                  )}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[0.6rem] bg-green-dim text-green rounded-full px-1.5 py-0.5 leading-none font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10 hover:border-green/30 transition-all outline-none">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-green-dim flex items-center justify-center text-green text-xs font-bold uppercase">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                      ) : (
                        user.displayName?.charAt(0) || 'U'
                      )}
                    </div>
                    <ChevronDown size={14} className="text-muted mr-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-dark border-white/10 text-white p-2">
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="font-bold text-sm truncate uppercase tracking-widest">{user.displayName}</p>
                    <p className="text-[10px] text-muted truncate lowercase">{user.email}</p>
                    {platformUser?.role && (
                      <div className="mt-2 inline-block px-2 py-0.5 rounded bg-green-dim text-green text-[9px] font-bold uppercase tracking-widest border border-green/20">
                        {platformUser.role}
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-green cursor-pointer py-3 rounded-lg">
                    <Link href={getDashboardUrl()} className="flex items-center gap-3 w-full">
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-green cursor-pointer py-3 rounded-lg">
                    <Link href={getProfileUrl()} className="flex items-center gap-3 w-full">
                      <User size={16} /> Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => logout()} className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer py-3 rounded-lg font-bold">
                    <LogOut size={16} className="mr-3" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login" className="text-[0.75rem] font-bold text-muted hover:text-white uppercase tracking-widest px-4 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" className="h-11 shadow-[0_0_15px_rgba(0,255,135,0.2)]">
                    Join Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white p-2 transition-colors hover:text-green"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-[2000] bg-dark flex flex-col p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <Logo height={40} />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white p-2 hover:text-green transition-colors"
                aria-label="Close Menu"
              >
                <X size={32} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col items-center justify-center gap-8" aria-label="Mobile Navigation">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className="font-display text-[2.5rem] tracking-widest uppercase text-white hover:text-green"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-8 w-full space-y-4">
                {user ? (
                  <>
                    <Link href={getDashboardUrl()} className="w-full">
                      <Button variant="primary" size="lg" className="w-full h-14">
                        DASHBOARD
                      </Button>
                    </Link>
                    <button onClick={() => logout()} className="w-full py-4 text-xs font-bold text-red-400 uppercase tracking-widest border border-red-400/20 rounded-xl">
                      SIGN OUT
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" className="w-full block">
                    <Button variant="primary" size="lg" className="w-full h-14 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                      SIGN IN
                    </Button>
                  </Link>
                )}
              </div>
            </nav>

            <div className="flex items-center justify-center gap-8 pt-12">
              {[Instagram, Twitter, Music].map((Icon, i) => (
                <Link key={i} href="#" className="text-muted hover:text-green transition-colors">
                  <Icon size={24} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
