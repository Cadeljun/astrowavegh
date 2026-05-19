
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Music, ChevronRight, Loader2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'ORGANIZER' | 'TALENT' | null>(null);
  const [loading, setLoading] = useState(false);

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

      toast({ title: "Welcome to AstroWave!", description: "Redirecting to your dashboard..." });
      
      const destination = selectedRole === 'ORGANIZER' ? '/organizer/dashboard' : '/talent/dashboard';
      router.replace(destination);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="display-xl text-white">CHOOSE YOUR PATH.</h1>
          <p className="body-lg text-muted">Select how you'll use the AstroWave platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            className={`p-10 cursor-pointer transition-all ${selectedRole === 'ORGANIZER' ? 'border-gold ring-2 ring-gold/20 scale-105' : 'border-white/5 opacity-50 hover:opacity-80'}`}
            onClick={() => setSelectedRole('ORGANIZER')}
            glowColor="gold"
          >
            <div className="flex flex-col items-center gap-6">
              <div className={`p-6 rounded-full ${selectedRole === 'ORGANIZER' ? 'bg-gold text-black' : 'bg-white/5 text-muted'}`}>
                <Users size={40} />
              </div>
              <h3 className="font-display text-2xl text-white">ORGANIZER</h3>
              <p className="text-xs text-muted leading-relaxed">I host events and want to find world-class talent.</p>
            </div>
          </Card>

          <Card 
            className={`p-10 cursor-pointer transition-all ${selectedRole === 'TALENT' ? 'border-purple ring-2 ring-purple/20 scale-105' : 'border-white/5 opacity-50 hover:opacity-80'}`}
            onClick={() => setSelectedRole('TALENT')}
            glowColor="purple"
          >
            <div className="flex flex-col items-center gap-6">
              <div className={`p-6 rounded-full ${selectedRole === 'TALENT' ? 'bg-purple text-white' : 'bg-white/5 text-muted'}`}>
                <Music size={40} />
              </div>
              <h3 className="font-display text-2xl text-white">TALENT</h3>
              <p className="text-xs text-muted leading-relaxed">I am an artist/DJ looking to grow my career and bookings.</p>
            </div>
          </Card>
        </div>

        <motion.div 
          animate={{ opacity: selectedRole ? 1 : 0 }}
          className="pt-8"
        >
          <Button 
            disabled={!selectedRole || loading} 
            size="lg" 
            className="px-20 h-16 text-lg"
            onClick={handleFinishOnboarding}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>LET'S GO <ChevronRight className="ml-2" /></>}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
