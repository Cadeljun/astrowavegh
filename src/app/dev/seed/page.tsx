'use client';

import React, { useState } from 'react';
import { db } from '@/firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AlertTriangle, Database, Loader2, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CMS_PAGES, DEFAULT_SETTINGS } from '@/lib/cms/definitions';
import { getPlaceholderById } from '@/app/lib/placeholder-images';

export default function DevSeedPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState('');

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

  const seedCMS = async () => {
    setLoading(true);
    addLog('🚀 INITIATING CMS HARD RESET...');
    try {
      const batch = writeBatch(db);
      
      // 1. Seed Global Settings (Logo, Favicon, etc.)
      const settingsRef = doc(db, 'cms_settings', 'global');
      batch.set(settingsRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: serverTimestamp()
      });
      addLog('✓ Brand identity reset to authoritative defaults');

      // 2. Seed Page Content
      CMS_PAGES.forEach(page => {
        page.sections.forEach(section => {
          const docId = `${page.slug}_${section.key}`;
          const ref = doc(db, 'cms_content', docId);
          const fields: Record<string, string> = {};
          section.fields.forEach(f => { 
            fields[f.key] = f.placeholder || ''; 
          });
          
          batch.set(ref, {
            pageSlug: page.slug,
            sectionKey: section.key,
            label: section.label,
            fields: fields,
            updatedAt: serverTimestamp()
          });
        });
      });

      await batch.commit();
      addLog('✨ CMS RESET COMPLETE');
      toast({ title: 'CMS Hard Reset Success' });
    } catch (e: any) {
      addLog(`❌ ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedPlatform = async () => {
    setLoading(true);
    addLog('🚀 INITIATING PLATFORM SEED...');
    try {
      const dj1 = getPlaceholderById('dj-1');
      const art1 = getPlaceholderById('artist-1');
      
      const talents = [
        {
          uid: 'test-talent-1',
          displayName: 'Elias Koranteng',
          stageName: 'DJ Horizon',
          email: 'horizon@astrowave.dev',
          category: 'DJ',
          city: 'Accra',
          waveScore: 4.8,
          averageRating: 4.9,
          ratingCount: 15,
          eventCount: 42,
          active: true,
          available: true,
          photoURL: dj1?.imageUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'test-talent-2',
          displayName: 'Uzy',
          stageName: 'Uzy',
          email: 'uzy@astrowave.dev',
          category: 'Artist',
          city: 'Accra',
          waveScore: 4.5,
          averageRating: 4.7,
          ratingCount: 8,
          eventCount: 12,
          active: true,
          available: true,
          photoURL: art1?.imageUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const t of talents) {
        await setDoc(doc(db, 'talent_profiles', t.uid), t);
        addLog(`✓ Seeded Talent: ${t.stageName}`);
      }

      const testEvent = {
        organizerId: 'test-org-1',
        title: 'Midnight Mirage 2025',
        category: 'Nightlife',
        venue: 'The Labadi Beach',
        status: 'open',
        talentCategory: 'DJ',
        city: 'Accra',
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(collection(db, 'platform_events')), testEvent);
      addLog(`✓ Seeded Platform Event: ${testEvent.title}`);

      addLog('✨ PLATFORM SEED COMPLETE');
      toast({ title: 'Platform Data Seeded' });
    } catch (e: any) {
      addLog(`❌ ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (confirmDelete !== 'DELETE') return;
    setLoading(true);
    addLog('⚠️ WIPING ALL COLLECTIONS...');
    try {
      const collections = [
        'users', 'organizer_profiles', 'talent_profiles', 
        'platform_events', 'bookings', 'ratings', 
        'matches', 'notifications', 'cms_content', 'cms_settings'
      ];
      for (const c of collections) {
        const snap = await getDocs(collection(db, c));
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
        addLog(`✓ Wiped collection: ${c}`);
      }
      setConfirmDelete('');
      addLog('🧹 DATABASE IS CLEAN');
      toast({ title: 'Database Wiped' });
    } catch (e: any) {
      addLog(`❌ ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <SectionHeading 
        title="SYSTEM SEEDER" 
        subtitle="Manage the professional platform environment."
        label="DATABASE UTILITY"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-t-2 border-gold" glowColor="gold">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-sm bg-gold/10 text-gold border border-gold/20">
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white uppercase leading-none">Bootstrap Platform</h3>
                <p className="text-[0.65rem] text-muted font-mono mt-1 uppercase tracking-widest">Rapid Prototyping Tool</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="secondary" className="h-16 justify-start px-6 group" onClick={seedCMS} disabled={loading}>
                <Zap size={14} className="mr-2 group-hover:text-gold" /> HARD RESET CMS
              </Button>
              <Button variant="secondary" className="h-16 justify-start px-6 group" onClick={seedPlatform} disabled={loading}>
                <Zap size={14} className="mr-2 group-hover:text-purple" /> SEED DEMO DATA
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-t-2 border-red-500/40" glowColor="muted">
            <div className="flex items-center gap-4 mb-6 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="font-display text-2xl uppercase">Danger Zone</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[0.7rem] text-muted uppercase">Type <span className="text-red-400 font-bold">DELETE</span> to wipe all data.</p>
              <div className="flex gap-4">
                <input className="admin-input h-12 flex-1 text-center font-mono" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} />
                <Button disabled={loading || confirmDelete !== 'DELETE'} onClick={clearAll} className="h-12 px-8 bg-red-500/10 border-red-500/20 text-red-500">WIPE ALL</Button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col h-[600px] rounded-md bg-black border border-white/5 overflow-hidden">
          <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <span className="text-[0.6rem] text-white font-mono uppercase font-bold">Process Log</span>
            <button onClick={() => setLogs([])} className="text-[0.6rem] text-muted hover:text-white">Clear</button>
          </div>
          <div className="p-6 font-mono text-[10px] text-cyan-500/80 space-y-2 flex-1 overflow-auto">
            {logs.map((log, i) => <div key={i} className="animate-in fade-in slide-in-from-left-2">{log}</div>)}
            {loading && <div className="flex items-center gap-2 animate-pulse text-cyan-400"><Loader2 size={10} className="animate-spin" /> PROCESSING...</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}