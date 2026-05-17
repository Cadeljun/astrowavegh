'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Instagram, Twitter, Music, Youtube, Shield, AlertTriangle, Image as ImageIcon, Video, Grid } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function CMSSettingsEditor() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pickerConfig, setPickerOpen] = useState<{ isOpen: boolean; field: string; folders: string[] }>({ isOpen: false, field: '', folders: [] });

  useEffect(() => {
    if (!db) return;
    return onSnapshot(doc(db, 'cms_settings', 'global'), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
  }, []);

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms_settings', 'global'), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: 'Settings Updated' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error' });
    } finally {
      setSaving(false);
    }
  };

  const openPicker = (field: string, folders: string[]) => {
    setPickerOpen({ isOpen: true, field, folders });
  };

  if (!settings) return <div className="p-20 text-center"><Loader2 className="animate-spin text-gold mx-auto" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identity */}
        <Card className="p-8 space-y-6" glowColor="muted">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-gold" size={18} />
            <p className="admin-label m-0 text-white">Brand Identity</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="admin-label">Site Name</label>
              <input type="text" className="admin-input" value={settings.siteName || ''} onChange={e => setSettings({...settings, siteName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="admin-label">Tagline</label>
              <input type="text" className="admin-input" value={settings.tagline || ''} onChange={e => setSettings({...settings, tagline: e.target.value})} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="admin-label flex items-center gap-2"><ImageIcon size={12} /> Logo URL</label>
                <button type="button" onClick={() => openPicker('logoUrl', ['astrowave/brand/logos'])} className="text-[0.6rem] text-gold hover:underline">PICK FROM LIBRARY</button>
              </div>
              <input type="url" className="admin-input" value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} />
              {settings.logoUrl && <div className="mt-2 p-2 bg-black/40 rounded-sm border border-white/5 flex justify-center"><img src={settings.logoUrl} className="h-8 object-contain" alt="" /></div>}
            </div>
          </div>
        </Card>

        {/* Maintenance */}
        <Card className={cn("p-8 space-y-6", settings.maintenanceMode ? "border-red-500/50 bg-red-500/5" : "")} glowColor="muted">
          <div className="flex items-center gap-3 mb-2">
            <Shield className={settings.maintenanceMode ? "text-red-500" : "text-green-500"} size={18} />
            <p className="admin-label m-0 text-white">System Status</p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-sm bg-white/5 border border-white/5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white uppercase">Maintenance Mode</p>
              <p className="text-[0.6rem] text-muted">{settings.maintenanceMode ? 'Public site is hidden.' : 'Public site is live.'}</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={val => setSettings({...settings, maintenanceMode: val})} />
          </div>
          {settings.maintenanceMode && (
            <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500">
              <AlertTriangle size={16} className="shrink-0" />
              <p className="text-[0.65rem] leading-relaxed font-bold uppercase">Public access is currently blocked.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Hero Media */}
      <Card className="p-8 space-y-8" glowColor="muted">
        <div className="flex items-center gap-3 mb-2">
          <Video className="text-cyan" size={18} />
          <p className="admin-label m-0 text-white">Homepage Hero Media</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="admin-label flex items-center gap-2"><Video size={12} /> Video URL (MP4)</label>
                  <button type="button" onClick={() => openPicker('heroVideoUrl', ['astrowave/videos/hero'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
                </div>
                <input type="url" className="admin-input" value={settings.heroVideoUrl || ''} onChange={e => setSettings({...settings, heroVideoUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="admin-label flex items-center gap-2"><ImageIcon size={12} /> Video Poster URL</label>
                  <button type="button" onClick={() => openPicker('heroPosterUrl', ['astrowave/brand/backgrounds'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
                </div>
                <input type="url" className="admin-input" value={settings.heroPosterUrl || ''} onChange={e => setSettings({...settings, heroPosterUrl: e.target.value})} />
              </div>
           </div>
           <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="admin-label flex items-center gap-2"><ImageIcon size={12} /> Fallback Image URL</label>
                  <button type="button" onClick={() => openPicker('heroImageUrl', ['astrowave/brand/backgrounds'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
                </div>
                <input type="url" className="admin-input" value={settings.heroImageUrl || ''} onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} />
              </div>
              <div className="p-4 bg-black/40 rounded border border-white/5 text-[0.65rem] text-muted italic">
                The video URL will take priority. If no video is present, the fallback image will be shown. The poster image appears while the video is loading.
              </div>
           </div>
        </div>
      </Card>

      {/* Default System Media */}
      <Card className="p-8 space-y-8" glowColor="muted">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="text-gold" size={18} />
          <p className="admin-label m-0 text-white">Default System Media (Placeholders)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="admin-label">Default Event Poster</label>
              <button type="button" onClick={() => openPicker('defaultEventPoster', ['astrowave/events/general'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
            </div>
            <input type="url" className="admin-input" value={settings.defaultEventPoster || ''} onChange={e => setSettings({...settings, defaultEventPoster: e.target.value})} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="admin-label">Default Talent Photo</label>
              <button type="button" onClick={() => openPicker('defaultTalentPhoto', ['astrowave/talent/artist'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
            </div>
            <input type="url" className="admin-input" value={settings.defaultTalentPhoto || ''} onChange={e => setSettings({...settings, defaultTalentPhoto: e.target.value})} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="admin-label">Default Gallery Photo</label>
              <button type="button" onClick={() => openPicker('defaultGalleryPhoto', ['astrowave/gallery/past-events'])} className="text-[0.6rem] text-gold hover:underline">BROWSE</button>
            </div>
            <input type="url" className="admin-input" value={settings.defaultGalleryPhoto || ''} onChange={e => setSettings({...settings, defaultGalleryPhoto: e.target.value})} />
          </div>
        </div>
      </Card>

      {/* Socials */}
      <Card className="p-8 space-y-8" glowColor="muted">
        <div className="flex items-center gap-3 mb-2">
          <Instagram className="text-purple" size={18} />
          <p className="admin-label m-0 text-white">Social Connect</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="admin-label flex items-center gap-2"><Instagram size={12} /> Instagram</label>
            <input type="url" className="admin-input" value={settings.instagram || ''} onChange={e => setSettings({...settings, instagram: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="admin-label flex items-center gap-2"><Twitter size={12} /> Twitter / X</label>
            <input type="url" className="admin-input" value={settings.twitter || ''} onChange={e => setSettings({...settings, twitter: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="admin-label flex items-center gap-2"><Music size={12} /> TikTok</label>
            <input type="url" className="admin-input" value={settings.tiktok || ''} onChange={e => setSettings({...settings, tiktok: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="admin-label flex items-center gap-2"><Youtube size={12} /> YouTube</label>
            <input type="url" className="admin-input" value={settings.youtube || ''} onChange={e => setSettings({...settings, youtube: e.target.value})} />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-16 text-lg">
        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
        SAVE GLOBAL SETTINGS
      </Button>

      <MediaPickerModal 
        isOpen={pickerConfig.isOpen} 
        onClose={() => setPickerOpen({...pickerConfig, isOpen: false})} 
        onSelect={url => setSettings({...settings, [pickerConfig.field]: url})}
        folders={pickerConfig.folders}
      />
    </div>
  );
}
