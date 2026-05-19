'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Music, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'ORGANIZER' | 'TALENT' | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkExistingProfile() {
      if (!user) {
        if (!authLoading) router.replace('/auth/login');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.onboarded) {
            // Already onboarded, send to correct dashboard
            const dest = data.role === 'ORGANIZER' ? '/organizer/dashboard' : '/talent/dashboard';
            router.replace(dest);
            return;
          }
          if (data.role && data.role !== 'PENDING') {
            setSelectedRole(data.role as any);
          }
        } else {
          // Initialize user doc if missing (e.g. first Google sign in)
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            role: 'PENDING',
            onboarded: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Onboarding check failed:', err);
      } finally {
        setChecking(false);
      }
    }

    checkExistingProfile();
  }, [user, authLoading, router]);

  const handleFinishOnboarding = async () => {
    if (!selectedRole || !user) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: selectedRole,
        onboarded: true,
        updatedAt: serverTimestamp()
      });

      // If Talent, initialize talent profile
      if (selectedRole === 'TALENT') {
        const talentRef = doc(db, 'talent_profiles', user.uid);
        const talentSnap = await getDoc(talentRef);
        if (!talentSnap.exists()) {
          await setDoc(talentRef, {
            userId: user.uid,
            name: user.displayName || '',
            stageName: '',
            role: 'Artist',
            bio: '',
            active: true,
            createdAt: serverTimestamp()
          });
        }
      }

      toast({ title: "Welcome to AstroWave!", description: "Redirecting to your dashboard..." });
      
      const destination = selectedRole === 'ORGANIZER' ? '/organizer/dashboard' : '/talent/dashboard';
      router.replace(destination);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checking) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, #FFD166, transparent 70%)' }} />
      
      <div className="max-w-3xl w-full space-y-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 border border-gold/20 mb-4">
             <Sparkles className="text-gold" size={24} />
          </div>
          <h1 className="display-xl text-white tracking-tighter">CHOOSE YOUR PATH.</h1>
          <p className="body-lg text-muted max-w-lg mx-auto">Select how you'll engage with the AstroWave creative ecosystem.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            className={`p-10 cursor-pointer transition-all duration-500 relative group ${selectedRole === 'ORGANIZER' ? 'border-gold ring-1 ring-gold/40 scale-105 bg-gold/[0.03]' : 'border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
            onClick={() => setSelectedRole('ORGANIZER')}
            glowColor="gold"
          >
            <div className="flex flex-col items-center gap-6">
              <div className={`p-6 rounded-full transition-all duration-500 ${selectedRole === 'ORGANIZER' ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,209,102,0.4)]' : 'bg-white/5 text-muted'}`}>
                <Users size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-3xl text-white uppercase tracking-widest">ORGANIZER</h3>
                <p className="text-[0.7rem] text-muted font-bold uppercase tracking-[0.2em] leading-relaxed">I host events and seek world-class talent to elevate my vision.</p>
              </div>
            </div>
            {selectedRole === 'ORGANIZER' && <div className="absolute -top-3 -right-3 bg-gold text-black p-1 rounded-full"><ChevronRight size={16} /></div>}
          </Card>

          <Card 
            className={`p-10 cursor-pointer transition-all duration-500 relative group ${selectedRole === 'TALENT' ? 'border-purple ring-1 ring-purple/40 scale-105 bg-purple/[0.03]' : 'border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
            onClick={() => setSelectedRole('TALENT')}
            glowColor="purple"
          >
            <div className="flex flex-col items-center gap-6">
              <div className={`p-6 rounded-full transition-all duration-500 ${selectedRole === 'TALENT' ? 'bg-purple text-white shadow-[0_0_30_rgba(168,85,247,0.4)]' : 'bg-white/5 text-muted'}`}>
                <Music size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-3xl text-white uppercase tracking-widest">TALENT</h3>
                <p className="text-[0.7rem] text-muted font-bold uppercase tracking-[0.2em] leading-relaxed">I am an artist or DJ looking to grow my bookings and legacy.</p>
              </div>
            </div>
            {selectedRole === 'TALENT' && <div className="absolute -top-3 -right-3 bg-purple text-white p-1 rounded-full"><ChevronRight size={16} /></div>}
          </Card>
        </div>

        <motion.div 
          animate={{ opacity: selectedRole ? 1 : 0, y: selectedRole ? 0 : 20 }}
          className="pt-8"
        >
          <Button 
            disabled={!selectedRole || loading} 
            size="lg" 
            className="px-20 h-16 text-lg font-bold tracking-[0.3em]"
            onClick={handleFinishOnboarding}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>INITIALIZE HUB <ChevronRight className="ml-2" size={20} /></>}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
