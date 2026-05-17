'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/firebase';

export default function AdminLoginPage() {
  const { login, error, isAdmin, loading: authLoading, clearError } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      // Error handled by AuthContext and displayed via state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitialSetup = async () => {
    if (typeof window === 'undefined' || !firebaseAuth) {
      setSetupMessage('Setup not available during pre-render.');
      return;
    }

    if (!window.confirm('Create the initial admin account (junioraquils143@gmail.com)?')) return;
    
    setIsSettingUp(true);
    setSetupMessage(null);
    
    try {
      // 1. Create the user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        firebaseAuth, 
        'junioraquils143@gmail.com', 
        'AstroWave2025!'
      );
      
      // 2. Create the role document in Firestore
      await setDoc(doc(db, 'user_roles', userCred.user.uid), {
        uid: userCred.user.uid,
        email: 'junioraquils143@gmail.com',
        name: 'Developer Admin',
        role: 'SUPER_ADMIN',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null
      });

      setSetupMessage('Admin account created! You can now sign in.');
      setEmail('junioraquils143@gmail.com');
      setPassword('AstroWave2025!');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setSetupMessage('Account already exists. Try signing in.');
        setEmail('junioraquils143@gmail.com');
      } else {
        setSetupMessage(`Setup failed: ${err.message}`);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.08]"
          style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #FFD166, transparent 70%)` }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-[420px]"
      >
        <div className="glass border-t-2 border-t-gold p-10 shadow-2xl backdrop-blur-2xl bg-white/[0.02]">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-gold tracking-widest text-glow-gold mb-2">
              ASTROWAVE
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted uppercase tracking-[0.2em] text-[0.65rem] font-bold">
              <Lock size={12} />
              Admin Portal
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label m-0 text-[0.65rem]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                onFocus={clearError}
                placeholder="admin@astrowave.live"
                className="admin-input h-12 bg-white/5 border-white/10 focus:border-gold"
              />
            </div>

            <div className="space-y-2">
              <label className="admin-label m-0 text-[0.65rem]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  onFocus={clearError}
                  placeholder="••••••••"
                  className="admin-input h-12 bg-white/5 border-white/10 focus:border-gold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {(error || setupMessage) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border rounded-sm p-4 flex gap-3 ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gold/10 border-gold/20 text-gold'}`}
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{error || setupMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isSubmitting || isSettingUp}
              className="w-full h-14 text-sm font-bold tracking-widest"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                'SIGN IN TO HORIZON'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <button
              onClick={handleInitialSetup}
              disabled={isSubmitting || isSettingUp}
              className="w-full flex items-center justify-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted hover:text-gold transition-colors disabled:opacity-40"
            >
              {isSettingUp ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
              Initial Admin Setup (Dev Only)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
