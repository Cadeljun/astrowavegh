'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Award, 
  Zap, 
  Eye, 
  Trash2, 
  Loader2,
  RefreshCw,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function PlatformEventsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [matchingId, setMatchingId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'platform_events'), orderBy('createdAt', 'desc'));
  }, []);

  const { data: events, loading } = useCollection(eventsQuery);

  const stats = useMemo(() => {
    if (!events) return { total: 0, open: 0, booked: 0, completed: 0 };
    return {
      total: events.length,
      open: events.filter((e: any) => e.status === 'open' || e.status === 'matched').length,
      booked: events.filter((e: any) => e.status === 'booked').length,
      completed: events.filter((e: any) => e.status === 'completed').length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e: any) => {
      const matchesSearch = 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.venue?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || e.status === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [events, searchTerm, activeTab]);

  const runMatching = async (eventId: string) => {
    setMatchingId(eventId);
    try {
      const res = await fetch('/api/match/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Engine Success', description: `Matched ${data.totalMatches} candidates.` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Engine Error' });
    } finally {
      setMatchingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
     try {
       await updateDoc(doc(db, 'platform_events', id), { status });
       toast({ title: 'Event Status Updated' });
     } catch (e) {
       toast({ variant: 'destructive', title: 'Update failed' });
     }
  };

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Platform Events</h1>
        <p className="admin-page-subtitle">Track every event brief posted by hosts on AstroWave.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Briefs', value: stats.total, color: 'gold' },
          { label: 'Active Pipeline', value: stats.open, color: 'cyan' },
          { label: 'Booked Gigs', value: stats.booked, color: 'purple' },
          { label: 'Archive/Done', value: stats.completed, color: 'gold' },
        ].map((s) => (
          <Card key={s.label} className="p-6" glowColor={s.color as any}>
            <p className="font-display text-3xl text-white leading-none mb-1">{loading ? '...' : s.value}</p>
            <p className="text-[0.6rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
          {['All', 'Open', 'Booked', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 text-[0.7rem] font-bold uppercase tracking-widest transition-all rounded-sm",
                activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search event title or venue..." 
            className="admin-input h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Events Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
         <div className="overflow-x-auto">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>Event Title</th>
                     <th>Organizer</th>
                     <th>Talent Target</th>
                     <th>Budget</th>
                     <th>Status</th>
                     <th>Sync</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
                  ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((e: any) => (
                      <tr key={e.id} className="group">
                         <td>
                            <div className="space-y-1">
                               <p className="font-bold text-white uppercase text-xs truncate max-w-[200px]">{e.title}</p>
                               <div className="flex items-center gap-2 text-[0.6rem] text-muted uppercase font-bold">
                                  <Calendar size={10} className="text-gold" /> {e.date ? format(e.date.toDate(), 'MMM d') : 'TBA'}
                                  <MapPin size={10} className="text-gold ml-2" /> {e.city}
                               </div>
                            </div>
                         </td>
                         <td className="text-white font-medium text-xs uppercase">{e.organizerName}</td>
                         <td><Badge variant="active" className="text-[0.55rem] bg-purple-dim text-purple border-purple">{e.talentCategory}</Badge></td>
                         <td className="text-gold font-bold text-xs">{e.currency} {e.talentBudget?.toLocaleString()}</td>
                         <td>
                            <Badge variant={e.status === 'open' || e.status === 'matched' ? 'live' : e.status === 'booked' ? 'active' : 'free'}>
                               {e.status?.toUpperCase()}
                            </Badge>
                         </td>
                         <td>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                               <span className="text-[0.6rem] font-bold text-muted uppercase">{e.matchedTalents?.length || 0} Matches</span>
                            </div>
                         </td>
                         <td className="text-right">
                            <div className="flex justify-end gap-1">
                               <button 
                                  onClick={() => runMatching(e.id)} 
                                  disabled={matchingId === e.id}
                                  className={cn("p-2 text-cyan-400 hover:bg-cyan-500/10 rounded transition-all", matchingId === e.id && "animate-spin")}
                                  title="Force AI Matching"
                               >
                                  <Zap size={14} />
                               </button>
                               <button onClick={() => window.open(`/match/${e.id}`, '_blank')} className="p-2 text-muted hover:text-white" title="View as User"><Eye size={14} /></button>
                               <button onClick={() => handleStatusChange(e.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-500/10 rounded" title="Admin Cancel"><Trash2 size={14} /></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="py-20 text-center text-muted">No platform events found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
