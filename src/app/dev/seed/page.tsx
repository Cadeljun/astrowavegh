'use client';

import React, { useState } from 'react';
import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  getDocs, 
  doc, 
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AlertTriangle, Terminal, Database, Loader2, CheckCircle, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { CMS_PAGES } from '@/lib/cms/definitions';

export default function DevSeedPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState('');

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

  const handlePermissionError = (path: string, operation: any) => {
    const error = new FirestorePermissionError({ path, operation } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', error);
  };

  const seedCMS = async () => {
    setLoading(true);
    addLog('🚀 INITIATING CMS SEED...');
    try {
      const batch = writeBatch(db);
      
      // Seed Global Settings
      const settingsRef = doc(db, 'cms_settings', 'global');
      batch.set(settingsRef, {
        siteName: 'AstroWave',
        tagline: 'Vibes Beyond the Horizon.',
        email: 'info@astrowave.live',
        location: 'Accra, Ghana',
        maintenanceMode: false,
        instagram: 'https://instagram.com/astrowavegh',
        twitter: 'https://twitter.com/astrowavegh',
        logoUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779033029/nrvw7mwpedxhujuflqvp.jpg',
        heroVideoUrl: '',
        heroPosterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200',
        heroImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200',
        defaultEventPoster: 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800',
        defaultTalentPhoto: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400',
        defaultGalleryPhoto: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
        updatedAt: serverTimestamp()
      });
      addLog('✓ Queued Global Settings');

      // Seed all defined pages and sections from definitions
      CMS_PAGES.forEach(page => {
        page.sections.forEach(section => {
          const docId = `${page.slug}_${section.key}`;
          const ref = doc(db, 'cms_content', docId);
          const fields: Record<string, string> = {};
          section.fields.forEach(f => { fields[f.key] = f.placeholder || ''; });
          
          batch.set(ref, {
            pageSlug: page.slug,
            sectionKey: section.key,
            label: section.label,
            fields: fields,
            updatedAt: serverTimestamp()
          });
        });
        addLog(`✓ Queued all sections for page: ${page.label}`);
      });

      await batch.commit();
      addLog('✨ CMS SEED COMPLETE');
      toast({ title: 'CMS Defaults Seeded' });
    } catch (e: any) {
      addLog(`❌ ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedEcosystem = async () => {
    setLoading(true);
    addLog('🚀 INITIATING ECOSYSTEM SEED...');
    try {
      // Seed Talent
      const talent = [
        { name: 'Calvin Mensah', stageName: 'Uzy', role: 'Artist', bio: 'Founder and lead creative of AstroWave.', active: true, instagram: 'https://instagram.com/uzy' },
        { name: 'Elias Koranteng', stageName: 'DJ Horizon', role: 'DJ', bio: 'Master of Amapiano and Afrobeats.', active: true, instagram: 'https://instagram.com/djhorizon' }
      ];
      for (const t of talent) {
        await addDoc(collection(db, 'talent'), { ...t, createdAt: serverTimestamp() });
        addLog(`✓ Added talent: ${t.stageName}`);
      }

      // Seed Events
      const events = [
        { name: 'Mask Mirage', category: 'Nightlife', date: '2025-05-20T22:00', venue: 'The Labadi Beach', active: true, description: 'Identity. Music. Mystery.' },
        { name: 'Splash & Seduction', category: 'Parties', date: '2025-08-10T12:00', venue: 'Aqua Safari', active: true, description: 'The ultimate day party.' }
      ];
      for (const e of events) {
        await addDoc(collection(db, 'events'), { ...e, createdAt: serverTimestamp() });
        addLog(`✓ Added event: ${e.name}`);
      }

      addLog('✨ ECOSYSTEM SEED COMPLETE');
      toast({ title: 'Ecosystem Data Seeded' });
    } catch (e: any) {
      addLog(`❌ ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (confirmDelete !== 'DELETE') return;
    setLoading(true);
    addLog('⚠️ WIPING DATABASE...');
    try {
      const collections = ['events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads', 'cms_content', 'cms_sections', 'cms_seo', 'cms_settings'];
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
        subtitle="Manage the initial state of your production environment."
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
                <h3 className="font-display text-2xl text-white uppercase leading-none">Bootstrap Ecosystem</h3>
                <p className="text-[0.65rem] text-muted font-mono mt-1 uppercase tracking-widest">Rapid Prototyping Tool</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="secondary" 
                className="h-16 justify-start px-6 border-white/5 group" 
                onClick={seedCMS} 
                disabled={loading}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="flex items-center gap-2 group-hover:text-gold transition-colors">
                    <Zap size={14} /> SEED CMS CONTENT
                  </span>
                  <span className="text-[0.6rem] text-muted normal-case font-normal">Defaults for all site pages</span>
                </div>
              </Button>

              <Button 
                variant="secondary" 
                className="h-16 justify-start px-6 border-white/5 group" 
                onClick={seedEcosystem} 
                disabled={loading}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="flex items-center gap-2 group-hover:text-purple transition-colors">
                    <Zap size={14} /> SEED ECOSYSTEM
                  </span>
                  <span className="text-[0.6rem] text-muted normal-case font-normal">Dummy Events, Talent & Media</span>
                </div>
              </Button>
            </div>

            <div className="mt-8 p-4 rounded-sm bg-blue-500/5 border border-blue-500/10 flex gap-4 text-blue-400">
               <RefreshCw size={18} className="shrink-0 mt-0.5" />
               <p className="text-[0.7rem] leading-relaxed">
                 Seeding operations are additive. They will create new documents every time they are run. 
                 Use the <strong>Wipe Database</strong> tool if you want a clean start.
               </p>
            </div>
          </Card>

          <Card className="p-8 border-t-2 border-red-500/40" glowColor="muted">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-sm bg-red-500/10 text-red-500 border border-red-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white uppercase leading-none">Danger Zone</h3>
                <p className="text-[0.65rem] text-red-400/60 font-mono mt-1 uppercase tracking-widest italic">Destructive Operations</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[0.7rem] text-muted">To wipe all project data, type <span className="text-red-400 font-bold font-mono">DELETE</span> below and click the button.</p>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="admin-input h-14 flex-1 font-mono text-red-500 uppercase tracking-widest text-center" 
                  placeholder="CONFIRMATION..." 
                  value={confirmDelete}
                  onChange={e => setConfirmDelete(e.target.value.toUpperCase())}
                />
                <Button 
                  disabled={loading || confirmDelete !== 'DELETE'}
                  onClick={clearAll}
                  className="h-14 px-8 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} className="mr-2" /> WIPE ALL
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <div className="flex flex-col h-[600px] rounded-md bg-black border border-white/5 overflow-hidden">
            <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-cyan-500" />
                <span className="text-[0.6rem] text-white font-mono uppercase font-bold tracking-widest">Process Log</span>
              </div>
              <button 
                onClick={() => setLogs([])} 
                className="text-[0.6rem] text-muted hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            </div>
            <div className="p-6 font-mono text-[10px] text-cyan-500/80 space-y-2 flex-1 overflow-auto scrollbar-hide">
              {logs.length === 0 ? (
                <div className="text-muted/40 italic">// Awaiting developer commands...</div>
              ) : (
                logs.map((log, i) => <div key={i} className="leading-relaxed animate-in fade-in slide-in-from-left-2">{log}</div>)
              )}
              {loading && (
                <div className="flex items-center gap-2 animate-pulse text-cyan-400">
                  <Loader2 size={10} className="animate-spin" /> EXECUTING BATCH...
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
