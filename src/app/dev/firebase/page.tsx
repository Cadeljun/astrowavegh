'use client';

import React, { useState } from 'react';
import app, { db } from '@/firebase';
import { collection, getDocs, getCountFromServer, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Database, Terminal as TerminalIcon, Search, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const COLLECTIONS = [
  'events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads'
];

export default function DevFirebasePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [selectedCol, setSelectedCol] = useState(COLLECTIONS[0]);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, selectedCol));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutput(data);
    } catch (e: any) {
      setOutput({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const countDocs = async () => {
    setLoading(true);
    try {
      const snap = await getCountFromServer(collection(db, selectedCol));
      setOutput({ collection: selectedCol, count: snap.data().count });
    } catch (e: any) {
      setOutput({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const addTestDoc = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, selectedCol), {
        test: true,
        source: 'Dev Panel',
        timestamp: serverTimestamp(),
        note: `Sample entry for ${selectedCol}`
      });
      setOutput({ status: 'success', id: docRef.id, collection: selectedCol });
      toast({ title: 'Document Added', description: `ID: ${docRef.id}` });
    } catch (e: any) {
      setOutput({ error: e.message });
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
          to perform Firestore operations.
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
    <div className="space-y-12">
      {/* CONNECTION STATUS */}
      <Card className="p-8 bg-[#0A0A0F] border-white/5" glowColor="muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-bold text-white">CONNECTED</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="space-y-1">
              <p className="text-[10px] text-muted uppercase">Project ID</p>
              <p className="text-xs text-gold font-mono">{app.options.projectId}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="space-y-1">
              <p className="text-[10px] text-muted uppercase">Auth State</p>
              <p className="text-xs text-white font-mono">{user ? `Signed in as ${user.email}` : 'Signed out'}</p>
            </div>
          </div>
          <Database size={32} className="text-white/10" />
        </div>
      </Card>

      {/* COLLECTION TESTER */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <select 
            className="admin-input flex-1 h-12"
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
          >
            {COLLECTIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <Button variant="secondary" className="h-12 border-white/5" onClick={fetchAll} disabled={loading}>
            <Search size={16} className="mr-2" /> FETCH ALL
          </Button>
          <Button variant="secondary" className="h-12 border-white/5" onClick={countDocs} disabled={loading}>
             COUNT
          </Button>
          <Button variant="ghost" className="h-12 border border-white/5 text-gold" onClick={addTestDoc} disabled={loading}>
            <PlusCircle size={16} className="mr-2" /> ADD TEST
          </Button>
        </div>

        <div className="relative rounded-md overflow-hidden bg-black border border-white/5">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
            <TerminalIcon size={12} className="text-muted" />
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Output Log</span>
          </div>
          <pre className="p-6 text-xs text-green-500 font-mono overflow-auto max-h-[500px] scrollbar-hide leading-relaxed">
            {loading ? '// Initializing Firebase operation...' : output ? JSON.stringify(output, null, 2) : '// Select a collection and action to begin.'}
          </pre>
        </div>
      </section>
    </div>
  );
}
