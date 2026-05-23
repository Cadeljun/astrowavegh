'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
      <div className="min-h-screen bg-[#020B18] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 rounded-full border-2 border-green/20 border-t-green animate-spin shadow-[0_0_20px_rgba(0,255,135,0.2)]" />
        <p className="font-body text-xs text-green/60 tracking-[0.4em] uppercase font-bold animate-pulse">
          Authorising Link...
        </p>
      </div>
    );
  }

  if (!user || needsOnboarding) return null;
  
  return <>{children}</>;
}
