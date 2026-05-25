'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImageIcon, 
  Upload, 
  Globe, 
  Video, 
  Zap, 
  Grid, 
  Loader2, 
  Check, 
  Trash2, 
  Link as LinkIcon,
  RefreshCw,
  Layout,
  ExternalLink,
  Info
} from 'lucide-react';
import { useCMSSettings, saveGlobalSettings } from '@/lib/cms/useCMS';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useToast } from '@/hooks/use-toast';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { cn } from '@/lib/utils';

export default function BrandAssetsManager() {
  const { settings, loading: settingsLoading } = useCMSSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [pickerConfig, setPickerOpen] = useState<{ isOpen: boolean; field: string; folders: string[] }>({ 
    isOpen: false, 
    field: '', 
    folders: [] 
  });

  const handleUpdateAsset = async (field: string, url: string) => {
    setSaving(field);
    try {
      await saveGlobalSettings({ [field]: url });
      toast({ 
        title: 'Asset Synchronized', 
        description: `Successfully updated ${field.replace('Url', '')} across all nodes.` 
      });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Sync Failed', 
        description: 'Failed to update system settings.' 
      });
    } finally {
      setSaving(null);
    }
  };

  const openPicker = (field: string, folders: string[]) => {
    setPickerOpen({ isOpen: true, field, folders });
  };

  if (settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-green" size={32} />
        <p className="font-mono text-[0.6rem] text-green uppercase tracking-[0.2em] animate-pulse">Syncing Brand Matrix...</p>
      </div>
    );
  }

  const AssetCard = ({ label, field, value, icon: Icon, folders, type = 'image' }: any) => (
    <Card className="p-8 space-y-6 bg-[#0A1A32]/60 border-white/5" glowColor="muted">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="admin-label m-0 text-white flex items-center gap-2">
            <Icon size={14} className="text-green" /> {label}
          </p>
          <p className="text-[0.6rem] text-muted uppercase font-mono tracking-widest">{field}</p>
        </div>
        {saving === field && <Loader2 size={14} className="animate-spin text-green" />}
      </div>

      <div className="relative aspect-video rounded-sm overflow-hidden bg-black/40 border border-white/5 group shadow-inner">
        {value ? (
          type === 'video' ? (
            <video src={value} className="w-full h-full object-cover" muted loop />
          ) : (
            <img src={value} className="w-full h-full object-contain p-4" alt={label} />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
            <Icon size={24} className="opacity-20" />
            <p className="text-[0.5rem] uppercase font-bold">Unset</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
          <Button 
            size="sm" 
            variant="primary" 
            className="h-9 px-6 text-[0.6rem]" 
            onClick={() => openPicker(field, folders)}
          >
            <Grid size={12} className="mr-2" /> BROWSE LIBRARY
          </Button>
          {value && (
             <a href={value} target="_blank" className="text-[0.55rem] text-white/40 hover:text-white flex items-center gap-1.5 transition-colors">
               ORIGINAL_SRC <ExternalLink size={10} />
             </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
         <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5">
            <LinkIcon size={12} className="text-muted flex-shrink-0" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none text-[0.65rem] text-muted w-full font-mono truncate"
              value={value || ''}
              onChange={(e) => handleUpdateAsset(field, e.target.value)}
              placeholder="Paste direct URL..."
            />
         </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <SectionHeading 
          label="IDENTITY_SYSTEM"
          title="BRAND ASSET MANAGER"
          subtitle="Manage cross-platform visual identity, icons, and social presence assets."
          className="mb-0"
        />
        <div className="flex items-center gap-4 text-[0.65rem] text-green font-mono uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Live Synchronization Enabled
        </div>
      </div>

      {/* Favicon & Global Meta */}
      <div className="space-y-6">
        <SectionLabel>PLATFORM_SHELL</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetCard 
            label="Browser Favicon" 
            field="faviconUrl" 
            value={settings.faviconUrl} 
            icon={Globe} 
            folders={['astrowave/brand/icons']} 
          />
          <AssetCard 
            label="Default OG Image" 
            field="ogImageUrl" 
            value={settings.ogImageUrl} 
            icon={ImageIcon} 
            folders={['astrowave/brand/backgrounds']} 
          />
          <Card className="p-8 bg-green/5 border border-green/20 flex flex-col justify-center gap-4" glowColor="green">
             <div className="flex items-center gap-3 text-green">
                <Info size={24} />
                <p className="text-[0.7rem] font-bold uppercase tracking-widest leading-tight">Implementation Note</p>
             </div>
             <p className="text-[0.65rem] text-white/60 leading-relaxed font-mono">
               Favicon and OG changes take effect immediately on next-page load. For PWA icons, please ensure you also update the manifest.json mappings in the codebase if dimensions change.
             </p>
          </Card>
        </div>
      </div>

      {/* Logo Variants */}
      <div className="space-y-6">
        <SectionLabel>LOGO_VARIANTS</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetCard 
            label="Main Logo (Light)" 
            field="logoUrl" 
            value={settings.logoUrl} 
            icon={Layout} 
            folders={['astrowave/brand/logos']} 
          />
          <AssetCard 
            label="Secondary Logo (Dark)" 
            field="logoDarkUrl" 
            value={settings.logoDarkUrl} 
            icon={Layout} 
            folders={['astrowave/brand/logos']} 
          />
          <AssetCard 
            label="Icon Only Mark" 
            field="logoIconUrl" 
            value={settings.logoIconUrl} 
            icon={Zap} 
            folders={['astrowave/brand/logos']} 
          />
        </div>
      </div>

      {/* Hero Content */}
      <div className="space-y-6">
        <SectionLabel>HOMEPAGE_HERO_MEDIA</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetCard 
            label="Hero Video (MP4)" 
            field="heroVideoUrl" 
            value={settings.heroVideoUrl} 
            icon={Video} 
            folders={['astrowave/videos/hero']} 
            type="video"
          />
          <AssetCard 
            label="Hero Video Poster" 
            field="heroPosterUrl" 
            value={settings.heroPosterUrl} 
            icon={ImageIcon} 
            folders={['astrowave/brand/backgrounds']} 
          />
          <AssetCard 
            label="Hero Fallback Image" 
            field="heroImageUrl" 
            value={settings.heroImageUrl} 
            icon={ImageIcon} 
            folders={['astrowave/brand/backgrounds']} 
          />
        </div>
      </div>

      <MediaPickerModal 
        isOpen={pickerConfig.isOpen} 
        onClose={() => setPickerOpen({ ...pickerConfig, isOpen: false })} 
        onSelect={(url) => handleUpdateAsset(pickerConfig.field, url)}
        folders={pickerConfig.folders}
      />
    </div>
  );
}
