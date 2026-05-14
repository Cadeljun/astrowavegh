'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import EventForm from '@/components/admin/EventForm';

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const db = useFirestore();
  const { data: event, loading } = useDoc(doc(db, 'events', id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="display-md text-white">Event Not Found</h2>
        <p className="text-muted">The event you are trying to edit doesn't exist.</p>
        <Link href="/admin/events" className="text-gold hover:underline">Back to Events</Link>
      </div>
    );
  }

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
          <h1 className="admin-page-title">Edit Event</h1>
          <p className="admin-page-subtitle">Updating: <span className="text-white">{event.name}</span></p>
        </div>
      </div>

      <EventForm initialData={event} id={id} />
    </div>
  );
}
