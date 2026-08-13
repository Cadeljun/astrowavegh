'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, MapPin, ExternalLink } from 'lucide-react';
import Logo from '@/components/ui/Logo';

// Custom TikTok icon
function TikTokIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

// Custom YouTube icon
function YouTubeIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/astrowaveevent' },
  { icon: TikTokIcon, label: 'TikTok', href: 'https://tiktok.com/@astrowaveevent' },
  { icon: YouTubeIcon, label: 'YouTube', href: 'https://youtube.com/@astrowaveevent' },
];

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
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-[#00C853] hover:text-[#00C853] transition-all"
                title={social.label}>
                <social.icon size={16} />
              </a>
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
            <li>
              <a href="https://maps.google.com/?q=Coaches+Lounge+East+Legon+Accra+Ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#00C853] transition-colors group">
                <div className="w-9 h-9 rounded-full border border-[#00C853]/20 bg-[#00C853]/8 flex items-center justify-center shrink-0 group-hover:bg-[#00C853]/15 transition-colors">
                  <MapPin size={14} className="text-[#00C853]" />
                </div>
                <div>
                  <p>Coaches Lounge, East Legon</p>
                  <p className="text-[0.55rem] text-white/30 flex items-center gap-1">
                    <ExternalLink size={8} />
                    Open in Maps
                  </p>
                </div>
              </a>
            </li>
            <li>
              <a href="mailto:astrowaveevent@gmail.com"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#0EA5E9] transition-colors">
                <div className="w-9 h-9 rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/8 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-[#0EA5E9]" />
                </div>
                astrowaveevent@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-screen-2xl mx-auto pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4 text-[0.7rem] text-white/25">
        <p>© 2026 AstroWave Entertainment. All rights reserved.</p>
        <div className="flex items-center gap-6 uppercase tracking-widest text-[0.6rem]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            Accra We Dey Active
          </span>
        </div>
      </div>
    </footer>
  );
}
