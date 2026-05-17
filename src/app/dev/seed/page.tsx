'use client';

import React, { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Terminal, Database, Loader2, CheckCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Link from 'next/link';

export default function DevSeedPage() {
  const db = useFirestore();
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState('');

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handlePermissionError = (path: string, operation: any, data?: any) => {
    const error = new FirestorePermissionError({
      path,
      operation,
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', error);
  };

  const seedCMS = async () => {
    setLoading(true);
    addLog('Starting CMS seed...');
    try {
      const settingsRef = doc(db, 'cms_settings', 'global');
      await setDoc(settingsRef, {
        siteName: 'AstroWave',
        tagline: 'Vibes Beyond the Horizon.',
        email: 'info@astrowave.live',
        location: 'Accra, Ghana',
        maintenanceMode: false,
        updatedAt: serverTimestamp()
      }).catch(err => {
        handlePermissionError(settingsRef.path, 'write');
        throw err;
      });
      addLog('✓ Seeded Global Settings');

      const heroRef = doc(db, 'cms_content', 'home_hero');
      await setDoc(heroRef, {
        pageSlug: 'home',
        sectionKey: 'hero',
        fields: {
          label: "AFRICA'S CREATIVE POWERHOUSE",
          heading: "ASTROWAVE",
          tagline: "Vibes Beyond the Horizon.",
          cta1: "Explore Events",
          cta2: "Our Story"
        },
        updatedAt: serverTimestamp()
      }).catch(err => {
        handlePermissionError(heroRef.path, 'write');
        throw err;
      });
      addLog('✓ Seeded Home Hero Content');

      toast({ title: 'CMS Defaults Seeded' });
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupAdminRole = async () => {
    if (!user) return;
    setLoading(true);
    addLog(`Configuring admin role for ${user.email}...`);
    try {
      const roleRef = doc(db, 'user_roles', user.uid);
      await setDoc(roleRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Admin User',
        role: 'SUPER_ADMIN',
        active: true,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(err => {
        handlePermissionError(roleRef.path, 'write');
        throw err;
      });
      addLog(`✓ Role SUPER_ADMIN granted to ${user.email}`);
      toast({ title: 'Admin Privileges Granted' });
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedEvents = async () => {
    setLoading(true);
    addLog('Starting Events seed...');
    try {
      const events = [
        { name: 'Mask Mirage', category: 'Nightlife', date: '2025-05-20T22:00', venue: 'The Labadi Beach', active: true, shortDescription: 'Identity. Music. Mystery.' },
        { name: 'Splash & Seduction', category: 'Parties', date: '2025-08-10T12:00', venue: 'Aqua Safari Resort', active: true, shortDescription: 'The ultimate day-to-night experience.' },
        { name: 'Underground Frequency', category: 'Concerts', date: '2025-12-15T20:00', venue: 'Base Lounge', active: false, shortDescription: 'Raw African energy.' }
      ];
      const colRef = collection(db, 'events');
      for (const e of events) {
        await addDoc(colRef, { ...e, createdAt: serverTimestamp() }).catch(err => {
          handlePermissionError(colRef.path, 'create', e);
          throw err;
        });
        addLog(`✓ Added event: ${e.name}`);
      }
      toast({ title: 'Events Seeded' });
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (confirmDelete !== 'DELETE') return;
    setLoading(true);
    addLog('⚠ Wiping database...');
    try {
      const colls = ['events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads', 'cms_content', 'cms_sections', 'cms_seo', 'cms_settings'];
      for (const c of colls) {
        const colRef = collection(db, c);
        const snap = await getDocs(colRef).catch(err => {
          handlePermissionError(colRef.path, 'list');
          throw err;
        });
        for (const d of snap.docs) {
          await deleteDoc(d.ref).catch(err => {
            handlePermissionError(d.ref.path, 'delete');
            throw err;
          });
        }
        addLog(`✓ Cleared collection: ${c}`);
      }
      setConfirmDelete('');
      toast({ title: 'Database Wiped' });
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center 
      justify-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full 
        border-2 border-[#FFD166] 
        border-t-transparent animate-spin" 
      />
    </div>
  )

  if (!isAdmin) return (
    <div className="max-w-md mx-auto 
      mt-16 text-center">
      <div className="bg-[#16161F] 
        border border-[#1E1E2E] 
        rounded-xl p-8">
        <h2 className="font-display 
          text-2xl text-[#FFD166] 
          uppercase mb-3">
          Authentication Required
        </h2>
        <p className="font-mono text-xs 
          text-white/40 mb-6">
          You must be signed in as admin 
          to seed data.
        </p>
        <Link 
          href="/admin/login"
          className="inline-flex items-center 
            gap-2 px-6 py-3 rounded-md
            border border-[#FFD166]
            text-[#FFD166]
            font-mono text-xs uppercase
            tracking-wider
            hover:bg-[#FFD166] 
            hover:text-black
            transition-all"
        >
          Sign In to Admin
        </Link>
      </div>
    </div>
  )

  return (
    <div className="space-y-12 pb-20">
      <div className="p-6 border border-orange-500/20 bg-orange-500/5 rounded-md flex items-start gap-4">
        <AlertTriangle className="text-orange-500 mt-1" size={20} />
        <div className="space-y-1">
          <p className="text-xs font-bold text-white uppercase tracking-widest">Dev Zone Protection</p>
          <p className="text-[10px] text-muted leading-relaxed">Seeding will add dummy data to your active Firestore instance. Ensure you are on the correct project before proceeding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em]">Seeding Tools</h3>
          <div className="grid grid-cols-1 gap-4">
            <Button variant="secondary" className="justify-start border-white/5 h-14" onClick={setupAdminRole} disabled={loading}>
               <UserCheck size={18} className="mr-3 text-cyan" /> SYNC CURRENT USER ROLE
            </Button>
            <Button variant="secondary" className="justify-start border-white/5 h-14" onClick={seedCMS} disabled={loading}>
               SEED CMS DEFAULTS
            </Button>
            <Button variant="secondary" className="justify-start border-white/5 h-14" onClick={seedEvents} disabled={loading}>
               SEED EVENTS (3 DOCS)
            </Button>
            <Button variant="ghost" className="justify-start border border-gold/20 text-gold h-14" onClick={() => { seedCMS(); seedEvents(); }}>
               SEED ALL
            </Button>
          </div>

          <div className="pt-8 space-y-4">
             <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.4em]">Danger Zone</h3>
             <Card className="p-8 border-red-500/20 space-y-6" glowColor="muted">
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Clear All Data</p>
                  <p className="text-[10px] text-muted">This will delete all documents including CMS content.</p>
                </div>
                <input 
                  type="text" 
                  className="admin-input h-12 text-red-500 border-red-500/20 focus:border-red-500" 
                  placeholder="Type DELETE to confirm" 
                  value={confirmDelete}
                  onChange={e => setConfirmDelete(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  className="w-full h-12 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                  onClick={clearAll}
                  disabled={loading || confirmDelete !== 'DELETE'}
                >
                  <Trash2 size={16} className="mr-2" /> WIPE DATABASE
                </Button>
             </Card>
          </div>
        </section>

        <section className="space-y-6 flex flex-col h-full">
          <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em]">Operation Logs</h3>
          <div className="flex-1 min-h-[400px] rounded-md bg-black border border-white/5 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-muted" />
                <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Process Terminal</span>
              </div>
              <button onClick={() => setLogs([])} className="text-[10px] text-muted hover:text-white uppercase font-bold">Clear</button>
            </div>
            <div className="p-6 font-mono text-[11px] text-green-500 space-y-1.5 flex-1 overflow-auto">
              {logs.length === 0 ? '// Waiting for operations...' : logs.map((log, i) => <div key={i}>{log}</div>)}
              {loading && <div className="flex items-center gap-2 animate-pulse"> <Loader2 size={10} className="animate-spin" /> EXECUTING...</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
