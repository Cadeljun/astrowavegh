'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Save, Info, Shield, Loader2, Menu, Star, Instagram, Facebook, Twitter, Youtube, Music } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import BrandingRow from '@/components/dev/BrandingRow';
import { cn } from '@/lib/utils';

const ASSETS = [
  {
    id: 'logo',
    name: 'Logo',
    description: 'This logo will appear in the navbar and across the site.',
    specs: 'Recommended: PNG / SVG\nSize: 200×60px',
    dropText: 'Drop your logo here',
    folder: 'astrowave/brand/logos',
    field: 'logoUrl'
  },
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Main hero background image for the homepage.',
    specs: 'Recommended: 1920×1080px or higher',
    dropText: 'Drop hero image here',
    folder: 'astrowave/brand/backgrounds',
    field: 'heroImageUrl'
  },
  {
    id: 'favicon',
    name: 'Favicon',
    description: 'Small icon shown in browser tab and bookmarks.',
    specs: 'Recommended: 512×512px (PNG)',
    dropText: 'Drop favicon here',
    folder: 'astrowave/brand/logos',
    field: 'faviconUrl'
  },
  {
    id: 'banner',
    name: 'Social Media Banner',
    description: 'Banner image for social media sharing (Facebook, Twitter, etc.)',
    specs: 'Recommended: 1200×630px',
    dropText: 'Drop banner image here',
    folder: 'astrowave/brand/og-images',
    field: 'ogImageHome'
  },
  {
    id: 'footer-logo',
    name: 'Footer Logo',
    description: 'Logo displayed in the footer section.',
    specs: 'Recommended: PNG / SVG\nSize: 180×50px',
    dropText: 'Drop footer logo here',
    folder: 'astrowave/brand/logos',
    field: 'logoDarkUrl'
  },
  {
    id: 'hero-video',
    name: 'Hero Video',
    description: 'Background video that plays in the hero section. Replaces hero image if set.',
    specs: 'Recommended: MP4\nMax: 100MB',
    dropText: 'Drop video here',
    folder: 'astrowave/videos/hero',
    field: 'heroVideoUrl',
    accept: 'video/mp4,video/webm'
  }
];

