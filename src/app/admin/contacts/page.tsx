'use client';

import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Search, 
  Download, 
  Trash2, 
  CheckCircle, 
  Eye,
  Filter,
  MessageSquare,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, where, getCountFromServer } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format, subDays } from 'date-fns';
import { exportToCSV } from '@/lib/exportCSV';
import ContactModal from '@/components/admin/ContactModal';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function AdminContactsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const contactsQuery = useMemoFirebase(() => {
    return query(collection(db, 'contacts'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: contacts, loading } = useCollection(contactsQuery);

  const stats = useMemo(() => {
    if (!contacts) return { total: 0, new: 0, unread: 0 };
    const last7Days = subDays(new Date(), 7);
    return {
      total: contacts.length,
      new: contacts.filter((c: any) => c.timestamp?.toDate() > last7Days).length,
      unread: contacts.filter((c: any) => !c.read).length
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || c.subject === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [contacts, searchTerm, activeFilter]);

  const handleExport = () => {
    exportToCSV(filteredContacts, `astrowave-contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast({ title: "Exporting CSV", description: "Your download will begin shortly." });
  };

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { read: true });
      toast({ title: "Marked as read" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error updating" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'contacts', deleteId));
      setDeleteId(null);
      setIsDetailOpen(false);
      toast({ title: "Message Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error deleting" });
    }
  };

  const openDetail = (contact: any) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const subjectBadge = (subject: string) => {
    const colors: any = {
      'Event Booking': 'gold',
      'Talent Inquiry': 'purple',
      'Partnership': 'cyan',
      'General Enquiry': 'muted'
    };
    return <Badge variant="active" className={`bg-${colors[subject] || 'muted'}-dim text-${colors[subject] || 'muted'} border-${colors[subject] || 'muted'} text-[0.55rem]`}>{subject}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Contacts</h1>
          <p className="admin-page-subtitle">Manage communications from your community.</p>
        </div>
        <Button variant="ghost" className="border border-white/5" onClick={handleExport}>
          <Download size={18} className="mr-2" /> EXPORT CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: 'gold' },
          { label: 'New This Week', value: stats.new, icon: Clock, color: 'cyan' },
          { label: 'Unread Messages', value: stats.unread, icon: Mail, color: 'purple' }
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="admin-input pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="admin-input h-12 w-full md:w-[240px]"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="All">All Subjects</option>
          <option value="Event Booking">Event Booking</option>
          <option value="Talent Inquiry">Talent Inquiry</option>
          <option value="Partnership">Partnership</option>
          <option value="General Enquiry">General Enquiry</option>
        </select>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-[40px]"></th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Message Snippet</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((c: any) => (
                  <tr 
                    key={c.id} 
                    className={`cursor-pointer group ${!c.read ? 'bg-gold/5' : ''}`}
                    onClick={() => openDetail(c)}
                  >
                    <td>
                      {!c.read && <div className="w-2 h-2 rounded-full bg-gold animate-pulse mx-auto" />}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-[0.7rem] text-muted">{c.email}</span>
                      </div>
                    </td>
                    <td>{subjectBadge(c.subject)}</td>
                    <td className="max-w-[300px]">
                      <p className="text-xs text-muted truncate">{c.message}</p>
                    </td>
                    <td className="text-[0.7rem] text-muted">
                      {c.timestamp ? format(c.timestamp.toDate(), 'MMM d, HH:mm') : '...'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openDetail(c)} className="p-2 text-cyan hover:bg-cyan/10 rounded-sm transition-colors"><Eye size={16} /></button>
                        {!c.read && <button onClick={() => handleMarkRead(c.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-sm transition-colors"><CheckCircle size={16} /></button>}
                        <button onClick={() => setDeleteId(c.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted italic">No contacts found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ContactModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        contact={selectedContact}
        onDelete={(id) => setDeleteId(id)}
      />

      {deleteId && <ConfirmModal
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This message will be permanently removed from your records."
      />}
    </div>
  );
}