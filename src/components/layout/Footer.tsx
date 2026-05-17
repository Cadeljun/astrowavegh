'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Music, Facebook, Mail, MapPin } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useCMSSettings } from '@/lib/cms/useCMS';

export default function Footer() {
  const { settings } = useCMSSettings();

  return (
    <footer className="bg-[var(--color-dark)] border-t border-[var(--color-border)] pt-20 pb-10 px-6 lg:px-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-screen-2xl mx-auto">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20"
        >
          {/* Column 1 — Brand */}
          <motion.div variants={fadeUp} className="space-y-6">
            <Link href="/" className="group block">
              {settings?.logoUrl ? (
                <div className="relative h-12 w-40 mb-2">
                  <Image 
                    src={settings.logoUrl} 
                    alt={settings?.siteName || "AstroWave"} 
                    fill 
                    className="object-contain object-left transition-all group-hover:brightness-125"
                  />
                </div>
              ) : (
                <span className="font-display text-[2rem] text-[var(--color-gold)] text-glow-gold transition-all group-hover:brightness-125">
                  {settings?.siteName?.toUpperCase() || 'ASTROWAVE'}
                </span>
              )}
            </Link>
            <p className="font-body italic text-[0.9rem] text-[var(--color-muted)]">
              &quot;{settings?.tagline || 'Vibes Beyond the Horizon.'}&quot;
            </p>
            <p className="font-body text-[0.85rem] leading-relaxed text-[var(--color-muted)] max-w-[280px]">
              Africa&apos;s next-generation creative entertainment powerhouse — music, events, talent, and culture.
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Twitter, Music, Youtube, Facebook].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-all duration-300"
                  aria-label={`Visit AstroWave on ${Icon.name}`}
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Column 2 — Quick Links */}
          <motion.nav variants={fadeUp} className="space-y-6" aria-label="Footer Quick Links">
            <SectionLabel className="mb-0">Explore</SectionLabel>
            <ul className="flex flex-col gap-4">
              {['Home', 'About', 'Events', 'Management', 'Contact'].map((link) => (
                <li key={link}>
                  <Link 
                    href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                    className="font-body text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-white)] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Column 3 — Divisions */}
          <motion.nav variants={fadeUp} className="space-y-6" aria-label="Footer Divisions">
            <SectionLabel className="mb-0">Divisions</SectionLabel>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/events" className="font-body text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-white)] transition-colors">
                  AstroWave Events
                </Link>
              </li>
              <li>
                <Link href="/management" className="font-body text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-white)] transition-colors">
                  AstroWave Management
                </Link>
              </li>
              <li>
                <Link href="/records" className="font-body text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-white)] transition-colors flex items-center gap-2">
                  AstroWave Records <span className="text-[0.7rem] text-[var(--color-muted)]/50 italic">(Coming Soon)</span>
                </Link>
              </li>
              <li>
                <Link href="/cares" className="font-body text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-white)] transition-colors flex items-center gap-2">
                  AstroWave Cares <span className="text-[0.7rem] text-[var(--color-muted)]/50 italic">(Coming Soon)</span>
                </Link>
              </li>
            </ul>
          </motion.nav>

          {/* Column 4 — Get In Touch */}
          <motion.div variants={fadeUp} className="space-y-6">
            <SectionLabel className="mb-0">Connect</SectionLabel>
            <ul className="flex flex-col gap-6">
              <li className="flex items-center gap-3 font-body text-[0.9rem] text-[var(--color-muted)]">
                <Mail size={14} className="text-[var(--color-gold)]" />
                {settings?.email || 'info@astrowave.com'}
              </li>
              <li className="flex items-center gap-3 font-body text-[0.9rem] text-[var(--color-muted)]">
                <MapPin size={14} className="text-[var(--color-gold)]" />
                {settings?.location || 'Accra, Ghana'}
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="font-body text-[0.9rem] font-medium text-[var(--color-gold)] hover:underline flex items-center gap-2"
                >
                  Book an Event &rarr;
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <Divider className="opacity-10 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[0.75rem] font-body text-[var(--color-muted)] text-center md:text-left">
          <p>&copy; 2025 AstroWave. All Rights Reserved.</p>
          <p>Founded by Calvin Mensah Delali (Uzy)</p>
        </div>
      </div>
    </footer>
  );
}
