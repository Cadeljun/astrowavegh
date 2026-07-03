'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Zap, Calendar, Star, Waves } from 'lucide-react';
import { getOrCreatePlatformUser, updateLastLogin } from '@/lib/firebase/platformAuth';
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

export default function LoginPage() {
  const { user, loading, signInWithGoogle, error, clearError } = useAuth();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && user) handlePostLogin();
  }, [user, loading]);

  const handlePostLogin = async () => {
    if (!user || processing) return;
    setProcessing(true);
    try {
      await getOrCreatePlatformUser(user);
      await updateLastLogin(user.uid);
    } catch {}
    router.push('/organizer/dashboard');
  };

  const handleGoogle = async () => {
    clearError?.();
    setSigning(true);
    try { await signInWithGoogle(); }
    catch {}
    finally { setSigning(false); }
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0B1F14] p-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(0,200,83,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.10) 0%, transparent 55%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-[0.6rem] font-bold text-[#00C853] uppercase tracking-[0.3em]">AstroWave Platform</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl text-white uppercase leading-tight">
            WELCOME<br />
            <span className="text-[#00C853]">BACK.</span>
          </h1>
          <p className="text-white/40 text-sm mt-6 leading-relaxed max-w-xs">
            Sign in to access your dashboard, manage bookings and connect with Ghana's top creative talent.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: Zap,      text: 'Wave Score Matching',  color: '#00C853' },
            { icon: Calendar, text: 'Real-Time Bookings',   color: '#0EA5E9' },
            { icon: Star,     text: 'Verified Talent Pool', color: '#00C853' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span className="text-sm text-white/50">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="font-display text-4xl text-[#0B1F14] uppercase">SIGN IN</h2>
            <p className="text-[#567060] text-sm mt-2">Continue to your AstroWave account</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button onClick={handleGoogle} disabled={signing || processing}
            className="w-full h-14 flex items-center justify-center gap-3 rounded-xl border-2 border-[#C8E6D4] bg-white text-[#0B1F14] font-bold text-sm hover:border-[#00C853] hover:shadow-glow-green transition-all disabled:opacity-50">
            {signing || processing ? (
              <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
            ) : <GoogleIcon />}
            {signing ? 'Signing in…' : processing ? 'Setting up…' : 'Continue with Google'}
          </button>

          <p className="text-center text-sm text-[#567060]">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#00C853] font-bold hover:text-[#007A33] transition-colors">
              Create one free
            </Link>
          </p>

          <p className="text-center text-[0.65rem] text-[#567060]/50 leading-relaxed">
            By continuing you agree to our{' '}
            <Link href="/legal/terms-of-service" className="hover:text-[#00C853] transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy-policy" className="hover:text-[#00C853] transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
