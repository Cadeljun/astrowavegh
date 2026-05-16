'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Instagram, 
  ExternalLink,
  Search,
  MoreVertical
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function AdminTalentPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const talentQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent'), orderBy('name', 'asc'));
  }, [db]);

  const { data: talent, loading } = useCollection(talentQuery);

  const filteredTalent = useMemo(() => {
    if (!talent) return [];
    return talent.filter((t: any) => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.stageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talent, searchTerm]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'talent', id), { active: !currentStatus });
      toast({ title: "Status Updated", description: `Talent is now ${!currentStatus ? 'active' : 'inactive'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update status." });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'talent', deleteModal.id));
      toast({ title: "Talent Removed", description: `${deleteModal.name} has been removed from the roster.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not remove talent." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Talent Manager</h1>
          <p className="admin-page-subtitle">Manage the AstroWave talent roster and artist profiles.</p>
        </div>
        <Button onClick={() => router.push('/admin/talent/new')}>
          <Plus size={18} className="mr-2" /> ADD TALENT
        </Button>
      </div>

      {/* Filter Row */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          placeholder="Search by name or stage name..."
          className="admin-input pl-12 h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Talent Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-[80px]">Photo</th>
                <th>Name</th>
                <th>Stage Name</th>
                <th>Role</th>
                <th>Social</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="h-16 bg-white/5 opacity-20 border-b border-white/5" />
                  </tr>
                ))
              ) : filteredTalent.length > 0 ? (
                filteredTalent.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10">
                        <img 
                          src={item.imageUrl || 'https://picsum.photos/seed/talent/100/100'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td><span className="font-bold text-white">{item.name}</span></td>
                    <td className="text-muted">{item.stageName}</td>
                    <td>
                      <Badge variant="active" className={
                        item.role === 'DJ' ? 'bg-purple-dim text-purple border-purple' : 
                        item.role === 'Artist' ? 'bg-gold-dim text-gold border-gold' : 
                        'bg-white/5 text-muted border-white/5'
                      }>
                        {item.role}
                      </Badge>
                    </td>
                    <td>
                      {item.instagram ? (
                        <a href={item.instagram} target="_blank" rel="noreferrer" className="text-muted hover:text-gold transition-colors">
                          <Instagram size={18} />
                        </a>
                      ) : <span className="text-muted/20">—</span>}
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${item.active ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-muted'}`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleActive(item.id, item.active)}
                          className="p-2 rounded-sm hover:bg-white/5 text-cyan transition-colors"
                        >
                          {item.active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/talent/${item.id}/edit`)}
                          className="p-2 rounded-sm hover:bg-white/5 text-gold transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.name })}
                          className="p-2 rounded-sm hover:bg-white/5 text-red-400 transition-colors"
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
                      <Users size={48} className="opacity-10" />
                      <p className="font-medium text-white">No talent found.</p>
                      <Button variant="ghost" className="mt-2" onClick={() => router.push('/admin/talent/new')}>ADD FIRST TALENT</Button>
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
        message={`This action cannot be undone. ${deleteModal.name} will be permanently removed from the roster.`}
      />
    </div>
  );
}