'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Folder, RefreshCw, Image as ImageIcon, Video, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folders?: string[];
}

const DEFAULT_FOLDERS = [
  'astrowave/events/general',
  'astrowave/events/mask-mirage',
  'astrowave/events/splash-and-seduction',
  'astrowave/talent/djs',
  'astrowave/talent/artist',
  'astrowave/brand/logos',
  'astrowave/brand/backgrounds',
  'astrowave/videos/hero'
];

export default function MediaPickerModal({ isOpen, onClose, onSelect, folders = DEFAULT_FOLDERS }: MediaPickerModalProps) {
  const [activeFolder, setActiveFolder] = useState(folders[0]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadResources = useCallback(async (folderPath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cloudinary/folders?folder=${encodeURIComponent(folderPath)}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadResources(activeFolder);
    }
  }, [isOpen, activeFolder, loadResources]);

  const filteredResources = resources.filter(r => 
    r.public_id.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-6xl h-full bg-[#0A0A0F] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-white uppercase tracking-wider">Media Library</h2>
            <p className="text-[0.6rem] text-gold uppercase tracking-[0.2em]">Select an asset from Cloudinary</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/5 bg-black/40 overflow-y-auto p-4 space-y-4">
            <p className="admin-label text-[0.6rem] px-2">Folders</p>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.7rem] transition-all text-left uppercase font-bold tracking-tight",
                    activeFolder === folder 
                      ? "bg-gold/10 text-gold border-l-2 border-gold pl-[10px]" 
                      : "text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  )}
                >
                  <Folder size={14} className={activeFolder === folder ? "text-gold" : "text-muted"} />
                  <span className="truncate">{folder.split('/').pop()}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Browser */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-black/20">
               <div className="relative flex-1">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                 <input 
                   type="text" 
                   placeholder="Filter by name..." 
                   className="admin-input h-10 pl-10 bg-white/5"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
               </div>
               <button onClick={() => loadResources(activeFolder)} className="p-2 text-muted hover:text-white transition-colors">
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 size={32} className="animate-spin text-gold" />
                  <p className="admin-label text-[0.6rem] animate-pulse">Syncing Cloudinary...</p>
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredResources.map((res: any) => (
                    <div 
                      key={res.public_id}
                      onClick={() => {
                        onSelect(res.secure_url);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-lg border border-white/5 hover:border-gold/50 transition-all cursor-pointer overflow-hidden bg-black/40"
                    >
                      {res.resource_type === 'image' ? (
                        <img src={res.secure_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Video size={24} className="text-gold" />
                          <span className="text-[0.5rem] text-muted uppercase font-bold">Video</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                         <div className="space-y-2">
                            <Check size={24} className="mx-auto text-gold" />
                            <p className="text-[0.55rem] text-white font-bold uppercase truncate max-w-[120px]">{res.public_id.split('/').pop()}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-muted opacity-20">
                  <ImageIcon size={64} />
                  <p className="admin-label">No assets found</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
