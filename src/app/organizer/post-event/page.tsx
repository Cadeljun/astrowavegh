'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Zap, Info, Loader2, Save, ArrowRight, ArrowLeft, Users, DollarSign, ListTodo } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn } from '@/lib/animations';
import { GHANA_CITIES, GHANA_REGIONS } from '@/lib/constants/ghana';
import { cn } from '@/lib/utils';

const EVENT_CATEGORIES = ['Party', 'Concert', 'Corporate', 'Wedding', 'Festival', 'Conference', 'Birthday', 'Other'];
const TALENT_CATEGORIES = [
  { id: 'DJ', label: 'DJ', icon: Zap },
  { id: 'MC', label: 'MC', icon: Users },
  { id: 'Hypeman', label: 'Hypeman', icon: Zap },
  { id: 'Singer', label: 'Singer', icon: Users },
  { id: 'Dancer', label: 'Dancer', icon: Users },
  { id: 'Comedian', label: 'Comedian', icon: Users },
  { id: 'Band', label: 'Band', icon: Users },
  { id: 'Other', label: 'Other', icon: Zap },
];

export default function PostEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Party',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    city: 'Accra',
    region: 'Greater Accra',
    guestCount: 50,
    description: '',
    talentCategory: 'DJ',
    talentBudget: 1000,
    currency: 'GHS',
    requirements: '',
    additionalNotes: '',
    negotiable: true
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const eventData = {
        ...formData,
        organizerId: user.uid,
        organizerName: user.displayName || 'Organizer',
        organizerPhoto: user.photoURL || '',
        status: 'open',
        date: new Date(formData.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'platform_events'), eventData);
      toast({ title: "Event Posted!", description: "Triggering AI match engine..." });
      router.push(`/match/${docRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Post failed", description: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="text-center space-y-2">
        <h1 className="display-md text-white tracking-widest uppercase">POST NEW EVENT</h1>
        <p className="body-md text-muted uppercase tracking-[0.2em] text-xs font-bold">Connect with the perfect wave for your experience</p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 group">
            <div className={cn(
              "w-10 h-10 rounded-full border-2 flex items-center justify-center font-display text-lg transition-all duration-500",
              step === s ? "border-gold bg-gold text-black shadow-[0_0_20px_rgba(255,209,102,0.4)]" : step > s ? "border-gold text-gold bg-gold/5" : "border-white/10 text-muted"
            )}>
              {step > s ? '✓' : s}
            </div>
            <span className={cn("text-[0.6rem] font-bold uppercase tracking-widest", step >= s ? "text-white" : "text-muted")}>
              {s === 1 ? 'Details' : s === 2 ? 'Talent' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <Card className="p-10 space-y-8" glowColor="muted">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="admin-label">EVENT TITLE *</label>
                    <input required className="admin-input h-14" placeholder="e.g. Midnight Mirage 2025" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="admin-label">EVENT CATEGORY *</label>
                    <select className="admin-input h-14" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                       {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="admin-label">DATE *</label>
                    <input required type="date" className="admin-input h-14 [color-scheme:dark]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="admin-label">START TIME *</label>
                    <input required type="time" className="admin-input h-14 [color-scheme:dark]" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="admin-label">END TIME</label>
                    <input type="time" className="admin-input h-14 [color-scheme:dark]" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="admin-label">VENUE NAME *</label>
                    <input required className="admin-input h-14" placeholder="e.g. The Labadi Beach" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="admin-label">CITY *</label>
                        <select className="admin-input h-14" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                           {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="admin-label">GUESTS *</label>
                        <input type="number" className="admin-input h-14" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: Number(e.target.value)})} />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="admin-label">EVENT DESCRIPTION & VIBE</label>
                  <textarea rows={5} className="admin-input resize-none py-4" placeholder="Describe the energy, target audience, and music style..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
            </Card>
            <div className="flex justify-end">
              <Button size="lg" className="px-12 h-16" onClick={handleNext} disabled={!formData.title || !formData.date || !formData.venue}>
                NEXT: REQUIREMENTS <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <Card className="p-10 space-y-10" glowColor="muted">
               <div className="space-y-4">
                  <SectionLabel>WHO ARE YOU LOOKING FOR?</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {TALENT_CATEGORIES.map((cat) => (
                       <button
                         key={cat.id}
                         onClick={() => setFormData({...formData, talentCategory: cat.id})}
                         className={cn(
                           "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all group",
                           formData.talentCategory === cat.id ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(255,209,102,0.15)]" : "bg-black/40 border-white/5 hover:border-white/20"
                         )}
                       >
                         <cat.icon size={24} className={formData.talentCategory === cat.id ? "text-gold" : "text-muted group-hover:text-white"} />
                         <span className={cn("text-[0.65rem] font-bold uppercase tracking-widest", formData.talentCategory === cat.id ? "text-white" : "text-muted group-hover:text-white")}>{cat.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-white/5">
                  <div className="space-y-4">
                    <label className="admin-label">MAX TALENT BUDGET *</label>
                    <div className="flex gap-3">
                       <div className="flex-1 relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                          <input type="number" className="admin-input h-14 pl-12" value={formData.talentBudget} onChange={e => setFormData({...formData, talentBudget: Number(e.target.value)})} />
                       </div>
                       <select className="admin-input w-32 h-14" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                          <option value="GHS">GHS</option>
                          <option value="USD">USD</option>
                       </select>
                    </div>
                    <div className="flex items-center gap-3 p-2">
                       <input type="checkbox" id="neg" checked={formData.negotiable} onChange={e => setFormData({...formData, negotiable: e.target.checked})} className="w-4 h-4 accent-gold" />
                       <label htmlFor="neg" className="text-xs text-muted uppercase font-bold tracking-widest cursor-pointer">Budget is negotiable</label>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <label className="admin-label">SPECIFIC REQUIREMENTS</label>
                     <textarea rows={4} className="admin-input resize-none py-4" placeholder="e.g. Own equipment needed, sound check 1hr prior..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
               </div>
            </Card>
            <div className="flex justify-between">
               <Button variant="ghost" size="lg" className="h-16" onClick={handleBack}><ArrowLeft size={18} className="mr-2" /> BACK</Button>
               <Button size="lg" className="px-12 h-16" onClick={handleNext}>NEXT: REVIEW <ArrowRight size={18} className="ml-2" /></Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
            <Card className="p-10 space-y-10" glowColor="gold">
               <div className="space-y-6">
                  <SectionLabel>EVENT SUMMARY</SectionLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <div className="space-y-1">
                           <p className="text-[0.6rem] label m-0">TITLE & CATEGORY</p>
                           <h3 className="text-3xl font-display text-white tracking-widest uppercase">{formData.title}</h3>
                           <Badge variant="active">{formData.category}</Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[0.6rem] label m-0">DATE & VENUE</p>
                           <p className="text-lg font-bold text-white uppercase">{new Date(formData.date).toLocaleDateString()} @ {formData.startTime}</p>
                           <p className="text-sm text-muted">{formData.venue}, {formData.city}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-1">
                           <p className="text-[0.6rem] label m-0">TALENT NEEDS</p>
                           <p className="text-xl font-bold text-gold uppercase">{formData.talentCategory}</p>
                           <p className="text-sm text-muted">Budget: {formData.currency} {formData.talentBudget.toLocaleString()} {formData.negotiable ? '(Negotiable)' : ''}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[0.6rem] label m-0">AUDIENCE</p>
                           <p className="text-lg font-bold text-white uppercase">{formData.guestCount} GUESTS EXPECTED</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex gap-4 text-cyan-400">
                  <Info className="shrink-0" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest leading-relaxed">
                    Once published, the AstroWave Matching Engine will immediately scan the roster to find the best {formData.talentCategory}s for this wave.
                  </p>
               </div>
            </Card>

            <div className="flex justify-between gap-6">
               <Button variant="ghost" size="lg" className="h-16" onClick={handleBack} disabled={loading}><ArrowLeft size={18} className="mr-2" /> EDIT</Button>
               <Button size="lg" className="flex-1 h-16 text-lg font-bold tracking-[0.3em] shadow-[0_0_50px_rgba(255,209,102,0.3)]" onClick={handleSubmit} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} className="mr-3" /> PUBLISH EVENT</>}
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
