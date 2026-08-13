'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, Users, CheckCircle, Clock, TrendingUp, 
  DollarSign, Download, Search, Loader2, BarChart3,
  ArrowRight, Zap
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminTicketsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const ticketsQuery = useMemoFirebase(() => {
    return query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: tickets, loading } = useCollection(ticketsQuery);

  // Calculate stats
  const stats = useMemo(() => {
    if (!tickets) return { total: 0, checkedIn: 0, remaining: 0, revenue: 0, byType: {} };

    const total = tickets.length;
    const checkedIn = tickets.filter(t => t.status === 'used').length;
    const remaining = total - checkedIn;
    const revenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);

    const byType: Record<string, { count: number; revenue: number }> = {};
    tickets.forEach(t => {
      const type = t.ticketType || 'Standard';
      if (!byType[type]) byType[type] = { count: 0, revenue: 0 };
      byType[type].count++;
      byType[type].revenue += t.price || 0;
    });

    return { total, checkedIn, remaining, revenue, byType };
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => {
      const matchesSearch = 
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        activeFilter === 'All' ||
        (activeFilter === 'Checked In' && t.status === 'used') ||
        (activeFilter === 'Pending' && t.status === 'valid');
      return matchesSearch && matchesFilter;
    });
  }, [tickets, searchTerm, activeFilter]);

  const filters = ['All', 'Checked In', 'Pending'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-[#0B1F14] uppercase tracking-wider">Tickets</h1>
          <p className="text-[0.7rem] text-[#567060] mt-1">Mask Mirage Party — Ticket management</p>
        </div>
        <Button href="/scanner" size="sm">
          <Zap size={14} className="mr-2" /> Open Scanner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sold', value: stats.total, icon: Ticket, color: '#00C853' },
          { label: 'Checked In', value: stats.checkedIn, icon: CheckCircle, color: '#0EA5E9' },
          { label: 'Remaining', value: stats.remaining, icon: Users, color: '#DAAF48' },
          { label: 'Revenue', value: `GH¢${stats.revenue.toLocaleString()}`, icon: DollarSign, color: '#A855F7' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="font-display text-3xl text-[#0B1F14]">{loading ? '—' : stat.value}</p>
            <p className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-[0.2em] mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Ticket Categories */}
      {Object.keys(stats.byType).length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="text-xs font-bold text-[#567060] uppercase tracking-widest mb-4">Ticket Categories</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.byType).map(([type, data]) => (
              <div key={type} className="p-4 rounded-xl bg-[#F0FAF5] border border-[#C8E6D4]">
                <p className="font-display text-xl text-[#0B1F14]">{data.count}</p>
                <p className="text-[0.6rem] font-bold text-[#567060] uppercase tracking-widest">{type}</p>
                <p className="text-xs text-[#00C853] mt-1">GH¢{data.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#567060]" />
          <input
            type="text"
            placeholder="Search by name, email, or ticket ID..."
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

      {/* Tickets Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#00C853]" size={24} />
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket size={48} className="mx-auto text-[#C8E6D4] mb-4" />
          <h3 className="font-display text-xl text-[#0B1F14] mb-2">No Tickets Found</h3>
          <p className="text-[0.8rem] text-[#567060]">
            {searchTerm ? 'Try adjusting your search' : 'No tickets sold yet'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#C8E6D4]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F0FAF5] border-b border-[#C8E6D4]">
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Ticket ID</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Name</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Check-in Time</th>
                <th className="text-right p-4 text-[0.65rem] font-bold text-[#567060] uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-[#C8E6D4]/50 hover:bg-[#F4FBF5] transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs text-[#0B1F14]">{ticket.ticketId || ticket.id}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-[#0B1F14]">{ticket.name}</p>
                      <p className="text-[0.6rem] text-[#567060]">{ticket.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-[#0B1F14]">{ticket.ticketType}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={ticket.status === 'used' ? 'default' : 'active'}>
                      {ticket.status === 'used' ? 'Checked In' : 'Valid'}
                    </Badge>
                  </td>
                  <td className="p-4 text-xs text-[#567060]">
                    {ticket.checkedInAt?.toDate ? format(ticket.checkedInAt.toDate(), 'MMM d, h:mm a') : '—'}
                  </td>
                  <td className="p-4 text-right font-display text-sm text-[#00C853]">
                    GH¢{ticket.price || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Live Attendance Indicator */}
      <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-[#F0FAF5] border border-[#C8E6D4]">
        <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
        <p className="text-xs font-bold text-[#567060] uppercase tracking-widest">
          Live • {stats.checkedIn} of {stats.total} checked in ({stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%)
        </p>
      </div>
    </div>
  );
}
