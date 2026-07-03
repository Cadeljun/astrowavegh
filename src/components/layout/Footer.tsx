'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Music, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0B1F14] border-t border-[#00C853]/15 pt-20 pb-10 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-16">

        {/* Brand */}
        <div className="space-y-6">
          <Logo height={32} />
          <p className="text-white/45 text-sm leading-relaxed max-w-[260px] font-light">
            Africa's next-generation creative powerhouse. Built for the horizon.
          </p>
          <div className="flex gap-4">
            {[Instagram, Twitter, Music].map((Icon, i) => (
              <Link key={i} href="#"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-[#00C853] hover:text-[#00C853] transition-all">
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className="space-y-6">
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#00C853]">Explore</h4>
          <ul className="space-y-4 text-sm text-white/50">
            {[
              { label: 'Our Story',         href: '/about' },
              { label: 'Live Experiences',  href: '/events' },
              { label: 'Talent Management', href: '/management' },
              { label: 'Matching Engine',   href: '/platform' },
            ].map(({ label, href }) => (
              <li key={href}><Link href={href} className="hover:text-[#00C853] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Protocol */}
        <div className="space-y-6">
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#0EA5E9]">Protocol</h4>
          <ul className="space-y-4 text-sm text-white/50">
            {[
              { label: 'Contact Hub',     href: '/contact' },
              { label: 'Terms of Service',href: '/legal/terms-of-service' },
              { label: 'Privacy Policy',  href: '/legal/privacy-policy' },
            ].map(({ label, href }) => (
              <li key={href}><Link href={href} className="hover:text-[#0EA5E9] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* HQ */}
        <div className="space-y-6">
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30">Headquarters</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-white/50">
              <div className="w-9 h-9 rounded-full border border-[#00C853]/20 bg-[#00C853]/8 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#00C853]" />
              </div>
              Accra, Ghana
            </li>
            <li className="flex items-center gap-3 text-sm text-white/50 hover:text-[#0EA5E9] transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/8 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#0EA5E9]" />
              </div>
              info@astrowave.live
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-screen-2xl mx-auto pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4 text-[0.7rem] text-white/25">
        <p>© 2025 AstroWave. Developed for the next generation of African creators.</p>
        <div className="flex items-center gap-6 uppercase tracking-widest text-[0.6rem]">
          <span className="text-[#00C853]/40">Founded by Uzy</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            Accra Node Active
          </span>
        </div>
      </div>
    </footer>
  );
}
