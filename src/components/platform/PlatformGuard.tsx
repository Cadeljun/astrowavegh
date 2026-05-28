'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface PlatformGuardProps {
  children: React.ReactNode;
  requiredRole?: 'organizer' | 'talent';
}

/**
 * Higher Order Component that protects platform routes.
 * Checks for authentication, onboarding status, and role validity.
 */
export default function PlatformGuard({
  children,
  requiredRole
}: PlatformGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      setChecking(false);
      return;
    }

    const verifyAccess = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        
        if (!snap.exists() || !snap.data().onboarded) {
          router.replace('/auth/onboarding');
          return;
        }

        const data = snap.data();

        if (requiredRole) {
          const hasRole = data.role === requiredRole || data.role === 'both';
          
          if (!hasRole) {
            // Send user to their designated dashboard if they hit the wrong area
            router.replace(data.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard');
            return;
          }
        }

        setAllowed(true);
      } catch (err) {
        console.error("Access verification error:", err);
        router.replace('/auth/login');
      } finally {
        setChecking(false);
      }
    };

    verifyAccess();
  }, [user, loading, requiredRole, router]);

  if (loading || checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#020B18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(0,255,135,0.1)',
          borderTopColor: '#00FF87',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          color: '#00FF87',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          opacity: 0.6
        }}>Verifying Access Protocol...</p>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
