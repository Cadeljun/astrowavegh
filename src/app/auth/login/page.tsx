'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, Waves, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle, error } = useAuth();
  const router = useRouter();
  const [signing, setSigning] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/auth/onboarding');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setSigning(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigning(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(4,16,32,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(14,165,233,0.15)',
          borderTop: '3px solid #00FF87'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'rgba(0,255,135,0.08)',
              border: '1px solid rgba(0,255,135,0.2)'
            }}
          >
            <Waves size={26} style={{ color: '#00FF87' }} />
          </div>

          <h1
            className="font-display text-3xl uppercase mb-2"
            style={{ color: '#F0F8FF', letterSpacing: '0.05em' }}
          >
            Welcome Back
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B8CAE' }}>
            Sign in to your AstroWave account
          </p>
        </div>

        {/* Access the platform */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.12)'
          }}
        >
          <p
            className="font-body text-[10px] text-center mb-3 font-bold uppercase tracking-widest"
            style={{ color: '#6B8CAE' }}
          >
            AstroWave Platform Access
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { emoji: '🎵', label: 'Find Talent' },
              { emoji: '📅', label: 'Post Events' },
              { emoji: '⭐', label: 'Wave Score' },
              { emoji: '📊', label: 'Analytics' }
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-mono text-[9px] font-bold uppercase" style={{ color: '#6B8CAE' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p className="font-body text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signing}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-body font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: signing ? 'rgba(255,255,255,0.05)' : '#F0F8FF',
            color: '#020B18',
            border: '1px solid transparent'
          }}
        >
          {signing ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#020B18', borderTopColor: 'transparent' }}
              />
              <span className="uppercase tracking-widest">Signing in...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span className="uppercase tracking-widest">Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-center font-body text-xs mt-6 leading-relaxed" style={{ color: '#6B8CAE' }}>
          New to AstroWave?{' '}
          <Link href="/auth/register" className="text-[#00FF87] font-bold hover:underline">
            Create account →
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center font-body text-[10px] mt-4 opacity-50 uppercase tracking-tighter" style={{ color: '#6B8CAE' }}>
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline hover:text-[#00FF87] transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-[#00FF87] transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>

      <div className="text-center">
        <Link href="/" className="font-body text-xs transition-colors hover:text-[#00FF87] font-bold uppercase tracking-widest" style={{ color: '#6B8CAE' }}>
          ← Back to AstroWave
        </Link>
      </div>
    </div>
  );
}
