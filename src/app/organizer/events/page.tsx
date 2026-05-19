'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Zap, Eye, Loader2, Trash2, Award, Plus, Star } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

const tabs = ['All', 'Open', 'Booked', 'Completed', 'Cancelled'];

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'platform_events'), where('organizerId', '==', user.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const filteredEvents = useMemo(() => {
    if (activeTab === 'All') return events;
    return events.filter(e => e.status === activeTab.toLowerCase());
  }, [events, activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? Only open events can be deleted.')) return;
    try {
      await deleteDoc(doc(db, 'platform_events', id));
      toast({ title: "Event Removed" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Delete Failed" });
    }
  };

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">MY EVENTS</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Track your event briefs and booking progress</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-sm",
                    activeTab === tab ? "bg-gold text-black shadow-lg" : "text-muted hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href="/organizer/post-event">
              <Button size="md" className="h-12"><Plus size={16} className="mr-2" /> POST NEW</Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)
          ) : filteredEvents.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div key={event.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="h-full group hover:border-gold/30 transition-all flex flex-col relative overflow-hidden" glowColor="muted">
                    <div className="p-8 space-y-8 flex-1">
                      <div className="flex justify-between items-start">
                         <Badge variant="active" className="bg-gold-dim text-gold border-gold text-[0.6rem]">{event.category.toUpperCase()}</Badge>
                         <Badge variant={event.status === 'open' ? 'live' : event.status === 'booked' ? 'active' : 'coming-soon'}>{event.status.toUpperCase()}</Badge>
                      </div>
                      <div className="space-y-3">
                         <h2 className="text-3xl font-display text-white tracking-widest group-hover:text-gold transition-colors">{event.title.toUpperCase()}</h2>
                         <div className="flex flex-col gap-2 text-[0.7rem] font-bold text-muted uppercase tracking-widest">
                            <span className="flex items-center gap-2.5"><Calendar size={14} className="text-gold" /> {new Date(event.date?.toDate()).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2.5"><MapPin size={14} className="text-gold" /> {event.venue}, {event.city}</span>
                         </div>
                      </div>
                      
                      {event.status === 'booked' && (
                        <div className="p-4 rounded-xl bg-purple-dim/10 border border-purple/20 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full overflow-hidden border border-purple/30">
                              <img src={event.bookedTalentPhoto || 'https://picsum.photos/seed/talent/100/100'} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[0.6rem] label m-0">TALENT BOOKED</p>
                              <p className="text-xs font-bold text-white uppercase truncate">{event.bookedTalentName}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-display text-gold">WS: {(event.bookedTalentWaveScore || 0).toFixed(1)}</p>
                           </div>
                        </div>
                      )}

                      {event.status === 'open' && (
                         <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="space-y-1">
                               <p className="text-[0.55rem] label m-0 opacity-40">TARGET</p>
                               <p className="text-xs font-bold text-white uppercase">{event.talentCategory}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[0.55rem] label m-0 opacity-40">BUDGET</p>
                               <p className="text-xs font-bold text-gold uppercase">{event.currency} {event.talentBudget.toLocaleString()}</p>
                            </div>
                         </div>
                      )}
                    </div>
                    
                    <div className="p-8 pt-0 flex gap-4">
                      {event.status === 'open' && (
                        <>
                          <Link href={`/match/${event.id}`} className="flex-1">
                            <Button variant="primary" className="w-full h-12 text-[0.65rem] font-bold">FIND TALENT <Award size={14} className="ml-2" /></Button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(event.id)} 
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors"
                            title="Delete Brief"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      {event.status === 'booked' && (
                        <Link href="/organizer/bookings" className="flex-1">
                          <Button variant="secondary" className="w-full h-12 text-[0.65rem] border-white/10">VIEW BOOKING <Eye size={14} className="ml-2" /></Button>
                        </Link>
                      )}
                      {event.status === 'completed' && (
                         <Link href="/organizer/bookings" className="flex-1">
                            {event.rated ? (
                              <Button variant="ghost" disabled className="w-full h-12 text-[0.65rem] border-white/5 opacity-50"><Star size={14} className="mr-2 text-gold" /> RATED</Button>
                            ) : (
                              <Button variant="secondary" className="w-full h-12 text-[0.65rem] border-purple text-purple">RATE PERFORMANCE <Star size={14} className="ml-2" /></Button>
                            )}
                         </Link>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-48 text-center space-y-8 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
              <Calendar size={100} className="mx-auto text-gold" />
              <div className="space-y-3">
                <p className="text-3xl font-display tracking-[0.4em] uppercase">No Active Briefs</p>
                <p className="text-sm font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Post your first event to start matching with elite creative talent in Ghana.</p>
                <Link href="/organizer/post-event" className="inline-block mt-8"><Button>POST AN EVENT</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlatformGuard>
  );
}
