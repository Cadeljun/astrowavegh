'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle, Star, Ban, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { 
    label: 'Pending', 
    color: '#FFD166',
    bg: 'rgba(255,209,102,0.1)',
    border: 'rgba(255,209,102,0.3)',
    icon: Clock
  },
  accepted: { 
    label: 'Accepted', 
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    icon: CheckCircle
  },
  declined: { 
    label: 'Declined', 
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    icon: XCircle
  },
  completed: { 
    label: 'Completed', 
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.3)',
    icon: Star
  },
  cancelled: { 
    label: 'Cancelled', 
    color: '#7B7B9A',
    bg: 'rgba(123,123,154,0.1)',
    border: 'rgba(123,123,154,0.3)',
    icon: Ban
  }
};

export function BookingStatusBadge({
  status,
  className
}: { 
  status: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-[0.65rem] font-bold uppercase tracking-widest transition-all",
        className
      )}
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`
      }}
    >
      <Icon size={12} className={cn(status === 'pending' && "animate-pulse")} />
      {config.label}
    </span>
  );
}
