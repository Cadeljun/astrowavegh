'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventForm from '@/components/admin/EventForm';

export default function NewEventPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <Link 
          href="/admin/events" 
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <div className="admin-page-header m-0">
          <h1 className="admin-page-title">Add New Event</h1>
          <p className="admin-page-subtitle">Create a new experience for the AstroWave community.</p>
        </div>
      </div>

      <EventForm />
    </div>
  );
}
