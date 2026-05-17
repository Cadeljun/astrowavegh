'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Map, ArrowRight, Copy, ExternalLink, Database, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MEDIA_MAP = [
  { folder: 'astrowave/events/general', firestore: 'events/{eventId}', field: 'imageUrl', desc: 'Default event posters' },
  { folder: 'astrowave/events/mask-mirage', firestore: 'events/{id}', field: 'imageUrl', desc: 'Mask Mirage specific assets' },
  { folder: 'astrowave/talent/djs', firestore: 'talent/{talentId}', field: 'imageUrl', desc: 'DJ roster profile photos' },
  { folder: 'astrowave/brand/logos', firestore: 'cms_settings/global', field: 'logoUrl', desc: 'Brand identity assets' },
  { folder: 'astrowave/videos/hero', firestore: 'cms_settings/global', field: 'heroVideoUrl', desc: 'Homepage hero video streams' },
  { folder: 'astrowave/gallery/past-events', firestore: 'gallery/{id}', field: 'imageUrl', desc: 'Memory archive photos' },
  { folder: 'astrowave/brand/backgrounds', firestore: 'cms_seo/{page}', field: 'ogImage', desc: 'SEO & social share cards' },
];

export default function MediaMapPage() {
  const { toast } = useToast();

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast({ title: 'Path Copied' });
  };

  return (
    <div className="space-y-12">
      <SectionHeading 
        label="CORE ARCHITECTURE" 
        title="MEDIA MAP" 
        subtitle="Visualizing the link between Cloudinary assets and Firestore data."
      />

      <div className="grid grid-cols-1 gap-4">
        {MEDIA_MAP.map((item, i) => (
          <Card key={i} className="p-6 bg-[#0A0A0F] border-white/5 flex items-center gap-8 group" glowColor="muted">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-[0.65rem] font-bold uppercase tracking-widest">
                    <Cloud size={10} /> Cloudinary Path
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-white text-sm bg-white/5 px-2 py-1 rounded">{item.folder}</code>
                    <button onClick={() => copy(item.folder)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all"><Copy size={12} /></button>
                  </div>
                </div>

                <ArrowRight size={20} className="text-muted/20" />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gold font-mono text-[0.65rem] font-bold uppercase tracking-widest">
                    <Database size={10} /> Firestore Field
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-white text-sm bg-gold/5 px-2 py-1 rounded border border-gold/10">{item.firestore} → {item.field}</code>
                    <button onClick={() => copy(`${item.firestore}.${item.field}`)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all"><Copy size={12} /></button>
                  </div>
                </div>
              </div>
              <p className="text-[0.65rem] text-muted italic">Purpose: {item.desc}</p>
            </div>
            
            <div className="flex gap-2">
               <button className="p-3 bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg transition-all" title="View in Cloudinary">
                 <ExternalLink size={16} />
               </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-8 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 flex gap-4">
        <Map size={24} className="shrink-0" />
        <div className="space-y-2">
          <p className="font-bold text-sm uppercase tracking-widest">Architectural Note</p>
          <p className="text-xs leading-relaxed">
            The AstroWave site is built to be "Data-First." Never hardcode media URLs. By storing Cloudinary links in Firestore, you can swap any visual element instantly from the Admin Panel or Dev Command Center without a redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}
