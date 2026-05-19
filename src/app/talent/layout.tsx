
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, MessageSquare, DollarSign, Star, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';

const sidebarItems = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/talent/profile', icon: User },
  { label: 'Bookings', href: '/talent/bookings', icon: MessageSquare },
  { label: 'Earnings', href: '/talent/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/talent/reviews', icon: Star },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen bg-[#050505]">
        <div className="p-8 border-b border-white/5">
          <Link href="/platform" className="font-display text-2xl text-purple tracking-widest uppercase">ASTROWAVE</Link>
          <p className="label text-[0.6rem] mt-1 text-muted">TALENT HUB</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all",
                  isActive ? "bg-purple/10 text-purple border-l-2 border-purple pl-[14px]" : "text-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all text-sm uppercase font-bold tracking-widest">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
            {sidebarItems.find(i => i.href === pathname)?.label || 'AstroWave'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/40 flex items-center justify-center text-purple text-[10px] font-bold">TA</div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
