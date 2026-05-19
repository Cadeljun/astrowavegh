
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Zap, Users, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';

export default function MatchingPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="min-h-screen bg-black p-6 lg:p-12">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <Link href="/organizer/dashboard" className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
            <ArrowLeft size={16} /> BACK TO DASHBOARD
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
             <span className="label text-[0.6rem] text-cyan-500">AI ENGINE ACTIVE</span>
          </div>
        </header>

        <div className="text-center space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <Sparkles className="text-gold" size={32} />
            </div>
            <h1 className="display-xl text-white">THE PERFECT MATCH.</h1>
            <p className="body-lg text-muted max-w-2xl mx-auto">
              Analyzing vibe, category, and energy for Event ID: <span className="text-gold font-mono uppercase">{eventId}</span>
            </p>
          </motion.div>
        </div>

        <Card className="p-12 text-center space-y-6 bg-white/[0.02]" glowColor="cyan">
           <div className="flex flex-col items-center gap-6">
              <Users size={64} className="text-cyan-500 opacity-20" />
              <div className="space-y-2">
                 <h2 className="display-md text-white">CALIBRATING RESULTS</h2>
                 <p className="body-md text-muted italic">"Finding talent that resonates with your vision..."</p>
              </div>
              <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-cyan-500" 
                 />
              </div>
           </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 pointer-events-none">
           {[1,2,3].map(i => (
             <Card key={i} className="p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 mx-auto" />
                <div className="h-4 w-3/4 bg-white/5 mx-auto rounded" />
                <div className="h-3 w-1/2 bg-white/5 mx-auto rounded" />
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
