'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Chrome } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Divider } from '@/components/ui/Divider';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleRedirect = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (!data.onboarded) {
        router.push('/auth/onboarding');
      } else {
        router.push(data.role === 'ORGANIZER' ? '/organizer/dashboard' : '/talent/dashboard');
      }
    } else {
      router.push('/auth/onboarding');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "Welcome Back" });
      await handleRedirect(userCred.user.uid);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Authorized via Google" });
      // Redirect handled by onboarding logic or profile check
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
        <Card className="p-10 border-t-2 border-t-gold">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-2">SIGN IN</h1>
            <p className="text-xs text-muted uppercase tracking-widest">AstroWave Ecosystem Access</p>
          </div>

          <div className="space-y-6">
            <Button 
              variant="secondary" 
              className="w-full h-14 border-white/10 text-white font-bold tracking-widest"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <Chrome className="mr-2" size={18} /> CONTINUE WITH GOOGLE
            </Button>

            <div className="relative flex items-center justify-center">
              <Divider className="w-full opacity-10" />
              <span className="absolute bg-[#16161F] px-4 text-[0.6rem] text-muted font-bold tracking-[0.3em] uppercase">OR EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="admin-label">EMAIL IDENTITY</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input required type="email" className="admin-input pl-12 h-14" placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">ACCESS KEY</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input required type="password" className="admin-input pl-12 h-14" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <Button disabled={loading} type="submit" className="w-full h-16 font-bold tracking-widest">
                {loading ? <Loader2 className="animate-spin" /> : 'INITIALIZE LINK'}
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-muted uppercase mb-4 tracking-widest">No clearance?</p>
            <Link href="/auth/register" className="text-gold font-bold text-xs hover:underline flex items-center justify-center gap-2">
              CREATE PLATFORM ACCOUNT <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
