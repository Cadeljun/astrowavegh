'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  ShieldCheck, 
  ShieldX, 
  Trash2, 
  Award, 
  Mail, 
  MapPin,
  Loader2,
  MoreVertical,
  X
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

export default function PlatformUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, []);

  const { data: users, loading } = useCollection(usersQuery);

  const stats = useMemo(() => {
    if (!users) return { total: 0, organizers: 0, talents: 0, both: 0 };
    return {
      total: users.length,
      organizers: users.filter((u: any) => u.role === 'organizer').length,
      talents: users.filter((u: any) => u.role === 'talent').length,
      both: users.filter((u: any) => u.role === 'both').length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => {
      const matchesSearch = 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = 
        activeTab === 'All' || 
        (activeTab === 'Organizers' && (u.role === 'organizer' || u.role === 'both')) ||
        (activeTab === 'Talents' && (u.role === 'talent' || u.role === 'both'));

      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const handleToggleStatus = async (user: any) => {
    try {
      await updateDoc(doc(db, 'users', user.id), { active: !user.active });
      toast({ title: `Account ${!user.active ? 'Activated' : 'Deactivated'}` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error updating status' });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({ title: 'Role Updated' });
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error updating role' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'users', deleteId));
      toast({ title: 'User Account Deleted' });
      setDeleteId(null);
      setSelectedUser(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Delete Failed' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Platform Users</h1>
        <p className="admin-page-subtitle">Oversee all organizer and creative talent accounts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.total, color: 'gold' },
          { label: 'Organizers', value: stats.organizers, color: 'gold' },
          { label: 'Talents', value: stats.talents, color: 'purple' },
          { label: 'Hybrid Users', value: stats.both, color: 'cyan' },
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
          {['All', 'Organizers', 'Talents'].map(tab => (
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
            placeholder="Search by name, email..." 
            className="admin-input pl-11 h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" glowColor="muted">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-white/5 border-b border-white/5" /></tr>)
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted font-bold text-xs uppercase">{u.displayName?.[0]}</div>}
                        </div>
                        <span className="font-bold text-white uppercase text-xs">{u.displayName || 'Unset'}</span>
                      </div>
                    </td>
                    <td className="text-muted text-xs">{u.email}</td>
                    <td>
                      <Badge variant="active" className={cn(
                        u.role === 'talent' ? 'bg-purple-dim text-purple border-purple' : 
                        u.role === 'organizer' ? 'bg-gold-dim text-gold border-gold' : 
                        'bg-cyan-dim text-cyan border-cyan'
                      )}>
                        {u.role?.toUpperCase() || 'NEW'}
                      </Badge>
                    </td>
                    <td className="text-muted text-[0.7rem] uppercase">
                      {u.createdAt ? format(u.createdAt.toDate(), 'MMM d, yyyy') : '...'}
                    </td>
                    <td>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase",
                        u.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", u.active ? "bg-green-500" : "bg-red-500")} />
                        {u.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedUser(u)} className="p-2 text-muted hover:text-white hover:bg-white/5 rounded transition-all" title="View Dossier"><Eye size={16} /></button>
                        <button onClick={() => handleToggleStatus(u)} className={cn("p-2 rounded transition-all", u.active ? "text-red-400 hover:bg-red-400/10" : "text-green-400 hover:bg-green-400/10")}>
                          {u.active ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-20 text-center text-muted italic">No users matching search found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
          <Card className="relative z-10 w-full max-w-2xl bg-[#0A0A0F] border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-surface">
                  <img src={selectedUser.photoURL || 'https://picsum.photos/seed/user/200/200'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="space-y-2">
                   <h2 className="display-sm text-3xl text-white uppercase leading-none">{selectedUser.displayName}</h2>
                   <div className="flex items-center gap-4 text-xs text-muted font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Mail size={12} className="text-gold" /> {selectedUser.email}</span>
                     <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> {selectedUser.city || 'Location Unset'}</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-muted hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <SectionLabel>ACCOUNT STATUS</SectionLabel>
                     <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                           <span className="text-muted uppercase">Role</span>
                           <span className="text-white font-bold uppercase">{selectedUser.role}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-muted uppercase">Onboarded</span>
                           <span className={selectedUser.onboarded ? "text-green-400" : "text-red-400"}>{selectedUser.onboarded ? "COMPLETE" : "PENDING"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-muted uppercase">Provider</span>
                           <span className="text-white font-bold uppercase">{selectedUser.provider || 'email'}</span>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <SectionLabel>PERMISSIONS</SectionLabel>
                     <div className="space-y-4">
                        <div className="flex gap-2">
                           <button onClick={() => handleRoleChange(selectedUser.id, 'organizer')} className={cn("flex-1 py-2 rounded border text-[0.6rem] font-bold uppercase tracking-tighter", selectedUser.role === 'organizer' ? "bg-gold text-black border-gold" : "bg-white/5 text-muted border-white/10")}>Make Organizer</button>
                           <button onClick={() => handleRoleChange(selectedUser.id, 'talent')} className={cn("flex-1 py-2 rounded border text-[0.6rem] font-bold uppercase tracking-tighter", selectedUser.role === 'talent' ? "bg-purple text-white border-purple" : "bg-white/5 text-muted border-white/10")}>Make Talent</button>
                        </div>
                        <Button variant="ghost" className="w-full border-white/5 text-[0.6rem] h-10" onClick={() => handleToggleStatus(selectedUser)}>
                           {selectedUser.active ? "SUSPEND ACCOUNT" : "REINSTATE ACCOUNT"}
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-4">
                  <SectionLabel className="mb-0">INTERNAL LOGS</SectionLabel>
                  <div className="space-y-2 text-[0.65rem] font-mono text-muted">
                    <p>REGISTERED: {selectedUser.createdAt ? selectedUser.createdAt.toDate().toLocaleString() : '---'}</p>
                    <p>LAST_LOGIN: {selectedUser.lastLogin ? selectedUser.lastLogin.toDate().toLocaleString() : '---'}</p>
                    <p>NODE_ID: {selectedUser.id}</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-black/60 border-t border-white/5 flex justify-between gap-4">
              <Button variant="ghost" onClick={() => setSelectedUser(null)} className="h-12 px-8">CLOSE DOSSIER</Button>
              <Button variant="ghost" onClick={() => setDeleteId(selectedUser.id)} className="h-12 px-8 text-red-500 hover:bg-red-500/10 border-red-500/20">DELETE ACCOUNT</Button>
            </div>
          </Card>
        </div>
      )}

      {deleteId && (
        <ConfirmModal 
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          title="Delete User"
          message="This will permanently wipe all user data, profile, and history. This action cannot be reversed."
        />
      )}
    </div>
  );
}
