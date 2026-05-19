'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowLeft, Chrome } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Divider } from '@/components/ui/Divider';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const roleHint = searchParams.get('role')?.toUpperCase() || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Initialize basic user profile
      const userRef = doc(db, 'users', userCred.user.uid);
      await setDoc(userRef, {
        uid: userCred.user.uid,
        email: formData.email,
        name: formData.name,
        role: roleHint || 'PENDING',
        onboarded: !!roleHint,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Account Created" });
      
      if (roleHint) {
        router.push(roleHint === 'ORGANIZER' ? '/organizer/dashboard' : '/talent/dashboard');
      } else {
        router.push('/auth/onboarding');
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Authorized via Google" });
      
      // Check if user profile already exists
      // If not, we'll need onboarding
      router.push('/auth/onboarding');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="p-10 border-t-2 border-t-purple">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-2">JOIN THE WAVE</h1>
            <p className="text-xs text-muted uppercase tracking-widest">
              {roleHint ? `REGISTER AS ${roleHint}` : 'Platform Registration'}
            </p>
          </div>

          <div className="space-y-6">
            <Button 
              variant="secondary" 
              className="w-full h-14 border-white/10 text-white font-bold tracking-widest"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <Chrome className="mr-2" size={18} /> REGISTER WITH GOOGLE
            </Button>

            <div className="relative flex items-center justify-center">
              <Divider className="w-full opacity-10" />
              <span className="absolute bg-[#16161F] px-4 text-[0.6rem] text-muted font-bold tracking-[0.3em] uppercase">OR EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="admin-label">FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input required type="text" className="admin-input pl-12 h-14" placeholder="Kojo Mensah" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input required type="email" className="admin-input pl-12 h-14" placeholder="kojo@astrowave.live" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input required type="password" minLength={8} className="admin-input pl-12 h-14" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <Button disabled={loading} type="submit" className="w-full h-16 font-bold tracking-widest border-purple text-purple hover:bg-purple">
                {loading ? <Loader2 className="animate-spin" /> : 'CREATE ACCOUNT'}
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <Link href="/auth/login" className="text-muted font-bold text-xs hover:text-white flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> ALREADY HAVE AN ACCOUNT? SIGN IN
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
