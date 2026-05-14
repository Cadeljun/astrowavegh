'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminLoadingSpinner from './AdminLoadingSpinner';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) return <AdminLoadingSpinner />;
  if (!isAdmin) return null;
  
  return <>{children}</>;
}
