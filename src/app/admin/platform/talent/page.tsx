'use client';

import React, { useState, useMemo } from 'react';
import { 
  Mic, 
  Search, 
  Award, 
  Zap, 
  Star, 
  CheckCircle, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  Loader2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { updateTalentWaveScore } from '@/lib/algorithms/updateWaveScore';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function PlatformTalentPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [recalculating, setRecalculating] = useState<string | null>(null);
  const [bulkRecalculating, setBulkRecalculating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const talentQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent_profiles'), orderBy('waveScore', 'desc'));
  }, []);

  const { data: roster, loading } = useCollection(talentQuery);

  const stats = useMemo(() => {
    if (!roster) return { total: 0, available: 0, avgScore: 0, featured: 0 };
    return {
      total: roster.length,
      available: roster.filter((t: any) => t.available).length,
      avgScore: roster.length > 0 ? roster.reduce((acc, t) => acc + (t.waveScore || 0), 0) / roster.length : 0,
      featured: roster.filter((t: any) => t.featured).length
    };
  }, [roster]);

  const filteredRoster = useMemo(() => {
    if (!roster) return [];
    return roster.filter((t: any) => {
      const matchesSearch = 
        t.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || t.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [roster, searchTerm, activeTab]);

  const handleRecalculate = async (talentId: string) => {
    setRecalculating(talentId);
    try {
      await updateTalentWaveScore(talentId);
      toast({ title: "Wave Score Recalculated" });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Recalculation failed' });
    } finally {
      setRecalculating(null);
    }
  };

  const handleBulkRecalculate = async () => {
    if (!roster) return;
    setBulkRecalculating(true);
    let successCount = 0;
    try {
      for (const t of roster) {
        await updateTalentWaveScore(t.id);
        successCount++;
      }
      toast({ title: "Bulk Recalculation Complete", description: `Updated ${successCount} profile scores.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Bulk process interrupted' });
    } finally {
      setBulkRecalculating(false);
    }
  };

  const handleToggleFlag = async (id: string, field: string, currentVal: boolean) => {
    try {
      await updateDoc(doc(db, 'talent_profiles', id), { [field]: !currentVal });
      toast({ title: "Profile Flag Updated" });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="admin-page-title">Talent Roster</h1>
          <p className="admin-page-subtitle">Manage artist profiles, verification badges, and scoring metrics.</p>
        </div>
        <Button 
          disabled={bulkRecalculating || loading} 
          onClick={handleBulkRecalculate}
          variant="secondary"
          className="h-12 border-gold text-gold"
        >
          {bulkRecalculating ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
          RECALCULATE ALL SCORES
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Roster', value: stats.total, color: 'purple', icon: Mic },
          { label: 'Available Now', value: stats.available, color: 'cyan', icon: Zap },
          { label: 'Avg Wave Score', value: stats.avgScore.toFixed(2), color: 'gold', icon: Award },
          { label: 'Featured Artists', value: stats.featured, color: 'purple', icon: Star },
        ].map((s) => (
          <Card key={s.label} className="p-6" glowColor={s.color as any}>
            <div className="flex justify-between items-start mb-2">
               <p className="text-[0.6rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
               <s.icon size={14} className="text-muted opacity-20" />
            </div>
            <p className="font-display text-3xl text-white leading-none">{loading ? '...' : s.value}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
               type="text" 
               placeholder="Search stage name, category..." 
               className="admin-input pl-11 h-12"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Talent Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
         <div className="overflow-x-auto">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>Talent</th>
                     <th>Category</th>
                     <th>City</th>
                     <th>Wave Score</th>
                     <th>Events</th>
                     <th>Rating</th>
                     <th>Status</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={8} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
                  ) : filteredRoster.length > 0 ? (
                    filteredRoster.map((t: any) => (
                      <tr key={t.id} className="group">
                         <td>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-surface relative">
                                  <img src={t.photoURL || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                                  {t.verified && (
                                     <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-0.5 border border-black">
                                        <ShieldCheck size={8} className="text-white" />
                                     </div>
                                  )}
                               </div>
                               <div>
                                  <p className="font-bold text-white uppercase text-xs">{t.stageName}</p>
                                  <p className="text-[0.6rem] text-muted truncate max-w-[120px]">{t.email}</p>
                               </div>
                            </div>
                         </td>
                         <td><Badge variant="active" className="text-[0.55rem] bg-purple-dim text-purple border-purple">{t.category}</Badge></td>
                         <td className="text-muted text-[0.65rem] uppercase font-bold">{t.city}</td>
                         <td>
                            <div className="flex flex-col gap-1">
                               <span className="font-display text-lg text-gold leading-none">{t.waveScore?.toFixed(2)}</span>
                               {t.recencyFactor && <p className="text-[0.5rem] text-muted">RF: {t.recencyFactor.toFixed(1)}</p>}
                            </div>
                         </td>
                         <td className="text-white font-bold">{t.eventCount || 0}</td>
                         <td className="text-muted text-xs">{(t.averageRating || 0).toFixed(1)} ★</td>
                         <td>
                            <div className="flex flex-wrap gap-1">
                               {t.available && <div className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[0.5rem] font-bold">READY</div>}
                               {t.featured && <div className="px-1.5 py-0.5 rounded-full bg-gold/10 text-gold text-[0.5rem] font-bold">FEATURED</div>}
                            </div>
                         </td>
                         <td className="text-right">
                            <div className="flex justify-end gap-1">
                               <button 
                                  onClick={() => handleRecalculate(t.id)} 
                                  disabled={recalculating === t.id}
                                  className={cn("p-2 text-gold hover:bg-gold/10 rounded transition-all", recalculating === t.id && "animate-spin")}
                                  title="Force Recalculate WS"
                               >
                                  <RefreshCw size={14} />
                               </button>
                               <button 
                                  onClick={() => handleToggleFlag(t.id, 'featured', t.featured)} 
                                  className={cn("p-2 rounded transition-all", t.featured ? "text-gold bg-gold/5" : "text-muted hover:text-white")}
                                  title="Feature on Landing"
                               >
                                  <Star size={14} fill={t.featured ? "currentColor" : "none"} />
                               </button>
                               <button 
                                  onClick={() => handleToggleFlag(t.id, 'verified', t.verified)} 
                                  className={cn("p-2 rounded transition-all", t.verified ? "text-cyan bg-cyan/5" : "text-muted hover:text-white")}
                                  title="Verify Talent"
                               >
                                  <ShieldCheck size={14} />
                               </button>
                               <button onClick={() => setDeleteId(t.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded" title="Delete Profile"><Trash2 size={14} /></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="py-20 text-center text-muted">No talent found matching search.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </Card>

      {deleteId && (
        <ConfirmModal 
           onConfirm={async () => {
              await deleteDoc(doc(db, 'talent_profiles', deleteId));
              toast({ title: 'Talent Profile Deleted' });
              setDeleteId(null);
           }}
           onClose={() => setDeleteId(null)}
           title="Wipe Talent Profile"
           message="This will remove the artist from the roster and all public search results. Historical bookings will remain but profile links will break."
        />
      )}
    </div>
  );
}
