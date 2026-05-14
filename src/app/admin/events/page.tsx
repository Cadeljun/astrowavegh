'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import ConfirmModal from '@/components/admin/ConfirmModal';

const CATEGORIES = ['All', 'Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals'];

export default function AdminEventsPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const { data: events, loading } = useCollection(
    query(collection(db, 'events'), orderBy('date', 'desc'))
  );

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e: any) => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.venue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, activeCategory]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'events', id), { active: !currentStatus });
      toast({ title: "Status Updated", description: `Event is now ${!currentStatus ? 'active' : 'inactive'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update status." });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'events', deleteModal.id));
      toast({ title: "Event Deleted", description: `${deleteModal.name} has been removed.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete event." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Events Manager</h1>
          <p className="admin-page-subtitle">Manage all AstroWave events and experiences.</p>
        </div>
        <Button onClick={() => router.push('/admin/events/new')}>
          <Plus size={18} className="mr-2" /> ADD NEW EVENT
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search events by name or venue..."
            className="admin-input pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-[240px]">
          <select
            className="admin-input h-12 appearance-none pr-10"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
        </div>
      </div>

      {/* Events Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-[80px]">Image</th>
                <th>Event Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="h-16 bg-white/5 opacity-20 border-b border-white/5" />
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event: any) => (
                  <tr key={event.id}>
                    <td>
                      <div className="w-12 h-12 rounded-sm overflow-hidden bg-white/5">
                        <img 
                          src={event.imageUrl || 'https://picsum.photos/seed/event/100/100'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td><span className="font-bold text-white">{event.name}</span></td>
                    <td><span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-muted uppercase tracking-wider">{event.category}</span></td>
                    <td className="text-sm font-medium">{format(new Date(event.date), 'MMM d, yyyy')}</td>
                    <td className="text-muted text-sm">{event.venue}</td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${event.active ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-muted'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${event.active ? 'bg-green-500' : 'bg-muted'}`} />
                        {event.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleActive(event.id, event.active)}
                          className="p-2 rounded-sm hover:bg-white/5 text-cyan transition-colors"
                          title={event.active ? "Hide from site" : "Show on site"}
                        >
                          {event.active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                          className="p-2 rounded-sm hover:bg-white/5 text-gold transition-colors"
                          title="Edit Event"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: event.id, name: event.name })}
                          className="p-2 rounded-sm hover:bg-white/5 text-red-400 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted">
                      <CalendarIcon size={48} className="opacity-10" />
                      <div className="space-y-1">
                        <p className="font-medium text-white">No events found.</p>
                        <p className="text-sm">Try adjusting your filters or search term.</p>
                      </div>
                      <Button variant="ghost" className="mt-2" onClick={() => router.push('/admin/events/new')}>ADD FIRST EVENT</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        message={`This action cannot be undone. ${deleteModal.name} will be permanently removed from the AstroWave roster.`}
      />
    </div>
  );
}
