'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  MessageSquare, 
  Star, 
  LogOut, 
  Bell, 
  ChevronDown,
  Settings,
  ShieldCheck,
  Zap,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { useRole } from '@/context/RoleContext';
import { Badge } from '@/components/ui/Badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import NotificationPanel from '@/components/platform/NotificationPanel';
import PlatformGuard from '@/components/platform/PlatformGuard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

const talentNav = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/talent/profile', icon: User },
  { label: 'Bookings', href: '/talent/bookings', icon: MessageSquare },
  { label: 'Reviews', href: '/talent/reviews', icon: Star },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, platformUser, logout } = useAuth();
  const { isSuperAdmin } = useRole();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false));
    return onSnapshot(q, (snap) => setUnreadCount(snap.size));
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PlatformGuard requiredRole="talent">
      <div className="min-h-screen bg-black flex flex-col">
        {/* Cinematic Header */}
        <header className={cn(
          "fixed top-0 left-0 w-full z-[1000] transition-all duration-500 h-20 flex items-center px-6 lg:px-12 border-b",
          isScrolled ? "bg-black/90 backdrop-blur-xl border-white/5 shadow-2xl" : "bg-transparent border-transparent"
        )}>
          <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <span className="font-display text-2xl text-purple tracking-[0.2em] text-glow-purple transition-all group-hover:brightness-125 uppercase">
                ASTROWAVE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 bg-white/5 border border-white/5 px-8 py-2.5 rounded-full shadow-inner">
              {talentNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                      isActive ? "text-purple" : "text-muted hover:text-white"
                    )}
                  >
                    <item.icon size={12} className={cn("transition-transform", isActive ? "scale-110" : "")} />
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="talent-nav-dot" className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple shadow-[0_0_8px_var(--color-purple)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Group */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsNotifyOpen(true)}
                className="relative p-2.5 rounded-full bg-white/5 border border-white/5 text-muted hover:text-purple transition-all group"
              >
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1 pl-4 rounded-full bg-white/5 border border-white/5 group hover:border-purple/30 transition-all">
                    <div className="text-right hidden sm:block">
                       <p className="text-[0.65rem] font-bold text-white uppercase tracking-widest">{platformUser?.stageName || user?.displayName}</p>
                       <p className="text-[0.55rem] text-muted uppercase font-bold tracking-tighter">WS: {(platformUser?.waveScore || 0).toFixed(1)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-dim border-2 border-purple/30 flex items-center justify-center text-purple text-xs font-bold overflow-hidden">
                      {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : platformUser?.stageName?.[0] || 'T'}
                    </div>
                    <ChevronDown size={14} className="text-muted mr-3 group-hover:text-white transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-dark border-white/10 text-white p-2">
                  <DropdownMenuLabel className="px-4 py-3">
                     <p className="font-display text-xl tracking-widest uppercase">{platformUser?.stageName || 'Talent'}</p>
                     <p className="text-[0.6rem] text-muted uppercase tracking-[0.1em] font-bold">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5 mx-2" />
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-purple cursor-pointer rounded-md h-11 px-4" asChild>
                    <Link href="/talent/profile"><User className="mr-3 h-4 w-4" /> Edit My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-purple cursor-pointer rounded-md h-11 px-4">
                    <Settings className="mr-3 h-4 w-4" /> Account Settings
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem className="focus:bg-cyan-500/10 focus:text-cyan-400 cursor-pointer rounded-md h-11 px-4" asChild>
                      <Link href="/admin/dashboard"><ShieldCheck className="mr-3 h-4 w-4" /> System Control</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5 mx-2" />
                  <DropdownMenuItem onClick={logout} className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-md h-11 px-4">
                    <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-[1000] bg-black/90 backdrop-blur-2xl border-t border-white/5 h-20 px-4 flex items-center justify-around">
          {talentNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1.5 transition-all", isActive ? "text-purple" : "text-muted")}>
                <item.icon size={20} className={isActive ? "animate-pulse" : ""} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <Link href="/" className="flex flex-col items-center gap-1.5 text-muted">
            <Home size={20} />
            <span className="text-[0.6rem] font-bold uppercase tracking-widest">Home</span>
          </Link>
        </nav>

        {/* Content Area */}
        <main className="flex-1 pt-24 lg:pt-32 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>

        <NotificationPanel isOpen={isNotifyOpen} onClose={() => setIsNotifyOpen(false)} />
      </div>
    </PlatformGuard>
  );
}