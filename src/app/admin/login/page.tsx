'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/firebase';

/**
 * AstroWave Admin Login
 * The primary entry point for site administrators and editors.
 */
export default function AdminLoginPage() {
  const { login, error, isAdmin, loading: authLoading, clearError } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  // Automatic redirect if session is already active
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
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Developer Shortcut: Provisions the initial SUPER_ADMIN account
   */
  const handleInitialSetup = async () => {
    if (typeof window === 'undefined' || !firebaseAuth) return;

    if (!window.confirm('Initialize Horizon Admin (junioraquils143@gmail.com)?')) return;
    
    setIsSettingUp(true);
    setSetupMessage(null);
    
    try {
      const userCred = await createUserWithEmailAndPassword(
        firebaseAuth, 
        'junioraquils143@gmail.com', 
        'AstroWave2025!'
      );
      
      await setDoc(doc(db, 'user_roles', userCred.user.uid), {
        uid: userCred.user.uid,
        email: 'junioraquils143@gmail.com',
        name: 'Lead Developer',
        role: 'SUPER_ADMIN',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null
      });

      setSetupMessage('Admin provisioned successfully! You can now sign in.');
      setEmail('junioraquils143@gmail.com');
      setPassword('AstroWave2025!');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setSetupMessage('Account exists. Proceed with sign in.');
        setEmail('junioraquils143@gmail.com');
      } else {
        setSetupMessage(`Setup Failed: ${err.message}`);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p className="label text-gold tracking-[0.4em] animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.06]"
          style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #FFD166, transparent 70%)` }}
        />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 w-full max-w-[440px]"
      >
        <div className="glass border-t-2 border-t-gold p-10 md:p-12 shadow-2xl backdrop-blur-3xl bg-white/[0.01]">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center p-3 rounded-full bg-gold/5 border border-gold/20 mb-6"
            >
              <Sparkles className="text-gold" size={24} />
            </motion.div>
            <h1 className="font-display text-4xl text-white tracking-widest text-glow-gold mb-2 uppercase">
              ASTROWAVE
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted uppercase tracking-[0.3em] text-[0.6rem] font-bold">
              <Lock size={12} className="text-gold" />
              Horizon Portal
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label m-0 text-[0.6rem] tracking-[0.2em]">IDENTITY</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                onFocus={clearError}
                placeholder="admin@astrowave.live"
                className="admin-input h-14 bg-white/5 border-white/10 focus:border-gold"
              />
            </div>

            <div className="space-y-2">
              <label className="admin-label m-0 text-[0.6rem] tracking-[0.2em]">ACCESS KEY</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  onFocus={clearError}
                  placeholder="••••••••"
                  className="admin-input h-14 bg-white/5 border-white/10 focus:border-gold pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(error || setupMessage) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`border rounded-sm p-4 flex gap-4 ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gold/10 border-gold/20 text-gold'}`}
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed uppercase tracking-wider">{error || setupMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isSubmitting || isSettingUp}
              className="w-full h-16 text-sm font-bold tracking-[0.3em] uppercase"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                'Initialize Session'
              )}
            </Button>
          </form>

          {/* Dev Bypass Utility */}
          <div className="mt-10 pt-10 border-t border-white/5">
            <button
              onClick={handleInitialSetup}
              disabled={isSubmitting || isSettingUp}
              className="w-full flex items-center justify-center gap-3 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-muted hover:text-gold transition-all disabled:opacity-30"
            >
              {isSettingUp ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
              System Bootstrap (Lead Dev)
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[0.5rem] text-muted/30 uppercase tracking-[0.4em]">
          &copy; 2025 ASTROWAVE GHANA // PROTECTED RESOURCE
        </p>
      </motion.div>
    </div>
  );
}
