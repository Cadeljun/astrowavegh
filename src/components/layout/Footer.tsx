'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Music, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Divider } from '@/components/ui/Divider';

export default function Footer() {
  return (
    <footer className="bg-[#030B14] border-t border-dark-border pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <div className="space-y-8">
          <Logo height={32} />
          <p className="text-dark-subtext text-sm leading-relaxed max-w-[280px] italic font-light">
            Africa's next-generation creative powerhouse. Built for the horizon.
          </p>
          <div className="flex gap-6">
            {[Instagram, Twitter, Music].map((Icon, i) => (
              <Link key={i} href="#" className="text-dark-muted hover:text-green transition-all transform hover:scale-110">
                <Icon size={20} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="font-body text-[0.7rem] font-bold uppercase tracking-[0.2em] text-dark-muted">Explore</h4>
          <ul className="space-y-5 text-[0.9rem] text-dark-subtext">
            <li><Link href="/about" className="hover:text-green transition-colors">Our Story</Link></li>
            <li><Link href="/events" className="hover:text-green transition-colors">Live Experiences</Link></li>
            <li><Link href="/management" className="hover:text-green transition-colors">Talent Management</Link></li>
            <li><Link href="/platform" className="hover:text-green transition-colors">Matching Engine</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="font-body text-[0.7rem] font-bold uppercase tracking-[0.2em] text-dark-muted">Protocol</h4>
          <ul className="space-y-5 text-[0.9rem] text-dark-subtext">
            <li><Link href="/contact" className="hover:text-green transition-colors">Contact Hub</Link></li>
            <li><Link href="/legal/terms-of-service" className="hover:text-green transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal/privacy-policy" className="hover:text-green transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="font-body text-[0.7rem] font-bold uppercase tracking-[0.2em] text-dark-muted">Headquarters</h4>
          <ul className="space-y-5 text-[0.9rem] text-dark-subtext">
            <li className="flex items-center gap-4 group cursor-default">
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border group-hover:border-green transition-colors">
                <MapPin size={16} className="text-green" />
              </div>
              <span>Accra, Ghana</span>
            </li>
            <li className="flex items-center gap-4 group cursor-pointer">
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border group-hover:border-green transition-colors">
                <Mail size={16} className="text-green" />
              </div>
              <span className="group-hover:text-white transition-colors">info@astrowave.live</span>
            </li>
          </ul>
        </div>
      </div>
      
      <Divider variant="dark" className="mb-10" />

      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[0.75rem] font-medium text-dark-muted">
        <p className="font-body">© 2025 AstroWave. Developed for the next generation of African creators.</p>
        <div className="flex items-center gap-8 font-body uppercase tracking-widest text-[0.65rem]">
          <span>Founded by Uzy</span>
          <span className="w-1 h-1 rounded-full bg-dark-muted" />
          <span>Accra Node Active</span>
        </div>
      </div>
    </footer>
  );
}
