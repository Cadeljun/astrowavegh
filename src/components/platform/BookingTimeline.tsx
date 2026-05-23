'use client';

import React from 'react';
import { Send, MessageSquare, Calendar, CheckCircle, Star, LucideIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BookingTimelineProps {
  booking: any;
}

interface TimelineStep {
  label: string;
  date: any;
  completed: boolean;
  icon: LucideIcon;
  color: string;
}

export function BookingTimeline({ booking }: BookingTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: 'Request Sent',
      date: booking.requestedAt,
      completed: !!booking.requestedAt,
      icon: Send,
      color: 'text-gold'
    },
    {
      label: 'Talent Responded',
      date: booking.respondedAt,
      completed: !!booking.respondedAt,
      icon: MessageSquare,
      color: 'text-purple'
    },
    {
      label: 'Event Day',
      date: booking.eventDate,
      completed: booking.status === 'completed' || booking.status === 'accepted' || booking.status === 'declined', // just a marker
      icon: Calendar,
      color: 'text-cyan'
    },
    {
      label: 'Engagement Complete',
      date: booking.completedAt,
      completed: !!booking.completedAt,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      label: 'Community Rated',
      date: booking.reviewedAt,
      completed: !!booking.reviewedAt,
      icon: Star,
      color: 'text-gold'
    }
  ];

  const formatDate = (ts: any) => {
    if (!ts) return 'Upcoming';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return format(date, 'MMM d, p');
  };

  return (
    <div className="space-y-6">
      <SectionLabel className="mb-0">ENGAGEMENT TIMELINE</SectionLabel>
      <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {steps.map((step, i) => (
          <div key={i} className={cn("relative flex items-start gap-4 transition-all duration-500", !step.completed && "opacity-20 grayscale")}>
            <div className={cn(
              "absolute left-[-26px] top-0 w-[22px] h-[22px] rounded-full flex items-center justify-center border bg-black z-10",
              step.completed ? `border-${step.color.split('-')[1]} bg-${step.color.split('-')[1]}/10` : "border-white/10"
            )}>
              <step.icon size={10} className={step.completed ? step.color : "text-muted"} />
            </div>
            <div className="space-y-1">
              <p className="text-[0.65rem] font-bold text-white uppercase tracking-widest">{step.label}</p>
              <p className="text-[0.6rem] text-muted font-mono uppercase">{formatDate(step.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
