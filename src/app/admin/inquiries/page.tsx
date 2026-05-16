'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  UserPlus,
  CheckCircle,
  Instagram,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format, subDays } from 'date-fns';
import { exportToCSV } from '@/lib/exportCSV';
import InquiryModal from '@/components/admin/InquiryModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function AdminInquiriesPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const inquiriesQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent_inquiries'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: inquiries, loading } = useCollection(inquiriesQuery);

  const stats = useMemo(() => {
    if (!inquiries) return { total: 0, new: 0, topRole: '...' };
    const last7Days = subDays(new Date(), 7);
    const roleCounts = inquiries.reduce((acc: any, curr: any) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {});
    const topRole = Object.entries(roleCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '...';

    return {
      total: inquiries.length,
      new: inquiries.filter((i: any) => i.timestamp?.toDate() > last7Days).length,
      topRole
    };
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (!inquiries) return [];
    return inquiries.filter((i: any) => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            i.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = activeRole === 'All' || i.role === activeRole;
      return matchesSearch && matchesRole;
    });
  }, [inquiries, searchTerm, activeRole]);

  const handleExport = () => {
    exportToCSV(filteredInquiries, `astrowave-talent-inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'talent_inquiries', id), { read: true });
      toast({ title: "Inquiry reviewed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error updating" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'talent_inquiries', deleteId));
      setDeleteId(null);
      setIsDetailOpen(false);
      toast({ title: "Inquiry Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const openDetail = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const handleAddToRoster = (inquiry: any) => {
    const data = {
      name: inquiry.name,
      stageName: inquiry.stageName,
      role: inquiry.role,
      email: inquiry.email,
      bio: inquiry.bio,
      instagram: inquiry.socialLink
    };
    sessionStorage.setItem('prefill_talent', JSON.stringify(data));
    router.push('/admin/talent/new?prefill=true');
  };

  const roleBadge = (role: string) => {
    const colors: any = {
      'DJ': 'purple',
      'Artist': 'gold',
      'Influencer': 'cyan',
      'Model': 'muted',
      'Content Creator': 'muted'
    };
    return <Badge variant="active" className={`bg-${colors[role] || 'muted'}-dim text-${colors[role] || 'muted'} border-${colors[role] || 'muted'} text-[0.55rem]`}>{role}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Talent Inquiries</h1>
          <p className="admin-page-subtitle">Curate your roster from community submissions.</p>
        </div>
        <Button variant="ghost" className="border border-white/5" onClick={handleExport}>
          <Download size={18} className="mr-2" /> EXPORT CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inquiries', value: stats.total, icon: FileText, color: 'muted' },
          { label: 'New This Week', value: stats.new, icon: Zap, color: 'gold' },
          { label: 'Top Role Request', value: stats.topRole, icon: Award, color: 'purple' }
        ].map((s) => (
          <Card key={s.label} className="p-6 border-b-2" style={{ borderBottomColor: `var(--color-${s.color})` }} glowColor={s.color as any}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-${s.color}-dim text-${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="font-display text-2xl text-white uppercase">{loading ? '...' : s.value}</p>
                <p className="admin-label m-0 text-[0.6rem]">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name, stage name, or email..."
            className="admin-input pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="admin-input h-12 w-full md:w-[200px]"
          value={activeRole}
          onChange={(e) => setActiveRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="DJ">DJ</option>
          <option value="Artist">Artist</option>
          <option value="Influencer">Influencer</option>
          <option value="Model">Model</option>
          <option value="Content Creator">Content Creator</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-[40px]"></th>
                <th>Talent</th>
                <th>Role</th>
                <th>Social</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((i: any) => (
                  <tr 
                    key={i.id} 
                    className={`cursor-pointer group ${!i.read ? 'bg-purple/5' : ''}`}
                    onClick={() => openDetail(i)}
                  >
                    <td>
                      {!i.read && <div className="w-2 h-2 rounded-full bg-purple animate-pulse mx-auto" />}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{i.stageName || i.name}</span>
                        <span className="text-[0.7rem] text-muted">{i.name} • {i.email}</span>
                      </div>
                    </td>
                    <td>{roleBadge(i.role)}</td>
                    <td>
                      {i.socialLink ? (
                        <a href={i.socialLink} target="_blank" onClick={e => e.stopPropagation()} className="text-muted hover:text-gold transition-colors">
                          <Instagram size={16} />
                        </a>
                      ) : <span className="text-muted/20">—</span>}
                    </td>
                    <td className="text-[0.7rem] text-muted">
                      {i.timestamp ? format(i.timestamp.toDate(), 'MMM d') : '...'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openDetail(i)} className="p-2 text-cyan hover:bg-cyan/10 rounded-sm transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => handleAddToRoster(i)} className="p-2 text-gold hover:bg-gold/10 rounded-sm transition-colors" title="Add to Roster"><UserPlus size={16} /></button>
                        {!i.read && <button onClick={() => handleMarkRead(i.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-sm transition-colors"><CheckCircle size={16} /></button>}
                        <button onClick={() => setDeleteId(i.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-20 text-center text-muted italic">No inquiries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <InquiryModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        inquiry={selectedInquiry}
        onDelete={(id) => setDeleteId(id)}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This inquiry will be removed from your records."
      />
    </div>
  );
}