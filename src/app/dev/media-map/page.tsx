'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Map, ArrowRight, Copy, ExternalLink, Database, Cloud, Zap, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MEDIA_SCHEMA } from '@/lib/cloudinary';
import { Badge } from '@/components/ui/Badge';

export default function MediaMapPage() {
  const { toast } = useToast();

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast({ title: 'Path Copied' });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeading 
          label="CORE ARCHITECTURE" 
          title="MEDIA SYNC MAP" 
          subtitle="Visualizing the automated link between Cloudinary assets and Firestore documents."
          className="mb-0"
        />
        <div className="flex items-center gap-3 px-4 py-2 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[0.6rem] font-bold uppercase tracking-widest">
           <Zap size={12} className="animate-pulse" /> Active Connection: Live
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(MEDIA_SCHEMA).map(([key, item]) => (
          <Card key={key} className="p-8 bg-[#0A0A0F] border-white/5 flex flex-col lg:flex-row lg:items-center gap-10 group relative" glowColor="muted">
            <div className="lg:w-48 space-y-2">
               <Badge variant="active" className="bg-white/5 border-white/10 text-muted">{key.toUpperCase()}</Badge>
               <h4 className="text-lg font-bold text-white uppercase tracking-tight">{item.label}</h4>
               <p className="text-[0.65rem] text-muted italic leading-relaxed">{item.description}</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-12">
              {/* Cloudinary Section */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[0.6rem] font-bold uppercase tracking-widest opacity-60">
                  <Cloud size={10} /> Cloudinary Storage
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-white text-xs bg-white/5 px-3 py-2 rounded border border-white/10 truncate flex-1">
                    {item.path}
                  </code>
                  <button onClick={() => copy(item.path)} className="p-2 hover:bg-white/10 rounded transition-all"><Copy size={12} /></button>
                </div>
              </div>

              <div className="hidden md:block">
                <ArrowRight size={24} className="text-muted/10" />
              </div>

              {/* Firestore Section */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-gold font-mono text-[0.6rem] font-bold uppercase tracking-widest opacity-60">
                  <Database size={10} /> Firestore Registry
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-white text-xs bg-gold/5 px-3 py-2 rounded border border-gold/10 truncate flex-1">
                    {item.firestore}
                  </code>
                  <button onClick={() => copy(item.firestore)} className="p-2 hover:bg-gold/10 rounded transition-all"><Copy size={12} /></button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 lg:w-48 pt-4 lg:pt-0 lg:border-l border-white/5 lg:pl-10">
               <p className="text-[0.55rem] label m-0">Affected Fields</p>
               <div className="flex flex-wrap gap-1.5">
                  {item.fields.map(f => (
                    <span key={f} className="text-[0.55rem] font-mono text-cyan-400/60 bg-cyan-400/5 px-1.5 py-0.5 rounded uppercase">
                      {f}
                    </span>
                  ))}
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-8 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 flex gap-6">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Info size={24} />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-sm uppercase tracking-widest">Architectural Principle: Data-First Media</p>
          <p className="text-xs leading-relaxed opacity-80">
            AstroWave utilizes a strictly decoupled media layer. Visual assets are never hardcoded. By mapping Cloudinary folders to specific Firestore documents, the entire visual identity of the platform can be swapped instantly from the Dev Command Center or Admin Panel without requiring a code push or rebuild.
          </p>
        </div>
      </div>
    </div>
  );
}
