
'use client';

import React from 'react';
import { notFound, usePathname } from 'next/navigation';
import { 
  Package, 
  Palette, 
  Type, 
  Wind, 
  Database, 
  Cloud, 
  PlusCircle, 
  Eye,
  Terminal,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'CMS Editor', href: '/admin/cms', icon: Edit3 },
  { name: 'Components', href: '/dev/components', icon: Package },
  { name: 'Colors', href: '/dev/colors', icon: Palette },
  { name: 'Typography', href: '/dev/typography', icon: Type },
  { name: 'Animations', href: '/dev/animations', icon: Wind },
  { name: 'Firebase', href: '/dev/firebase', icon: Database },
  { name: 'Cloudinary', href: '/dev/cloudinary', icon: Cloud },
  { name: 'Seed Data', href: '/dev/seed', icon: PlusCircle },
  { name: 'Previews', href: '/dev/previews', icon: Eye },
];

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Safety check: Only accessible in development
  if (process.env.NODE_ENV !== 'development' && !pathname.includes('preview')) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#A0A0A0] font-mono selection:bg-gold selection:text-black">
      {/* Dev Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0F] sticky top-0 h-screen flex flex-col overflow-y-auto">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <Terminal size={20} className="text-gold" />
          <span className="font-bold text-white tracking-tighter text-lg uppercase">Dev_Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-sm text-sm transition-all group",
                  isActive 
                    ? "bg-white/5 text-gold border-l-2 border-gold" 
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={cn(isActive ? "text-gold" : "text-muted opacity-50")} />
                  <span>{link.name}</span>
                </div>
                <ChevronRight size={12} className={cn("opacity-0 transition-all", isActive ? "opacity-100" : "group-hover:opacity-40")} />
              </a>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500/80">Dev Environment</span>
          </div>
          <p className="text-[10px] opacity-40">Build: {new Date().toLocaleDateString()}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 max-w-6xl mx-auto w-full">
        <div className="mb-12 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-[0.3em] text-gold uppercase">System / {pathname.split('/').pop()?.replace('-', ' ')}</p>
            <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">{pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}</h1>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
