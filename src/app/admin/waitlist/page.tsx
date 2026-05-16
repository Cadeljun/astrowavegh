'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Download, 
  Trash2, 
  Copy,
  Users,
  Music,
  Heart
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportCSV';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { cn } from '@/lib/utils';

export default function AdminWaitlistPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const waitlistQuery = useMemoFirebase(() => {
    return query(collection(db, 'waitlist'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: waitlist, loading } = useCollection(waitlistQuery);

  const stats = useMemo(() => {
    if (!waitlist) return { total: 0, records: 0, cares: 0 };
    return {
      total: waitlist.length,
      records: waitlist.filter((w: any) => w.division?.toLowerCase() === 'records').length,
      cares: waitlist.filter((w: any) => w.division?.toLowerCase() === 'cares').length
    };
  }, [waitlist]);

  const filteredWaitlist = useMemo(() => {
    if (!waitlist) return [];
    return waitlist.filter((w: any) => {
      const matchesSearch = w.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || w.division?.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [waitlist, searchTerm, activeTab]);

  const handleExport = () => {
    exportToCSV(filteredWaitlist, `astrowave-waitlist-${activeTab.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email Copied" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'waitlist', deleteId));
      setDeleteId(null);
      toast({ title: "Signup Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Waitlist</h1>
          <p className="admin-page-subtitle">Manage Records & Cares division signups.</p>
        </div>
        <Button variant="ghost" className="border border-white/5" onClick={handleExport}>
          <Download size={18} className="mr-2" /> EXPORT CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Signups', value: stats.total, icon: Users, color: 'muted' },
          { label: 'Records Division', value: stats.records, icon: Music, color: 'gold' },
          { label: 'Cares Division', value: stats.cares, icon: Heart, color: 'purple' }
        ].map((s) => (
          <Card key={s.label} className="p-6 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color as any}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-${s.color}-dim text-${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="font-display text-3xl text-white">{loading ? '...' : s.value}</p>
                <p className="admin-label m-0 text-[0.6rem]">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex bg-white/5 p-1 rounded-sm border border-white/5 w-full md:w-auto">
          {['All', 'Records', 'Cares'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 rounded-sm text-[0.7rem] font-bold tracking-widest uppercase transition-all",
                activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by email address..."
            className="admin-input pl-12 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Division</th>
                <th>Signup Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
              ) : filteredWaitlist.length > 0 ? (
                filteredWaitlist.map((w: any) => (
                  <tr key={w.id}>
                    <td className="group">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{w.email}</span>
                        <button onClick={() => copyEmail(w.email)} className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-gold transition-all">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <Badge variant="active" className={w.division?.toLowerCase() === 'records' ? 'bg-gold-dim text-gold border-gold' : 'bg-purple-dim text-purple border-purple'}>
                        {w.division || 'General'}
                      </Badge>
                    </td>
                    <td className="text-xs text-muted">
                      {w.timestamp ? format(w.timestamp.toDate(), 'PPP • p') : '...'}
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => setDeleteId(w.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-20 text-center text-muted italic">No waitlist entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This signup will be removed from your waitlist records."
      />
    </div>
  );
}