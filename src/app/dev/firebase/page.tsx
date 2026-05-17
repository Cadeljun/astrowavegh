'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { 
  collection, 
  getDocs, 
  getCountFromServer, 
  addDoc, 
  serverTimestamp,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Database, 
  Terminal as TerminalIcon, 
  Search, 
  PlusCircle, 
  Hash, 
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLLECTIONS = [
  'events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads', 'cms_content', 'cms_settings'
];

export default function DevFirebasePage() {
  const { toast } = useToast();
  
  const [selectedCol, setSelectedCol] = useState(COLLECTIONS[0]);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    refreshCounts();
  }, []);

  const refreshCounts = async () => {
    const newCounts: Record<string, number> = {};
    for (const col of COLLECTIONS) {
      try {
        const snap = await getCountFromServer(collection(db, col));
        newCounts[col] = snap.data().count;
      } catch (e) {
        newCounts[col] = -1;
      }
    }
    setCounts(newCounts);
  };

  const fetchRecent = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const q = query(collection(db, selectedCol), limit(20));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutput({ 
        collection: selectedCol, 
        count: data.length,
        documents: data 
      });
      toast({ title: 'Data Retrieved' });
    } catch (e: any) {
      setOutput({ error: e.message });
      toast({ variant: 'destructive', title: 'Fetch Failed' });
    } finally {
      setLoading(false);
    }
  };

  const addTestDoc = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, selectedCol), {
        __is_dev_test: true,
        source: 'Dev Firebase Explorer',
        timestamp: serverTimestamp(),
        payload: {
          note: `Auto-generated test entry for ${selectedCol}`,
          random_id: Math.random().toString(36).substring(7)
        }
      });
      toast({ title: 'Document Added', description: `ID: ${docRef.id}` });
      fetchRecent();
      refreshCounts();
    } catch (e: any) {
      setOutput({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <SectionHeading 
        title="FIREBASE EXPLORER" 
        subtitle="Direct production database interaction and inspection."
        label="CORE INFRASTRUCTURE"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Collection List */}
        <Card className="lg:col-span-1 p-6 space-y-4" glowColor="muted">
          <p className="admin-label text-[0.6rem]">COLLECTIONS</p>
          <div className="space-y-1">
            {COLLECTIONS.map(col => (
              <button
                key={col}
                onClick={() => setSelectedCol(col)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md font-mono text-[0.7rem] uppercase transition-all",
                  selectedCol === col 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                {col}
                <span className="text-[0.6rem] opacity-40">{counts[col] ?? '...'}</span>
              </button>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-4 text-[0.6rem] border border-white/5" 
            onClick={refreshCounts}
          >
            <RefreshCw size={10} className="mr-2" /> REFRESH COUNTS
          </Button>
        </Card>

        {/* Console / Explorer */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-[#0A0A0F]" glowColor="muted">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 flex items-center gap-4 bg-black/40 border border-white/5 px-4 h-12 rounded-sm w-full">
                <Hash size={14} className="text-cyan-500" />
                <span className="font-mono text-xs text-white uppercase tracking-widest">{selectedCol}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" className="flex-1 sm:flex-none h-12 border-white/5" onClick={fetchRecent} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} className="mr-2" />} QUERY
                </Button>
                <Button variant="ghost" className="flex-1 sm:flex-none h-12 border border-white/5 text-gold" onClick={addTestDoc} disabled={loading}>
                  <PlusCircle size={16} className="mr-2" /> INJECT TEST
                </Button>
              </div>
            </div>
          </Card>

          <div className="relative rounded-md overflow-hidden bg-black border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <TerminalIcon size={14} className="text-cyan-500" />
                <span className="text-[0.65rem] text-white font-mono font-bold uppercase tracking-[0.2em]">Live Output Stream</span>
              </div>
              <div className="flex gap-4">
                {output && <span className="text-[0.6rem] text-muted uppercase font-bold">{output.documents?.length || 0} Records</span>}
                <button onClick={() => setOutput(null)} className="text-[0.6rem] text-muted hover:text-white uppercase font-bold">Clear</button>
              </div>
            </div>
            
            <pre className="p-8 text-[0.7rem] text-cyan-400/90 font-mono overflow-auto max-h-[600px] scrollbar-hide leading-relaxed">
              {loading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  <span>INITIALIZING READ FROM FIREBASE...</span>
                </div>
              ) : output ? (
                JSON.stringify(output, (key, value) => 
                  value && typeof value === 'object' && 'seconds' in value ? new Date(value.seconds * 1000).toISOString() : value
                , 2)
              ) : (
                <div className="text-muted/20 italic">
                  // Console ready. Select a collection and click QUERY to inspect data.
                  // All timestamps are automatically converted to ISO strings for readability.
                </div>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
