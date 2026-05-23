'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  MapPin, 
  Zap, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Star,
  FileText,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
  MessageSquare
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
import { BookingStatusBadge } from '@/components/platform/BookingStatusBadge';

export default function PlatformBookingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const bookingsQuery = useMemoFirebase(() => {
    return query(collection(db, 'bookings'), orderBy('requestedAt', 'desc'));
  }, []);

  const { data: bookings, loading } = useCollection(bookingsQuery);

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, pending: 0, accepted: 0, completed: 0, cancelled: 0 };
    return {
      total: bookings.length,
      pending: bookings.filter((b: any) => b.status === 'pending').length,
      accepted: bookings.filter((b: any) => b.status === 'accepted').length,
      completed: bookings.filter((b: any) => b.status === 'completed').length,
      cancelled: bookings.filter((b: any) => b.status === 'cancelled' || b.status === 'declined').length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b: any) => {
      const matchesSearch = 
        b.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.talentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.organizerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || b.status === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [bookings, searchTerm, activeTab]);

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Booking Registry</h1>
        <p className="admin-page-subtitle">Historical log of all professional engagements and transactions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Requests', value: stats.total, color: 'gold' },
          { label: 'Pending', value: stats.pending, color: 'gold' },
          { label: 'Accepted', value: stats.accepted, color: 'purple' },
          { label: 'Finished', value: stats.completed, color: 'cyan' },
          { label: 'Terminated', value: stats.cancelled, color: 'muted' },
        ].map((s) => (
          <Card key={s.label} className="p-6" glowColor={s.color as any}>
            <p className="font-display text-2xl text-white leading-none mb-1">{loading ? '...' : s.value}</p>
            <p className="text-[0.55rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5 overflow-x-auto scrollbar-hide w-full md:w-auto">
          {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm whitespace-nowrap",
                activeTab === tab ? "bg-white/10 text-white" : "text-muted hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input 
            type="text" 
            placeholder="Search booking context..." 
            className="admin-input pl-10 h-11 text-xs"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
         <div className="overflow-x-auto">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>Event & Context</th>
                     <th>Organizer</th>
                     <th>Talent</th>
                     <th>Price</th>
                     <th>Match</th>
                     <th>Status</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((b: any) => (
                      <tr key={b.id} className="group">
                         <td>
                            <div className="space-y-1">
                               <p className="font-bold text-white uppercase text-xs truncate max-w-[180px]">{b.eventTitle}</p>
                               <p className="text-[0.6rem] text-muted font-mono uppercase">ID: {b.id.slice(0, 8)}</p>
                            </div>
                         </td>
                         <td className="text-white text-xs uppercase">{b.organizerName}</td>
                         <td className="text-purple-400 font-bold text-xs uppercase">{b.talentStageName}</td>
                         <td className="text-gold font-bold text-xs">{b.currency} {b.agreedPrice?.toLocaleString()}</td>
                         <td><Badge variant="active" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[0.6rem]">{b.matchPercentage}%</Badge></td>
                         <td><BookingStatusBadge status={b.status} /></td>
                         <td className="text-right">
                            <div className="flex justify-end gap-1">
                               <button onClick={() => setSelectedBooking(b)} className="p-2 text-muted hover:text-white" title="Audit Detail"><Eye size={14} /></button>
                               <button className="p-2 text-red-500/40 hover:text-red-500" title="Delete record"><Trash2 size={14} /></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="py-20 text-center text-muted">No bookings archived.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </Card>

      {/* Booking Detail Overhaul */}
      {selectedBooking && (
         <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedBooking(null)} />
            <Card className="relative z-10 w-full max-w-4xl bg-dark border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="space-y-1">
                     <h2 className="display-sm text-2xl text-white uppercase">Engagement Dossier</h2>
                     <p className="text-[0.6rem] text-gold uppercase tracking-[0.3em]">PLATFORM_TRANSACTION_AUDIT</p>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="p-2 text-muted hover:text-white"><X size={24} /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <SectionLabel>THE BRIEF</SectionLabel>
                        <div className="space-y-2 text-xs">
                           <p className="font-bold text-white uppercase">{selectedBooking.eventTitle}</p>
                           <p className="text-muted flex items-center gap-2"><Calendar size={12} /> {selectedBooking.eventDate ? format(selectedBooking.eventDate.toDate(), 'PPP') : 'TBA'}</p>
                           <p className="text-muted flex items-center gap-2"><MapPin size={12} /> {selectedBooking.eventVenue}, {selectedBooking.eventCity}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <SectionLabel>PARTICIPANTS</SectionLabel>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold">OR</div>
                              <div><p className="text-xs text-white uppercase font-bold">{selectedBooking.organizerName}</p><p className="text-[0.5rem] text-muted">ID: {selectedBooking.organizerId}</p></div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple text-[10px] font-bold">TA</div>
                              <div><p className="text-xs text-white uppercase font-bold">{selectedBooking.talentStageName}</p><p className="text-[0.5rem] text-muted">ID: {selectedBooking.talentId}</p></div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <SectionLabel>COMMERCIALS</SectionLabel>
                        <div className="p-4 rounded bg-white/5 border border-white/5 text-center space-y-1">
                           <p className="text-xl font-display text-gold">{selectedBooking.currency} {selectedBooking.agreedPrice?.toLocaleString()}</p>
                           <p className="text-[0.5rem] text-muted uppercase font-bold">Matched at {selectedBooking.matchPercentage}%</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <SectionLabel>COMMUNICATION THREAD</SectionLabel>
                     <div className="space-y-4">
                        <div className="p-6 rounded-xl bg-black/40 border border-white/5 relative">
                           <p className="text-[0.55rem] text-gold uppercase font-bold mb-2">Organizer Message</p>
                           <p className="body-md text-white/80 italic leading-relaxed">"{selectedBooking.message || 'No engagement message provided.'}"</p>
                        </div>
                        {selectedBooking.talentResponse && (
                           <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/10 relative">
                              <p className="text-[0.55rem] text-purple-400 uppercase font-bold mb-2">Talent Response</p>
                              <p className="body-md text-white/80 leading-relaxed">{selectedBooking.talentResponse}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="p-8 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-6">
                     <AlertTriangle size={24} className="text-cyan-400 shrink-0" />
                     <div className="space-y-2">
                        <p className="text-sm font-bold text-white uppercase tracking-widest">Dispute Oversight</p>
                        <p className="text-xs text-muted leading-relaxed">Admin has override authority to force status changes or resolve disputes. Current Status: <span className="text-white font-bold">{selectedBooking.status.toUpperCase()}</span></p>
                        <div className="flex gap-4 pt-2">
                           <Button variant="ghost" className="h-9 px-4 text-[0.6rem] border-white/10">FLAG AS DISPUTED</Button>
                           <Button variant="ghost" className="h-9 px-4 text-[0.6rem] border-white/10">CLOSE ENGAGEMENT</Button>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      )}
    </div>
  );
}
