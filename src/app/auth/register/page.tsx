'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const { register, signInWithGoogle, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return strength;
  }, [formData.password]);

  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be 8+ characters';
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-8 md:p-10 border-t-2 border-t-gold">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white tracking-widest uppercase mb-1">Create Your Account</h1>
          <p className="text-xs text-muted uppercase tracking-widest">Join the AstroWave platform</p>
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
              <label className="admin-label">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  className={cn("admin-input pl-12 h-12", formErrors.name && "border-red-500/50")} 
                  placeholder="Kojo Mensah" 
                  value={formData.name} 
                  onChange={e => { setFormData({...formData, name: e.target.value}); if(formErrors.name) setFormErrors({...formErrors, name: ''}); }} 
                />
              </div>
              {formErrors.name && <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider pl-1">{formErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="admin-label">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  className={cn("admin-input pl-12 h-12", formErrors.email && "border-red-500/50")} 
                  placeholder="kojo@astrowave.live" 
                  value={formData.email} 
                  onChange={e => { setFormData({...formData, email: e.target.value}); if(formErrors.email) setFormErrors({...formErrors, email: ''}); }} 
                />
              </div>
              {formErrors.email && <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider pl-1">{formErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="admin-label">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className={cn("admin-input pl-12 h-12 pr-12", formErrors.password && "border-red-500/50")} 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={e => { setFormData({...formData, password: e.target.value}); if(formErrors.password) setFormErrors({...formErrors, password: ''}); }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength Meter */}
              <div className="flex gap-1.5 mt-2 px-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i <= passwordStrength ? strengthColors[passwordStrength] : "bg-white/5")} />
                ))}
              </div>
              {formErrors.password && <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider pl-1">{formErrors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="admin-label">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  className={cn("admin-input pl-12 h-12", formErrors.confirmPassword && "border-red-500/50")} 
                  placeholder="••••••••" 
                  value={formData.confirmPassword} 
                  onChange={e => { setFormData({...formData, confirmPassword: e.target.value}); if(formErrors.confirmPassword) setFormErrors({...formErrors, confirmPassword: ''}); }} 
                />
              </div>
              {formErrors.confirmPassword && <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider pl-1">{formErrors.confirmPassword}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 flex gap-4 text-red-400">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-[0.65rem] font-bold leading-relaxed uppercase tracking-wider">{error}</p>
              </div>
            )}

            <Button disabled={loading} type="submit" className="w-full h-14 font-bold tracking-widest">
              {loading ? <Loader2 className="animate-spin" /> : 'CREATE ACCOUNT'}
            </Button>
          </form>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-muted uppercase mb-2 tracking-widest">Already have an account?</p>
          <Link href="/auth/login" className="text-gold font-bold text-xs hover:underline flex items-center justify-center gap-2">
            SIGN IN <ArrowRight size={14} />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
