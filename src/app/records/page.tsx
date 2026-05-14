'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, ArrowLeft, Loader2, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/Button';
import { fadeUp, fadeIn, scaleIn } from '@/lib/animations';

export default function RecordsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const division = 'records';

    addDoc(collection(db, 'waitlist'), {
      email,
      division,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        toast({
          title: "You're on the list!",
          description: "Stay tuned for the frequency shift.",
        });
        setEmail('');
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'waitlist',
          operation: 'create',
          requestResourceData: { email, division },
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[var(--color-black)] px-6">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(255, 209, 102, 0.08), transparent 70%)' 
        }} 
      />

      {/* Faint Background Text */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
        <span className="font-display text-[15rem] text-white opacity-[0.02] leading-none tracking-tighter">
          RECORDS
        </span>
      </div>

      {/* Floating Music Notes */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[25%] text-[var(--color-gold)] opacity-15 hidden md:block"
      >
        <Music size={48} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[15%] bottom-[25%] text-[var(--color-gold)] opacity-15 hidden md:block"
      >
        <Music size={32} />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl space-y-8">
        {/* Vinyl Animation */}
        <motion.div 
          variants={scaleIn}
          initial="hidden"
          animate="show"
          className="relative group"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.05 }}
            className="w-48 h-48 md:w-64 md:h-64 rounded-full border-[12px] border-[#111] shadow-[0_0_30px_rgba(255,209,102,0.1)] flex items-center justify-center relative cursor-pointer overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" />
            {/* Groove Rings */}
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-12 rounded-full border border-white/5" />
            {/* Center Hub */}
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#050505] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[var(--color-gold)] shadow-[0_0_10px_var(--color-gold)]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Text Stack */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="space-y-4">
          <div className="label text-[var(--color-gold)] tracking-[0.4em] text-glow-gold flex items-center justify-center gap-3">
             <span className="h-[1px] w-6 bg-[var(--color-gold)] opacity-30"></span>
             ASTROWAVE RECORDS
             <span className="h-[1px] w-6 bg-[var(--color-gold)] opacity-30"></span>
          </div>
          <h1 className="display-xl text-white text-glow-gold leading-[0.85]">
            COMING<br />SOON.
          </h1>
          <p className="body-lg text-[var(--color-muted)] max-w-md mx-auto">
            AstroWave Records is being built to discover, develop, and amplify the boldest African voices in music. The studio is warming up.
          </p>
        </motion.div>

        {/* Waitlist Form */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="w-full max-w-md space-y-6">
          <p className="label text-[0.6rem]">BE THE FIRST TO KNOW</p>
          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3">
            <input 
              required
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-[var(--color-border)] rounded-sm p-4 font-body text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-all text-center sm:text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              disabled={loading} 
              type="submit" 
              className="min-w-[140px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'NOTIFY ME'}
            </Button>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
          <Link 
            href="/" 
            className="flex items-center gap-2 font-body text-[0.85rem] text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors uppercase tracking-widest font-bold"
          >
            <ArrowLeft size={16} />
            BACK TO ASTROWAVE
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