export default function BrandAssetsPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'cms_settings', 'global'));
        if (snap.exists()) {
          setAssets(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = (field: string, url: string) => {
    setPending(prev => ({ ...prev, [field]: url }));
  };

  const handleSave = async () => {
    if (Object.keys(pending).length === 0) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms_settings', 'global'), {
        ...pending,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setAssets(prev => ({ ...prev, ...pending }));
      setPending({});
      toast({ title: "Assets Synced", description: "All brand assets saved successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const effectiveAssets = { ...assets, ...pending };
  const pendingCount = Object.keys(pending).length;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green" size={32} />
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-muted">Syncing Brand Repository...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-8 lg:-m-12">
      {/* CENTER — Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-10 lg:p-14 scrollbar-hide border-r border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div className="space-y-2">
              <h1 className="font-display text-4xl text-white uppercase tracking-tight">Media & Branding</h1>
              <p className="text-sm text-muted">Manage logos, hero images, and other media used across the AstroWave platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline-dark" 
                size="sm" 
                className="h-10 px-6 border-white/10"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink size={14} className="mr-2" /> VIEW SITE
              </Button>
              <Button 
                disabled={pendingCount === 0 || saving}
                size="sm" 
                className="h-10 px-6"
                onClick={handleSave}
              >
                {saving ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <Save size={14} className="mr-2" /> 
                    {pendingCount > 0 ? `SAVE ${pendingCount} CHANGES` : 'SAVE ALL CHANGES'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-0">
            {ASSETS.map((asset) => (
              <BrandingRow
                key={asset.id}
                {...asset}
                currentUrl={effectiveAssets[asset.field] || ''}
                isPending={pending[asset.field] !== undefined}
                onUpload={(url) => handleUpdate(asset.field, url)}
                onRemove={() => handleUpdate(asset.field, '')}
              />
            ))}
          </div>

          {/* Important Notes */}
          <div className="pt-10">
            <Card className="p-8 border-l-[3px] border-l-blue bg-[#0C1E35]/40" noHover>
              <div className="flex items-start gap-4">
                <Shield className="text-blue shrink-0" size={24} />
                <div className="space-y-4">
                  <p className="font-bold text-white uppercase tracking-widest text-sm">Important Notes</p>
                  <ul className="space-y-2 text-xs text-muted leading-relaxed list-disc pl-4">
                    <li>Use high quality images for the best results across all devices.</li>
                    <li>All changes will be instantly reflected on the website via real-time sync.</li>
                    <li>Clear your browser cache if you don't see changes immediately due to CDN caching.</li>
                    <li>The Hero Video takes priority over the Hero Image if both are set.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* RIGHT — Fixed preview panel */}
      <aside className="hidden xl:flex w-[380px] flex-shrink-0 bg-[#050E1A] overflow-y-auto flex-col border-l border-white/5">
        <div className="p-6 border-b border-white/5 bg-black/20">
          <p className="text-sm font-bold text-white uppercase tracking-widest">Live Preview</p>
          <p className="text-[0.65rem] text-muted mt-1 leading-relaxed">This is how your changes will appear on the site.</p>
        </div>

        <div className="flex-1 p-6 space-y-10 scrollbar-hide">
          {/* Navbar Preview */}
          <div className="space-y-3">
            <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Navigation Mockup</p>
            <div className="bg-[#0C1E35] rounded-t-xl border border-white/5 h-12 px-4 flex items-center justify-between shadow-2xl">
              {effectiveAssets.logoUrl ? (
                <img src={effectiveAssets.logoUrl} className="h-5 object-contain" alt="" />
              ) : (
                <span className="font-display text-xs text-green font-bold tracking-widest uppercase">ASTROWAVE</span>
              )}
              <Menu size={16} className="text-muted" />
            </div>
            <div className="h-0.5 bg-dark-border" />
          </div>

          {/* Hero Preview */}
          <div className="space-y-3">
            <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Hero Display</p>
            <div className="aspect-video relative rounded-md overflow-hidden bg-black border border-white/5 shadow-2xl">
              {effectiveAssets.heroVideoUrl ? (
                <video src={effectiveAssets.heroVideoUrl} className="w-full h-full object-cover opacity-50" muted loop autoPlay />
              ) : effectiveAssets.heroImageUrl ? (
                <img src={effectiveAssets.heroImageUrl} className="w-full h-full object-cover opacity-50" alt="" />
              ) : (
                <div className="w-full h-full bg-[#081525] flex items-center justify-center text-muted/10">
                   <Zap size={48} />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                 <div className="space-y-0.5">
                   <p className="text-[0.5rem] font-bold text-white uppercase tracking-[0.3em]">Experience</p>
                   <h3 className="font-display text-2xl text-white leading-none">THE WAVE.</h3>
                 </div>
                 <p className="text-[0.5rem] text-white/60 max-w-[140px] leading-tight">A movement of culture, music, and unforgettable experiences.</p>
                 <div className="bg-green px-3 py-1.5 rounded-sm text-[0.5rem] font-bold text-white uppercase">Explore Events →</div>
              </div>
            </div>
          </div>

          {/* Events Preview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Event Listing</p>
              <span className="text-[0.5rem] text-green font-bold uppercase">View All</span>
            </div>
            <div className="bg-[#0C1E35] p-3 rounded-lg border border-white/5 flex gap-4 shadow-xl">
               <div className="w-12 h-14 bg-green rounded flex flex-col items-center justify-center text-white shrink-0">
                 <span className="text-lg font-bold leading-none">28</span>
                 <span className="text-[0.5rem] font-bold uppercase">DEC</span>
               </div>
               <div className="space-y-1">
                 <p className="text-[0.5rem] text-muted uppercase font-bold tracking-widest">AstroWave</p>
                 <p className="text-[0.65rem] font-bold text-white uppercase">All-Day Rave</p>
                 <p className="text-[0.5rem] text-muted flex items-center gap-1">📍 Accra, Ghana</p>
               </div>
            </div>
          </div>

          {/* Footer Preview */}
          <div className="space-y-3">
            <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Footer Identity</p>
            <div className="bg-[#030B14] p-6 rounded-lg border border-white/5 space-y-6 shadow-2xl">
               <div className="flex justify-center">
                {effectiveAssets.logoDarkUrl || effectiveAssets.logoUrl ? (
                  <img src={effectiveAssets.logoDarkUrl || effectiveAssets.logoUrl} className="h-6 object-contain" alt="" />
                ) : (
                  <span className="font-display text-xs text-green font-bold tracking-widest uppercase">ASTROWAVE</span>
                )}
               </div>
               <div className="flex justify-between px-2 text-muted">
                 {[Instagram, Facebook, Twitter, Music, Youtube].map((Icon, i) => (
                   <Icon key={i} size={14} className="opacity-40" />
                 ))}
               </div>
               <p className="text-[0.5rem] text-muted text-center opacity-30 uppercase tracking-widest">© 2026 AstroWave. All rights reserved.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
