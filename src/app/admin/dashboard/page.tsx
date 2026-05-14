'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Zap, 
  Mail, 
  Bell 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';

const stats = [
  { label: 'Total Events', value: '12', icon: Zap, color: 'gold' },
  { label: 'Managed Talent', value: '4', icon: Users, color: 'purple' },
  { label: 'Unread Contacts', value: '28', icon: Mail, color: 'cyan' },
  { label: 'Waitlist Size', value: '142', icon: Bell, color: 'gold' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back to the AstroWave command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6" glowColor={stat.color as any}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="label text-[0.6rem]">{stat.label}</p>
                    <p className="font-display text-[2.5rem] leading-none text-white">{stat.value}</p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-sm",
                    stat.color === 'gold' ? 'bg-gold-dim text-gold' : 
                    stat.color === 'purple' ? 'bg-purple-dim text-purple' : 'bg-cyan-dim text-cyan'
                  )}>
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8" glowColor="muted">
          <SectionLabel>RECENT ACTIVITY</SectionLabel>
          <div className="mt-6 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted">
                  <Zap size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">New event booking inquiry received</p>
                  <p className="text-xs text-muted">2 hours ago • via Contact Form</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8" glowColor="muted">
          <SectionLabel>QUICK ACTIONS</SectionLabel>
          <div className="mt-6 space-y-3">
            <Button variant="primary" className="w-full justify-start text-xs h-12">
              <Zap size={16} className="mr-2" /> CREATE NEW EVENT
            </Button>
            <Button variant="secondary" className="w-full justify-start text-xs h-12">
              <Users size={16} className="mr-2" /> ADD NEW TALENT
            </Button>
            <Button variant="ghost" className="w-full justify-start text-xs h-12 border border-white/5">
              <Upload size={16} className="mr-2" /> UPLOAD MEDIA
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
