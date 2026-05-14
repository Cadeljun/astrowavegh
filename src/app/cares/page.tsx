'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, GraduationCap, Users, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fadeUp, fadeIn, scaleIn, staggerContainer } from '@/lib/animations';

export default function CaresPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const division = 'cares';

    addDoc(collection(db, 'waitlist'), {
      email,
      division,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        toast({
          title: "Thank you!",
          description: "We'll reach out when we launch.",
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

  const missions = [
    { icon: GraduationCap, text: "Creative Education" },
    { icon: Users, text: "Youth Empowerment" },
    { icon: Globe, text: "Community Impact" }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[var(--color-black)] px-6">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(168, 85, 247, 0.08), transparent 70%)' 
        }} 
      />

      {/* Faint Background Text */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
        <span className="font-display text-[15rem] text-white opacity-[0.02] leading-none tracking-tighter">
          CARES
        </span>
      </div>

      {/* Sparkle Particles (Simulated) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: [0, 0.2, 0], 
            y: [-100, -300],
            x: Math.random() * 20 - 10 
          }}
          transition={{ 
            duration: 10 + Math.random() * 5, 
            repeat: Infinity, 
            delay: i * 2,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-[var(--color-purple)] rounded-full z-0"
          style={{ 
            left: `${15 + i * 15}%`,
            bottom: '10%'
          }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl space-y-10">
        {/* Heart Animation */}
        <motion.div 
          variants={scaleIn}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <motion.div 
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[var(--color-purple)] text-glow-purple"
          >
            <Heart size={80} fill="currentColor" fillOpacity={0.1} />
          </motion.div>
        </motion.div>

        {/* Text Stack */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="space-y-4">
          <div className="label text-[var(--color-purple)] tracking-[0.4em] text-glow-purple flex items-center justify-center gap-3">
             <span className="h-[1px] w-6 bg-[var(--color-purple)] opacity-30"></span>
             ASTROWAVE CARES
             <span className="h-[1px] w-6 bg-[var(--color-purple)] opacity-30"></span>
          </div>
          <h1 className="display-xl text-white text-glow-purple leading-[0.85]">
            IMPACT IS<br />COMING.
          </h1>
          <p className="body-lg text-[var(--color-muted)] max-w-md mx-auto">
            AstroWave Cares is being built to empower youth, support creatives, and give back to the communities that inspire us every day. Something meaningful is on the way.
          </p>
        </motion.div>

        {/* Mission Preview Cards */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
        >
          {missions.map((m, i) => (
            <motion.div key={i} variants={scaleIn}>
              <Card className="p-4 border-white/5 bg-[var(--color-card)]/40 flex flex-col items-center gap-3 group" glowColor="purple">
                <m.icon size={24} className="text-[var(--color-purple)] group-hover:scale-110 transition-transform" />
                <span className="font-body text-[0.7rem] uppercase tracking-widest font-bold text-white whitespace-nowrap">{m.text}</span>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Waitlist Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }} className="w-full max-w-md space-y-6">
          <p className="label text-[0.6rem]">STAY CONNECTED</p>
          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3">
            <input 
              required
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-[var(--color-border)] rounded-sm p-4 font-body text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-purple)] transition-all text-center sm:text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              disabled={loading} 
              type="submit" 
              className="min-w-[140px] border-[var(--color-purple)] text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'NOTIFY ME'}
            </Button>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.8 }}>
          <Link 
            href="/" 
            className="flex items-center gap-2 font-body text-[0.85rem] text-[var(--color-muted)] hover:text-[var(--color-purple)] transition-colors uppercase tracking-widest font-bold"
          >
            <ArrowLeft size={16} />
            BACK TO ASTROWAVE
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
