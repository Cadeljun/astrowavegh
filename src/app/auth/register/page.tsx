'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Sparkles, UserPlus, Zap, Rocket } from 'lucide-react';
import { 
  getOrCreatePlatformUser,
  updateLastLogin
} from '@/lib/firebase/platformAuth';
import Link from 'next/link';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { 
    user, loading,
    signInWithGoogle, 
    error, clearError
  } = useAuth();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      handlePostLogin();
    }
  }, [user, loading]);

  const handlePostLogin = async () => {
    setProcessing(true);
    try {
      const result = await getOrCreatePlatformUser(
        user!.uid,
        user!.email || '',
        user!.displayName || '',
        user!.photoURL || '',
        'google'
      );

      await updateLastLogin(user!.uid);

      if (result.isNew || !result.onboarded) {
        router.replace('/auth/onboarding');
      } else {
        router.replace(result.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard');
      }
    } catch {
      setProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigning(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      setSigning(false);
    }
  };

  const isLoading = loading || signing || processing;

  if (loading && !user) return null;

  return (
    <div style={{
      background: 'rgba(12,30,53,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid #142440',
      borderTop: '3px solid #0EA5E9',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .google-btn:hover:not(:disabled) {
          background: #fff !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(14,165,233,0.2) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '16px',
          background: 'rgba(14,165,233,0.08)',
          border: '1px solid rgba(14,165,233,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Rocket size={28} color="#0EA5E9" />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase'
        }}>Create Account</h1>
        <p style={{ color: '#8BA4BE', fontSize: '0.9rem', marginTop: '4px' }}>Join the next-gen creative ecosystem</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Verified professional profile', icon: Sparkles },
          { label: 'Intelligent AI match engine', icon: Zap },
          { label: 'Secure engagement protocol', icon: Rocket }
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', color: '#8BA4BE' }}>
            <item.icon size={14} color="#0EA5E9" />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', marginBottom: '20px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Action */}
      <button
        className="google-btn"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '16px',
          background: '#F0F8FF',
          border: 'none',
          borderRadius: '12px',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#020B18',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'all 0.2s ease',
          marginBottom: '24px'
        }}
      >
        {isLoading ? (
          <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #020B18', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <>
            <GoogleIcon />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sign up with Google</span>
          </>
        )}
      </button>

      <div style={{ height: '1px', background: '#142440', marginBottom: '24px' }} />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#8BA4BE' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: '#0EA5E9', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
      </p>
    </div>
  );
}
