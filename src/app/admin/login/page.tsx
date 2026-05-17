'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const { login, error, isAdmin, loading: authLoading, clearError } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Error handled by AuthContext and displayed below
    } finally {
      setIsSubmitting(false);
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
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #FFD166, transparent 70%)`
          }}
        />
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
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
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 flex gap-3 text-red-400"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-sm font-bold tracking-widest"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                'SIGN IN TO HORIZON'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-muted text-[0.6rem] uppercase tracking-[0.3em] opacity-40">
          AstroWave Ghana &copy; 2025 • Internal Access Only
        </p>
      </motion.div>
    </div>
  );
}
