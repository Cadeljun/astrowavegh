
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Zap, 
  Users, 
  Image, 
  Upload, 
  Mail, 
  Bell, 
  FileText, 
  LogOut,
  Menu,
  X,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'CMS Editor', href: '/admin/cms', icon: Edit3 },
  { name: 'Events', href: '/admin/events', icon: Zap },
  { name: 'Talent', href: '/admin/talent', icon: Users },
  { name: 'Gallery', href: '/admin/gallery', icon: Image },
  { name: 'Uploads', href: '/admin/uploads', icon: Upload },
  { name: 'Contacts', href: '/admin/contacts', icon: Mail },
  { name: 'Waitlist', href: '/admin/waitlist', icon: Bell },
  { name: 'Inquiries', href: '/admin/inquiries', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      window.location.href = '/';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-4">
      {/* Top Header */}
      <div className="mb-10 px-4">
        <Link href="/admin/dashboard" className="block">
          <span className="font-display text-[1.5rem] text-gold text-glow-gold">
            ASTROWAVE
          </span>
          <p className="label text-[0.6rem] tracking-[0.1em] mt-1 opacity-60">ADMIN PANEL</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-sm transition-all group",
                isActive 
                  ? "bg-gold-dim text-gold border-l-[3px] border-gold" 
                  : "text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-gold" : "text-muted group-hover:text-white")} />
              <span className="font-body text-[0.875rem] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4 px-2">
        <div className="px-2">
          <p className="text-[0.7rem] text-muted uppercase tracking-widest font-bold mb-1">SIGNED IN AS</p>
          <p className="text-[0.75rem] text-white font-body truncate opacity-80" title={user?.email || ''}>
            {user?.email}
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-sm text-red-400 hover:bg-red-400/10 transition-all group"
        >
          <LogOut size={18} />
          <span className="font-body text-[0.875rem] font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] bg-dark border-r border-border h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-dark border-b border-border z-[2000] flex items-center justify-between px-6">
        <span className="font-display text-[1.2rem] text-gold">ASTROWAVE</span>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2001] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-dark z-[2002] lg:hidden border-r border-border shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
                  <X size={24} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
