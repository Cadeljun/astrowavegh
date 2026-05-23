'use client';

import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  User, 
  Zap, 
  Award,
  Loader2,
  Info
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { updateTalentWaveScore } from '@/lib/algorithms/updateWaveScore';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function PlatformRatingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTalentId, setDeleteTalentId] = useState<string | null>(null);

  const ratingsQuery = useMemoFirebase(() => {
    return query(collection(db, 'ratings'), orderBy('submittedAt', 'desc'));
  }, []);

  const { data: ratings, loading } = useCollection(ratingsQuery);

  const stats = useMemo(() => {
    if (!ratings) return { total: 0, avg: 0, fiveStar: 0, oneStar: 0 };
    return {
      total: ratings.length,
      avg: ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.overall || 0), 0) / ratings.length : 0,
      fiveStar: ratings.filter((r: any) => r.overall === 5).length,
      oneStar: ratings.filter((r: any) => r.overall === 1).length,
    };
  }, [ratings]);

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    return ratings.filter((r: any) => {
      const matchesSearch = 
        r.talentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.organizerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScore = r.overall >= minScore;
      return matchesSearch && matchesScore;
    });
  }, [ratings, searchTerm, minScore]);

  const handleDeleteReview = async () => {
    if (!deleteId || !deleteTalentId) return;
    try {
      await deleteDoc(doc(db, 'ratings', deleteId));
      // Recalculate score after deletion
      await updateTalentWaveScore(deleteTalentId);
      toast({ title: 'Review Terminated', description: 'Wave Score has been updated.' });
      setDeleteId(null);
      setDeleteTalentId(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Deletion failed' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ratings & Reviews</h1>
        <p className="admin-page-subtitle">Moderate community feedback and performance sentiment.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Reviews', value: stats.total, color: 'purple' },
          { label: 'Platform Avg', value: stats.avg.toFixed(1) + ' ★', color: 'gold' },
          { label: 'Perfect Scores', value: stats.fiveStar, color: 'cyan' },
          { label: 'Critical Reviews', value: stats.oneStar, color: 'muted' },
        ].map((s) => (
          <Card key={s.label} className="p-6" glowColor={s.color as any}>
            <p className="font-display text-3xl text-white leading-none mb-1">{loading ? '...' : s.value}</p>
            <p className="text-[0.6rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search talent or organizer..." 
            className="admin-input pl-11 h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[0.6rem] font-bold text-muted uppercase">Min Stars</span>
           <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
              {[0, 1, 2, 3, 4, 5].map(s => (
                 <button 
                    key={s} 
                    onClick={() => setMinScore(s)}
                    className={cn("w-8 h-8 flex items-center justify-center rounded text-xs transition-all", minScore === s ? "bg-gold text-black font-bold" : "text-muted hover:text-white")}
                 >{s === 0 ? 'All' : s}</button>
              ))}
           </div>
        </div>
      </div>

      {/* Ratings Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
         <div className="overflow-x-auto">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>Context</th>
                     <th>Rating</th>
                     <th>Detailed Scores</th>
                     <th>Written Feedback</th>
                     <th>Date</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
                  ) : filteredRatings.length > 0 ? (
                    filteredRatings.map((r: any) => (
                      <tr key={r.id} className={cn("group", r.overall < 2 && "bg-red-500/5")}>
                         <td>
                            <div className="space-y-0.5">
                               <p className="text-[0.65rem] text-gold uppercase font-bold">{r.organizerName}</p>
                               <p className="text-[0.5rem] text-muted">TO</p>
                               <p className="text-[0.65rem] text-purple-400 uppercase font-bold">{r.talentName || t.stageName}</p>
                            </div>
                         </td>
                         <td>
                            <div className="flex flex-col gap-1">
                               <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= r.overall ? '#FFD166' : 'none'} className={s <= r.overall ? "text-gold" : "text-white/10"} />)}
                               </div>
                               <span className="text-[0.7rem] font-bold text-white">{r.overall}.0 Overall</span>
                            </div>
                         </td>
                         <td>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.55rem] font-bold text-muted uppercase">
                               <span>PERF: {r.performance}</span>
                               <span>PROF: {r.professionalism}</span>
                               <span>COMM: {r.communication}</span>
                               <span>VALU: {r.valueForMoney}</span>
                            </div>
                         </td>
                         <td className="max-w-[240px]">
                            <p className="text-[0.65rem] text-white/80 line-clamp-2 italic leading-relaxed">"{r.review}"</p>
                         </td>
                         <td className="text-muted text-[0.6rem] uppercase font-bold">
                            {r.submittedAt ? format(r.submittedAt.toDate(), 'MMM d, p') : '...'}
                         </td>
                         <td className="text-right">
                            <div className="flex justify-end gap-2">
                               <button onClick={() => { setDeleteId(r.id); setDeleteTalentId(r.talentId); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded" title="Moderate/Delete"><Trash2 size={14} /></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="py-20 text-center text-muted">No reviews submitted on platform yet.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </Card>

      {deleteId && (
        <ConfirmModal 
           onConfirm={handleDeleteReview}
           onClose={() => { setDeleteId(null); setDeleteTalentId(null); }}
           title="Terminate Review"
           message="Removing this review will immediately recalculate the talent's average rating and global Wave Score. Use only for spam or inappropriate content."
        />
      )}
    </div>
  );
}
