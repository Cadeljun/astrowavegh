'use client';

import React, { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Terminal, Database, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DevSeedPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState('');

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const seedEvents = async () => {
    setLoading(true);
    addLog('Starting Events seed...');
    try {
      const events = [
        { name: 'Mask Mirage', category: 'Nightlife', date: '2025-05-20T22:00', venue: 'The Labadi Beach', active: true, shortDescription: 'Identity. Music. Mystery.' },
        { name: 'Splash & Seduction', category: 'Parties', date: '2025-08-10T12:00', venue: 'Aqua Safari Resort', active: true, shortDescription: 'The ultimate day-to-night experience.' },
        { name: 'Underground Frequency', category: 'Concerts', date: '2025-12-15T20:00', venue: 'Base Lounge', active: false, shortDescription: 'Raw African energy.' }
      ];
      for (const e of events) {
        await addDoc(collection(db, 'events'), { ...e, createdAt: serverTimestamp() });
        addLog(`✓ Added event: ${e.name}`);
      }
      toast({ title: 'Events Seeded' });
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedTalent = async () => {
    setLoading(true);
    addLog('Starting Talent seed...');
    try {
      const talent = [
        { name: 'DJ Horizon', role: 'DJ', active: true, bio: 'Vibes beyond the horizon.', stageName: 'Horizon' },
        { name: 'Uzy', role: 'Artist', active: true, bio: 'The heartbeat of the wave.', stageName: 'Uzy' }
      ];
      for (const t of talent) {
        await addDoc(collection(db, 'talent'), { ...t, createdAt: serverTimestamp() });
        addLog(`✓ Added talent: ${t.name}`);
      }
      toast({ title: 'Talent Seeded' });
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
      const colls = ['events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads'];
      for (const c of colls) {
        const snap = await getDocs(collection(db, c));
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
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
            <Button variant="secondary" className="justify-start border-white/5 h-14" onClick={seedEvents} disabled={loading}>
               SEED EVENTS (3 DOCS)
            </Button>
            <Button variant="secondary" className="justify-start border-white/5 h-14" onClick={seedTalent} disabled={loading}>
               SEED TALENT (2 DOCS)
            </Button>
            <Button variant="ghost" className="justify-start border border-gold/20 text-gold h-14" onClick={() => { seedEvents(); seedTalent(); }}>
               SEED ALL (SEQUENTIAL)
            </Button>
          </div>

          <div className="pt-8 space-y-4">
             <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.4em]">Danger Zone</h3>
             <Card className="p-8 border-red-500/20 space-y-6" glowColor="muted">
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Clear All Data</p>
                  <p className="text-[10px] text-muted">This will delete all documents in managed collections.</p>
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
