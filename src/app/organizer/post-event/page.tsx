'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Zap, Info, Loader2, Save, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { fadeUp } from '@/lib/animations';

const categories = ['Parties', 'Concerts', 'Networking', 'Nightlife', 'Festivals'];

export default function PostEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    category: 'Parties',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        organizerId: user.uid,
        active: true,
        createdAt: serverTimestamp(),
        // Convert local datetime string to Date object
        date: formData.date ? new Date(formData.date).toISOString() : '',
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      toast({ 
        title: "Event Published", 
        description: "Ready to find your perfect talent match?" 
      });
      
      router.push(`/match/${docRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to post", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="display-md text-white">POST NEW EVENT</h1>
        <p className="body-md text-muted">Enter your event details to trigger the AstroWave matching engine.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="admin-label">EVENT TITLE</label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                <input 
                  required 
                  placeholder="e.g. Midnight Mirage 2025" 
                  className="admin-input pl-12 h-14" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="admin-label">DATE & TIME</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    required 
                    type="datetime-local"
                    className="admin-input pl-12 h-14 [color-scheme:dark]" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">CATEGORY</label>
                <select 
                  className="admin-input h-14" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label">VENUE</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  required 
                  placeholder="e.g. The Labadi Beach, Accra" 
                  className="admin-input pl-12 h-14" 
                  value={formData.venue} 
                  onChange={e => setFormData({ ...formData, venue: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label flex items-center justify-between">
                <span>EVENT DESCRIPTION & VIBE</span>
                <span className="text-[0.6rem] text-muted font-mono italic">MANDATORY FOR AI MATCHING</span>
              </label>
              <textarea 
                required
                rows={6} 
                placeholder="Describe the energy, target audience, and specific music styles you need. The more detail, the better our AI can match you with talent." 
                className="admin-input min-h-[160px] resize-none" 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>
          </Card>
        </motion.div>

        <Button type="submit" disabled={loading} className="w-full h-16 text-lg font-bold tracking-widest">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save size={20} className="mr-2" /> PUBLISH & FIND MATCHES <ArrowRight size={20} className="ml-2" /></>}
        </Button>
      </form>
    </div>
  );
}
