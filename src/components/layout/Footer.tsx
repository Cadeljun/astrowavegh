'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Music, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-border pt-20 pb-10 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <Logo height={32} />
          <p className="text-muted text-sm leading-relaxed max-w-[280px]">
            Africa&apos;s next-generation creative powerhouse. Born in Accra, built for Africa, destined for the world.
          </p>
          <div className="flex gap-4">
            {[Instagram, Twitter, Music].map((Icon, i) => (
              <Link key={i} href="#" className="text-muted hover:text-green transition-colors"><Icon size={20} /></Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="label">Explore</h4>
          <ul className="space-y-4 text-sm text-muted">
            <li><Link href="/about" className="hover:text-white">Our Story</Link></li>
            <li><Link href="/events" className="hover:text-white">Live Experiences</Link></li>
            <li><Link href="/management" className="hover:text-white">Talent Management</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="label">Support</h4>
          <ul className="space-y-4 text-sm text-muted">
            <li><Link href="/contact" className="hover:text-white">Contact Hub</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Protocol</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Data Privacy</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="label">Headquarters</h4>
          <ul className="space-y-4 text-sm text-muted">
            <li className="flex items-center gap-3"><MapPin size={14} className="text-green" /> Accra, Ghana</li>
            <li className="flex items-center gap-3"><Mail size={14} className="text-green" /> info@astrowave.live</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-screen-2xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.65rem] font-bold text-muted uppercase tracking-widest">
        <p>&copy; 2025 AstroWave. All rights reserved.</p>
        <p>Founded by Calvin Mensah Delali (Uzy)</p>
      </div>
    </footer>
  );
}