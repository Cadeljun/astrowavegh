'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Save, 
  Shield, 
  Loader2, 
  Menu, 
  Star, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Music,
  MapPin,
  Eye,
  X
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import BrandingRow from '@/components/dev/BrandingRow';
import { cn } from '@/lib/utils';

const ASSET_ROWS = [
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
    specs: 'Recommended: 1920×1080px\nor higher',
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
  const [currentAssets, setCurrentAssets] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'cms_settings', 'global'));
        if (snap.exists()) {
          setCurrentAssets(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStageChange = (field: string, url: string) => {
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
      
      setCurrentAssets(prev => ({ ...prev, ...pending }));
      setPending({});
      toast({ title: "Sync Successful", description: "All brand assets saved to production." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const effectiveAssets = { ...currentAssets, ...pending };
  const pendingCount = Object.keys(pending).length;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-green" size={32} />
      </div>
    );
  }

  const PreviewPanel = () => (
    <div className="flex flex-col h-full bg-[#050E1A]">
      <div className="p-6 border-b border-white/5">
        <p className="text-sm font-bold text-white uppercase tracking-widest">Live Preview</p>
        <p className="text-[0.65rem] text-muted mt-1">This is how your changes will appear on the site.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide">
        {/* Navbar Preview */}
        <div className="space-y-3">
          <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Navigation Mockup</p>
          <div className="bg-[#0C1E35] rounded-t-xl border border-white/5 h-12 px-4 flex items-center justify-between shadow-lg">
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
              <div className="w-full h-full bg-dark-surface" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-2">
               <p className="text-[0.5rem] font-bold text-white uppercase tracking-[0.3em]">EXPERIENCE</p>
               <h3 className="font-display text-xl text-green leading-none">THE WAVE.</h3>
               <p className="text-[0.45rem] text-white/60 max-w-[120px] leading-tight">A movement of culture, music, and unforgettable experiences.</p>
               <div className="bg-green px-3 py-1.5 rounded-sm text-[0.45rem] font-bold text-white uppercase">Explore Events →</div>
            </div>
          </div>
        </div>

        {/* Events Preview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Upcoming Events</p>
            <span className="text-[0.5rem] text-green font-bold uppercase">View All</span>
          </div>
          <div className="bg-dark-card p-3 rounded-lg border border-white/5 flex gap-3 shadow-xl">
             <div className="w-10 h-12 bg-green rounded-sm flex flex-col items-center justify-center text-white shrink-0">
               <span className="text-sm font-bold leading-none">28</span>
               <span className="text-[0.45rem] font-bold uppercase">DEC</span>
             </div>
             <div className="space-y-0.5">
               <p className="text-[0.45rem] text-muted uppercase font-bold tracking-widest">AstroWave</p>
               <p className="text-[0.65rem] font-bold text-white uppercase">All-Day Rave</p>
               <p className="text-[0.45rem] text-muted flex items-center gap-1">📍 Accra, Ghana</p>
             </div>
          </div>
        </div>

        {/* Footer Preview */}
        <div className="space-y-3">
          <p className="text-[0.6rem] font-bold text-muted uppercase tracking-[0.2em]">Footer Identity</p>
          <div className="bg-[#030B14] p-5 rounded-lg border border-white/5 space-y-5 shadow-2xl">
             <div className="flex justify-center">
              {effectiveAssets.logoDarkUrl || effectiveAssets.logoUrl ? (
                <img src={effectiveAssets.logoDarkUrl || effectiveAssets.logoUrl} className="h-6 object-contain" alt="" />
              ) : (
                <span className="font-display text-[10px] text-green tracking-widest uppercase">ASTROWAVE</span>
              )}
             </div>
             <div className="flex justify-between px-2 text-muted">
               {[Instagram, Facebook, Twitter, Music, Youtube].map((Icon, i) => (
                 <Icon key={i} size={14} className="opacity-40" />
               ))}
             </div>
             <p className="text-[0.45rem] text-muted text-center opacity-30 uppercase tracking-widest">© 2026 AstroWave. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-8 lg:-m-12">
      {/* CENTER — Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-10 lg:p-14 border-r border-white/5 bg-[#020B18]">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div className="space-y-2">
              <h1 className="font-display text-4xl text-white uppercase tracking-tight">Media & Branding</h1>
              <p className="text-sm text-muted">Manage logos, hero images, and other media used across the AstroWave platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open('/', '_blank')}
                className="lg:hidden h-10 px-4 flex items-center gap-2 border border-white/10 rounded-sm text-muted hover:text-white transition-all text-xs font-semibold uppercase"
              >
                <ExternalLink size={14} /> View Site
              </button>
              <button 
                onClick={() => setIsPreviewModalOpen(true)}
                className="xl:hidden h-10 px-4 flex items-center gap-2 border border-white/10 rounded-sm text-muted hover:text-white transition-all text-xs font-semibold uppercase"
              >
                <Eye size={14} /> Preview
              </button>
              <Button 
                variant="outline-dark" 
                size="sm" 
                className="hidden lg:flex h-10 px-6 border-white/10"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink size={14} className="mr-2" /> View Site
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
                    {pendingCount > 0 ? `Save ${pendingCount} Changes` : 'Save All Changes'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-0">
            {ASSET_ROWS.map((asset) => (
              <BrandingRow
                key={asset.id}
                {...asset}
                currentUrl={effectiveAssets[asset.field] || ''}
                isPending={pending[asset.field] !== undefined}
                onUpload={(url) => handleStageChange(asset.field, url)}
                onRemove={() => handleStageChange(asset.field, '')}
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
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* RIGHT — Fixed preview panel */}
      <aside className="hidden xl:block w-[340px] flex-shrink-0 border-l border-white/5 bg-[#050E1A]">
        <PreviewPanel />
      </aside>

      {/* Tablet Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white"
              >
                <X size={20} />
              </button>
              <PreviewPanel />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
