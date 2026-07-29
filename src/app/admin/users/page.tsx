'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Shield,
  Mail,
  Calendar,
  Trash2,
  Eye,
  Loader2,
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);

  const filters = ['All', 'Active', 'Inactive'];

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => {
      const matchesSearch = 
        (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        activeFilter === 'All' || 
        (activeFilter === 'Active' && user.active !== false) ||
        (activeFilter === 'Inactive' && user.active === false);
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, activeFilter]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, inactive: 0 };
    return {
      total: users.length,
      active: users.filter(u => u.active !== false).length,
      inactive: users.filter(u => u.active === false).length,
    };
  }, [users]);

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { active: !currentActive });
      toast({ title: currentActive ? 'User deactivated' : 'User activated' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update user' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'users', deleteId));
      toast({ title: 'User deleted' });
      setDeleteId(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to delete user' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-[#0B1F14] uppercase tracking-wider">Users</h1>
          <p className="text-[0.7rem] text-[#567060] mt-1">Manage platform users and access</p>
        </div>
        <Button href="/api/admin/create-user" size="sm">
          <UserPlus size={14} className="mr-2" /> ADD USER
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Users', value: stats.total, color: '#0B1F14' },
          { label: 'Active', value: stats.active, color: '#00C853' },
          { label: 'Inactive', value: stats.inactive, color: '#EF4444' },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <p className="font-display text-2xl" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[0.6rem] text-[#567060] uppercase tracking-wider">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#567060]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#C8E6D4] bg-white text-[0.8rem] focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-all",
                activeFilter === filter
                  ? "bg-[#00C853] text-white"
                  : "bg-white border border-[#C8E6D4] text-[#567060] hover:border-[#00C853]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#00C853]" size={24} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-[#C8E6D4] mb-4" />
          <h3 className="font-display text-xl text-[#0B1F14] mb-2">No Users Found</h3>
          <p className="text-[0.8rem] text-[#567060]">
            {searchTerm ? 'Try adjusting your search' : 'No users have been added yet'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#C8E6D4]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F0FAF5] border-b border-[#C8E6D4]">
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Email</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#C8E6D4]/50 hover:bg-[#F0FAF5]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853] font-bold text-[0.7rem]">
                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-[0.8rem] font-medium text-[#0B1F14]">{user.displayName || 'No name'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[0.8rem] text-[#567060]">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.active !== false ? 'default' : 'destructive'}>
                      {user.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-4 text-[0.8rem] text-[#567060]">
                    {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id, user.active !== false)}
                        className="p-2 rounded-lg hover:bg-[#00C853]/10 transition-colors"
                        title={user.active !== false ? 'Deactivate' : 'Activate'}
                      >
                        {user.active !== false ? <XCircle size={14} className="text-red-400" /> : <CheckCircle size={14} className="text-[#00C853]" />}
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
