'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import TalentForm from '@/components/admin/TalentForm';

export default function EditTalentPage() {
  const params = useParams();
  const id = params.id as string;
  const db = useFirestore();

  const talentRef = useMemoFirebase(() => {
    return doc(db, 'talent', id);
  }, [db, id]);

  const { data: talent, loading } = useDoc(talentRef);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-gold" size={32} /></div>;

  if (!talent) return <div className="text-center py-20 space-y-4"><h2 className="display-md text-white">Talent Not Found</h2><Link href="/admin/talent" className="text-gold hover:underline">Back to Talent</Link></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <Link href="/admin/talent" className="inline-flex items-center gap-2 text-xs text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold">
          <ArrowLeft size={14} /> Back to Talent
        </Link>
        <div className="admin-page-header m-0">
          <h1 className="admin-page-title">Edit Talent</h1>
          <p className="admin-page-subtitle">Updating profile for: <span className="text-white">{talent.name}</span></p>
        </div>
      </div>
      <TalentForm initialData={talent} id={id} />
    </div>
  );
}