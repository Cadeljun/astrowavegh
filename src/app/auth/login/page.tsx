'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { login, signInWithGoogle, resetPassword, error, clearError } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({ variant: 'destructive', title: 'Email Required', description: 'Enter your email to reset password.' });
      return;
    }
    try {
      await resetPassword(formData.email);
      setResetSent(true);
      toast({ title: 'Reset Email Sent', description: 'Check your inbox for instructions.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Reset Failed', description: err.message });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-8 md:p-10 border-t-2 border-t-gold">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white tracking-widest uppercase mb-1">Welcome Back</h1>
          <p className="text-xs text-muted uppercase tracking-widest">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <Button 
            variant="secondary" 
            className="w-full h-14 border-white/10 text-white font-bold tracking-widest bg-white/5 hover:bg-white/10"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            CONTINUE WITH GOOGLE
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full h-px bg-white/5" />
            <span className="absolute bg-[#16161F] px-4 text-[0.6rem] text-muted font-bold tracking-[0.3em] uppercase">or</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="admin-label">EMAIL IDENTITY</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  required 
                  type="email" 
                  className="admin-input pl-12 h-13" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={e => {setFormData({...formData, email: e.target.value}); clearError();}} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="admin-label m-0">ACCESS KEY</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] text-gold font-bold uppercase hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  className="admin-input pl-12 h-13 pr-12" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={e => {setFormData({...formData, password: e.target.value}); clearError();}} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 flex gap-4 text-red-400">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-[0.65rem] font-bold leading-relaxed uppercase tracking-wider">{error}</p>
              </div>
            )}

            {resetSent && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-sm p-4 text-green-400 text-[0.65rem] font-bold uppercase tracking-wider">
                Reset instructions sent to your email.
              </div>
            )}

            <Button disabled={loading} type="submit" className="w-full h-14 font-bold tracking-widest">
              {loading ? <Loader2 className="animate-spin" /> : 'INITIALIZE LINK'}
            </Button>
          </form>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-muted uppercase mb-2 tracking-widest">Don't have an account?</p>
          <Link href="/auth/register" className="text-gold font-bold text-xs hover:underline flex items-center justify-center gap-2">
            CREATE ONE <ArrowRight size={14} />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
