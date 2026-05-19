'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Zap, ExternalLink, Plus, Eye, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db, useAuth, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';

export default function MyEventsPage() {
  const { user } = useAuth();

  const eventsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'events'), 
      where('organizerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user]);

  const { data: events, loading } = useCollection(eventsQuery);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="display-md text-white">MY EVENTS</h1>
          <p className="body-md text-muted">Manage your hosted experiences and matching status.</p>
        </div>
        <Link href="/organizer/post-event">
          <Button className="h-14 px-8"><Plus size={18} className="mr-2" /> POST NEW EVENT</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-md border border-white/5" />)
        ) : events && events.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
            {events.map((event: any) => (
              <motion.div key={event.id} variants={fadeUp}>
                <Card className="p-8 group hover:border-gold/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                         <Badge variant="active">{event.category}</Badge>
                         <span className="text-[0.65rem] text-muted font-mono uppercase">ID: {event.id.slice(0, 8)}</span>
                      </div>
                      <h2 className="display-sm text-white text-2xl tracking-widest">{event.name.toUpperCase()}</h2>
                      <div className="flex flex-wrap items-center gap-6 text-muted text-xs font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Calendar size={14} className="text-gold" /> {new Date(event.date).toLocaleDateString()}</span>
                         <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> {event.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link href={`/match/${event.id}`}>
                        <Button variant="primary" size="sm" className="h-12 border-cyan text-cyan hover:bg-cyan hover:text-black">
                           <Zap size={14} className="mr-2" /> RUN ENGINE
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-12 border-white/5 text-muted hover:text-white">
                         <Eye size={14} className="mr-2" /> VIEW
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-32 text-center space-y-6 opacity-30 border-2 border-dashed border-white/5 rounded-xl">
            <Calendar size={64} className="mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-display tracking-widest">NO EVENTS POSTED YET</p>
              <Link href="/organizer/post-event" className="text-gold hover:underline font-bold text-xs uppercase tracking-widest">Post your first event now</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
