'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TalentForm from '@/components/admin/TalentForm';

export default function NewTalentPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <Link href="/admin/talent" className="inline-flex items-center gap-2 text-xs text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold">
          <ArrowLeft size={14} /> Back to Talent
        </Link>
        <div className="admin-page-header m-0">
          <h1 className="admin-page-title">Add Talent</h1>
          <p className="admin-page-subtitle">Add a new DJ or artist to the AstroWave roster.</p>
        </div>
      </div>
      <TalentForm />
    </div>
  );
}
