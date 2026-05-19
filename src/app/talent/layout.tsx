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
  Zap
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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false));
    return onSnapshot(q, (snap) => setUnreadCount(snap.size));
  }, [user]);

  return (
    <PlatformGuard requiredRole="talent">
      <div className="flex min-h-screen bg-black">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen bg-[#050505] z-50">
          <div className="p-8 border-b border-white/5">
            <Link href="/" className="font-display text-2xl text-purple tracking-widest uppercase text-glow-purple">ASTROWAVE</Link>
            <p className="label text-[0.6rem] mt-1 text-muted">TALENT HUB</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {talentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-purple-dim text-purple border-l-2 border-purple pl-[14px]" 
                      : "text-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-purple" : "text-muted")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            {isSuperAdmin && (
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-md transition-all text-xs uppercase font-bold tracking-widest">
                <ShieldCheck size={18} /> Admin Portal
              </Link>
            )}
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all text-xs uppercase font-bold tracking-widest">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-[60]">
            <div className="flex items-center gap-4">
              <span className="text-[0.65rem] font-bold text-muted uppercase tracking-[0.3em]">Identity Hub</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsNotifyOpen(true)}
                className="relative p-2 text-muted hover:text-white transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/40 flex items-center justify-center text-purple text-[10px] font-bold overflow-hidden">
                      {user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.displayName?.[0] || 'T'}
                    </div>
                    <ChevronDown size={14} className="text-muted group-hover:text-white transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-dark border-white/10 text-white">
                  <DropdownMenuLabel className="font-display text-lg tracking-widest">{user?.displayName || 'Talent'}</DropdownMenuLabel>
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-purple cursor-pointer" asChild>
                    <Link href="/talent/profile"><User className="mr-2 h-4 w-4" /> Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-purple cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={logout} className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-12 max-w-screen-2xl mx-auto w-full">
            {children}
          </main>
        </div>

        <NotificationPanel isOpen={isNotifyOpen} onClose={() => setIsNotifyOpen(false)} />
      </div>
    </PlatformGuard>
  );
}
