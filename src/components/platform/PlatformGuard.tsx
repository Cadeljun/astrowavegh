'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface PlatformGuardProps {
  children: React.ReactNode;
  requiredRole?: 'organizer' | 'talent';
}

export default function PlatformGuard({
  children,
  requiredRole
}: PlatformGuardProps) {
  const { 
    user, 
    loading,
    platformUser,
    platformLoading,
    needsOnboarding
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || platformLoading) return;
    
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    
    if (needsOnboarding) {
      router.replace('/auth/onboarding');
      return;
    }

    if (requiredRole && platformUser) {
      const hasRole = 
        platformUser.role === requiredRole ||
        platformUser.role === 'both';
      
      if (!hasRole) {
        router.replace(
          platformUser.role === 'organizer'
            ? '/organizer/dashboard'
            : '/talent/dashboard'
        );
      }
    }
  }, [
    user, loading, platformUser,
    platformLoading, needsOnboarding,
    requiredRole, router
  ]);

  if (loading || platformLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
          <p className="font-body text-sm text-[#7B7B9A] tracking-widest uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user || needsOnboarding) return null;
  
  return <>{children}</>;
}
