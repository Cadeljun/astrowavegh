'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Instagram, Twitter, Music, Youtube, Facebook, Shield, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function CMSSettingsEditor() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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
              <p className="text-[0.65rem] leading-relaxed font-bold uppercase">Caution: Enabling maintenance mode will block all public access to the AstroWave website.</p>
            </div>
          )}
        </Card>
      </div>

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
    </div>
  );
}
