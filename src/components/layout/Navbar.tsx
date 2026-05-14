'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Twitter, Youtube, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Management', href: '/management' },
  { name: 'Records', href: '/records', badge: 'Soon' },
  { name: 'Cares', href: '/cares', badge: 'Soon' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 w-full z-[1000] transition-all duration-300 flex items-center',
          'h-[64px] lg:h-[72px] px-6 lg:px-12',
          isScrolled 
            ? 'bg-black/85 backdrop-blur-lg border-b border-[var(--color-border)]' 
            : 'bg-transparent'
        )}
      >
        <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="font-display text-[1.8rem] text-[var(--color-gold)] text-glow-gold transition-all group-hover:brightness-125">
              ASTROWAVE
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-8 mr-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'font-body text-[0.85rem] font-medium tracking-[0.1em] uppercase transition-colors relative flex items-center gap-1.5',
                      isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-muted)] hover:text-[var(--color-white)]'
                    )}
                  >
                    {link.name}
                    {link.badge && (
                      <span className="text-[0.6rem] bg-[var(--color-gold-dim)] text-[var(--color-gold)] rounded-full px-1.5 py-0.5 leading-none font-bold">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[var(--color-gold)]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <Button variant="primary" size="sm" asChild>
              <Link href="/contact">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-[var(--color-white)] p-2 transition-colors hover:text-[var(--color-gold)]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-[2000] bg-[var(--color-dark)] flex flex-col p-8 lg:hidden"
          >
            {/* Grain texture logic is applied via body::before in design system */}
            
            <div className="flex justify-end mb-12">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[var(--color-white)] p-2 hover:text-[var(--color-gold)] transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'font-display text-[2.5rem] tracking-widest uppercase transition-colors flex items-center gap-3',
                        isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-white)] hover:text-[var(--color-gold)]'
                      )}
                    >
                      {link.name}
                      {link.badge && (
                         <span className="text-[0.7rem] bg-[var(--color-gold-dim)] text-[var(--color-gold)] rounded-full px-2 py-1 leading-none font-bold">
                           {link.badge}
                         </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.08 }}
                className="mt-8"
              >
                <Button variant="primary" size="lg" asChild className="px-12">
                  <Link href="/contact">Book Now</Link>
                </Button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-8 pt-12"
            >
              {[Instagram, Twitter, Music, Youtube].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  <Icon size={24} />
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
