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
import Logo from '@/components/ui/Logo';

export default function AdminLoginPage() {
  const { login, error, isAdmin, loading: authLoading, clearError } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

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
        <Loader2 className="animate-spin text-green" size={48} />
        <p className="label text-green tracking-[0.4em] animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020B18] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05]"
          style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #00FF87, transparent 70%)` }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 w-full max-w-[440px]"
      >
        <div className="glass border-t-2 border-t-green p-10 md:p-12 shadow-2xl backdrop-blur-3xl bg-white/[0.01]">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center p-3 rounded-full bg-green/5 border border-green/20 mb-6"
            >
              <Sparkles className="text-green" size={24} />
            </motion.div>
            <Logo height={44} className="mx-auto" />
            <div className="flex items-center justify-center gap-2 text-[#6B8CAE] uppercase tracking-[0.3em] text-[0.6rem] font-bold mt-4">
              <Lock size={12} className="text-green" />
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
                className="admin-input h-14 bg-white/5 border-white/10 focus:border-green"
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
                  className="admin-input h-14 bg-white/5 border-white/10 focus:border-green pr-14"
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
                  className={`border rounded-sm p-4 flex gap-4 ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green/10 border-green/20 text-green'}`}
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed uppercase tracking-wider">{error || setupMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isSubmitting || isSettingUp}
              className="w-full h-16 text-sm font-bold tracking-[0.3em] uppercase border-green text-green hover:bg-green hover:text-black"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                'Initialize Session'
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5">
            <button
              onClick={handleInitialSetup}
              disabled={isSubmitting || isSettingUp}
              className="w-full flex items-center justify-center gap-3 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-muted hover:text-green transition-all disabled:opacity-30"
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
