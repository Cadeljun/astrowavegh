'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
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
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, platformUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
        'h-[64px] lg:h-[80px] px-6 lg:px-12',
        isScrolled 
          ? 'bg-black/90 backdrop-blur-lg border-b border-white/5 shadow-2xl' 
          : 'bg-transparent'
      )}
    >
      <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
        <Logo height={32} className="lg:h-10" />

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'font-body text-[0.8rem] font-semibold tracking-[0.1em] uppercase transition-colors relative',
                    isActive ? 'text-green' : 'text-muted hover:text-white'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 p-1 rounded-full bg-white/5 border border-white/10 hover:border-green/30 transition-all outline-none">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-green-dim flex items-center justify-center text-green text-[10px] font-bold uppercase">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                      ) : (
                        user.displayName?.charAt(0) || 'U'
                      )}
                    </div>
                    <ChevronDown size={12} className="text-muted mr-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-dark border-white/10 text-white p-2">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="font-bold text-xs truncate uppercase tracking-widest">{user.displayName}</p>
                    <p className="text-[9px] text-muted truncate lowercase font-normal">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-green cursor-pointer py-2 rounded-md">
                    <Link href={getDashboardUrl()} className="flex items-center gap-2.5 w-full text-xs">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-green cursor-pointer py-2 rounded-md">
                    <Link href={getProfileUrl()} className="flex items-center gap-2.5 w-full text-xs">
                      <User size={14} /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => logout()} className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer py-2 rounded-md font-bold text-xs">
                    <LogOut size={14} className="mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-[0.7rem] font-bold text-muted hover:text-white uppercase tracking-widest px-2 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" className="h-10 px-6 text-[0.7rem]">
                    Join
                  </Button>
                </Link>
              </div>
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[2000] bg-black flex flex-col p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <Logo height={32} />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white p-2 hover:text-green transition-colors"
                aria-label="Close Menu"
              >
                <X size={32} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col items-center justify-center gap-8 overflow-y-auto" aria-label="Mobile Navigation">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="font-display text-[2rem] tracking-[0.2em] uppercase text-white hover:text-green"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-8 w-full max-w-[280px] space-y-4">
                {user ? (
                  <>
                    <Link href={getDashboardUrl()} className="w-full">
                      <Button variant="primary" className="w-full h-14 text-[0.8rem]">
                        MY DASHBOARD
                      </Button>
                    </Link>
                    <button onClick={() => logout()} className="w-full py-4 text-[0.7rem] font-bold text-red-400 uppercase tracking-widest border border-red-400/20 rounded-lg">
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link href="/auth/login">
                      <Button variant="secondary" className="w-full h-14 text-[0.8rem]">
                        SIGN IN
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="primary" className="w-full h-14 text-[0.8rem]">
                        CREATE ACCOUNT
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}