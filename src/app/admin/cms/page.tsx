
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Info, 
  Zap, 
  Users, 
  Music, 
  Heart, 
  Mail, 
  Settings, 
  Layout, 
  Search, 
  Monitor, 
  Tablet, 
  Smartphone,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CMSContentEditor from '@/components/cms/CMSContentEditor';
import CMSSectionManager from '@/components/cms/CMSSectionManager';
import CMSSEOEditor from '@/components/cms/CMSSEOEditor';
import LivePreview from '@/components/cms/LivePreview';
import CMSSettingsEditor from '@/components/cms/CMSSettingsEditor';

const PAGES = [
  { id: 'home', label: 'Home', icon: Home, route: '/' },
  { id: 'about', label: 'About', icon: Info, route: '/about' },
  { id: 'events', label: 'Events', icon: Zap, route: '/events' },
  { id: 'management', label: 'Management', icon: Users, route: '/management' },
  { id: 'records', label: 'Records', icon: Music, route: '/records' },
  { id: 'cares', label: 'Cares', icon: Heart, route: '/cares' },
  { id: 'contact', label: 'Contact', icon: Mail, route: '/contact' },
  { id: 'global', label: 'Global Settings', icon: Settings, route: null },
];

const MODES = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'sections', label: 'Sections', icon: Layout },
  { id: 'seo', label: 'SEO', icon: Search },
];

export default function CMSPage() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0]);
  const [mode, setMode] = useState('content');
  const [viewDevice, setViewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-6 lg:-m-12">
      {/* Left: Page Navigator */}
      <aside className="w-[280px] bg-dark border-r border-white/5 flex flex-col p-6 space-y-8 overflow-y-auto">
        <div>
          <p className="admin-label text-[0.6rem] mb-4">PAGE NAVIGATOR</p>
          <div className="space-y-1">
            {PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = selectedPage.id === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all group",
                    isActive 
                      ? "bg-gold-dim text-gold border-l-2 border-gold" 
                      : "text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-gold" : "text-muted opacity-50"} />
                    <span className="text-sm font-medium">{page.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn("opacity-0 transition-all", isActive ? "opacity-100" : "group-hover:opacity-40")} />
                </button>
              );
            })}
          </div>
        </div>

        {selectedPage.id !== 'global' && (
          <div>
            <p className="admin-label text-[0.6rem] mb-4">EDITOR MODE</p>
            <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm text-[0.65rem] font-bold tracking-widest uppercase transition-all",
                    mode === m.id ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
                  )}
                >
                  <m.icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Center: Editor */}
      <main className="flex-1 bg-black overflow-y-auto p-10 border-r border-white/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-1">
            <p className="admin-label text-gold font-mono text-[0.6rem] tracking-[0.3em]">
              {selectedPage.id.toUpperCase()} / {mode.toUpperCase()}
            </p>
            <h1 className="display-md text-white">{selectedPage.label}</h1>
          </div>

          <div className="pt-4">
            {selectedPage.id === 'global' ? (
              <CMSSettingsEditor />
            ) : (
              <>
                {mode === 'content' && <CMSContentEditor pageId={selectedPage.id} />}
                {mode === 'sections' && <CMSSectionManager pageId={selectedPage.id} />}
                {mode === 'seo' && <CMSSEOEditor pageId={selectedPage.id} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Right: Live Preview */}
      {selectedPage.route && (
        <aside className="hidden xl:flex w-[400px] bg-dark flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <p className="admin-label m-0 text-[0.6rem]">LIVE PREVIEW</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewDevice('desktop')}
                className={cn("p-1.5 rounded-sm hover:bg-white/5", viewDevice === 'desktop' ? "text-gold" : "text-muted")}
              >
                <Monitor size={16} />
              </button>
              <button 
                onClick={() => setViewDevice('tablet')}
                className={cn("p-1.5 rounded-sm hover:bg-white/5", viewDevice === 'tablet' ? "text-gold" : "text-muted")}
              >
                <Tablet size={16} />
              </button>
              <button 
                onClick={() => setViewDevice('mobile')}
                className={cn("p-1.5 rounded-sm hover:bg-white/5", viewDevice === 'mobile' ? "text-gold" : "text-muted")}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-black/40 flex items-center justify-center overflow-hidden">
            <LivePreview route={selectedPage.route} device={viewDevice} />
          </div>
        </aside>
      )}
    </div>
  );
}
