'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Zap, Info, Loader2, Save, ArrowRight, ArrowLeft, Users, DollarSign, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useToast } from '@/hooks/use-toast';
import { fadeUp } from '@/lib/animations';
import { GHANA_CITIES, GHANA_REGIONS } from '@/lib/constants/ghana';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';
import { postEvent, validateEventForm, type EventFormData } from '@/lib/platform/eventService';

const EVENT_CATEGORIES = ['Party', 'Concert', 'Corporate', 'Wedding', 'Festival', 'Conference', 'Birthday', 'Other'];
const TALENT_CATEGORIES = [
  { value: 'DJ', label: 'DJ', emoji: '🎵', desc: 'Music & mixing' },
  { value: 'MC', label: 'MC', emoji: '🎤', desc: 'Master of ceremony' },
  { value: 'Hypeman', label: 'Hypeman', emoji: '🙌', desc: 'Energy & crowd' },
  { value: 'Singer', label: 'Singer', emoji: '🎶', desc: 'Live vocals' },
  { value: 'Dancer', label: 'Dancer', emoji: '💃', desc: 'Performance' },
  { value: 'Comedian', label: 'Comedian', emoji: '😂', desc: 'Entertainment' },
  { value: 'Band', label: 'Band', emoji: '🎸', desc: 'Live band' },
  { value: 'Other', label: 'Other', emoji: '✨', desc: 'Specific need' },
];

export default function PostEventPage() {
  const { user, platformUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<EventFormData>>({
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
    priceNegotiable: true
  });

  const update = (key: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNext = () => {
    const stepErrors = validateEventForm(formData, step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user || !platformUser) return;
    
    const finalErrors = validateEventForm(formData, 2);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setSubmitting(true);
    try {
      const eventId = await postEvent(
        user.uid,
        platformUser.displayName,
        platformUser.photoURL || '',
        formData as EventFormData
      );
      
      toast({ title: "Event Posted!", description: "Initializing Matching Engine..." });
      
      // Navigate to match page which handles engine logic
      router.push(`/match/${eventId}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Post failed", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformGuard requiredRole="organizer">
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
              )}>{step > s ? <Check size={18} /> : s}</div>
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
                      <input 
                        className={cn("admin-input h-14", errors.title && "border-red-400/50")} 
                        placeholder="e.g. Midnight Mirage 2025" 
                        value={formData.title} 
                        onChange={e => update('title', e.target.value)} 
                      />
                      {errors.title && <p className="text-[0.6rem] text-red-400 font-bold uppercase">{errors.title}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">EVENT CATEGORY *</label>
                      <select className={cn("admin-input h-14", errors.category && "border-red-400/50")} value={formData.category} onChange={e => update('category', e.target.value)}>
                         {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="admin-label">DATE *</label>
                      <input type="date" className={cn("admin-input h-14 [color-scheme:dark]", errors.date && "border-red-400/50")} value={formData.date} onChange={e => update('date', e.target.value)} />
                      {errors.date && <p className="text-[0.6rem] text-red-400 font-bold uppercase">{errors.date}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">START TIME *</label>
                      <input type="time" className="admin-input h-14 [color-scheme:dark]" value={formData.startTime} onChange={e => update('startTime', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">END TIME</label>
                      <input type="time" className="admin-input h-14 [color-scheme:dark]" value={formData.endTime} onChange={e => update('endTime', e.target.value)} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="admin-label">VENUE NAME *</label>
                      <input className={cn("admin-input h-14", errors.venue && "border-red-400/50")} placeholder="e.g. The Labadi Beach" value={formData.venue} onChange={e => update('venue', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="admin-label">CITY *</label>
                          <select className="admin-input h-14" value={formData.city} onChange={e => update('city', e.target.value)}>
                             {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="admin-label">EXPECTED GUESTS *</label>
                          <input type="number" className="admin-input h-14" value={formData.guestCount} onChange={e => update('guestCount', Number(e.target.value))} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="admin-label">EVENT DESCRIPTION & VIBE</label>
                    <textarea rows={5} className="admin-input resize-none py-4" placeholder="Tell talent about the audience and desired energy..." value={formData.description} onChange={e => update('description', e.target.value)} />
                 </div>
              </Card>
              <div className="flex justify-end">
                <Button size="lg" className="px-12 h-16" onClick={handleNext}>NEXT: TALENT SPECS <ArrowRight size={18} className="ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <Card className="p-10 space-y-10" glowColor="muted">
                 <div className="space-y-4">
                    <SectionLabel>WHICH TALENT DO YOU NEED?</SectionLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {TALENT_CATEGORIES.map((cat) => (
                         <button 
                           key={cat.value} 
                           onClick={() => update('talentCategory', cat.value)}
                           className={cn(
                             "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all group",
                             formData.talentCategory === cat.value 
                               ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(255,209,102,0.15)]" 
                               : "bg-black/40 border-white/5 hover:border-white/20"
                           )}
                         >
                           <span className="text-[2rem]">{cat.emoji}</span>
                           <span className={cn("text-[0.65rem] font-bold uppercase tracking-widest", formData.talentCategory === cat.value ? "text-white" : "text-muted group-hover:text-white")}>{cat.label}</span>
                           <span className="text-[0.5rem] text-muted opacity-40 uppercase font-bold">{cat.desc}</span>
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
                            <input type="number" className={cn("admin-input h-14 pl-12", errors.talentBudget && "border-red-400/50")} value={formData.talentBudget} onChange={e => update('talentBudget', Number(e.target.value))} />
                         </div>
                         <select className="admin-input w-32 h-14" value={formData.currency} onChange={e => update('currency', e.target.value)}>
                            <option value="GHS">GHS</option>
                            <option value="USD">USD</option>
                         </select>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" id="neg" checked={formData.priceNegotiable} onChange={e => update('priceNegotiable', e.target.checked)} className="w-4 h-4 accent-gold" />
                         <label htmlFor="neg" className="text-xs text-muted uppercase font-bold cursor-pointer">Price is negotiable</label>
                      </div>
                    </div>
                    <div className="space-y-4">
                       <label className="admin-label">SPECIFIC REQUIREMENTS</label>
                       <textarea rows={4} className="admin-input resize-none py-4" placeholder="e.g. Own DJ equipment needed, arrival 1hr prior..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                    </div>
                 </div>
              </Card>
              <div className="flex justify-between">
                 <Button variant="ghost" size="lg" className="h-16" onClick={handleBack}><ArrowLeft size={18} className="mr-2" /> BACK</Button>
                 <Button size="lg" className="px-12 h-16" onClick={handleNext}>NEXT: FINAL REVIEW <ArrowRight size={18} className="ml-2" /></Button>
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
                             <p className="text-[0.6rem] label m-0">TITLE & TYPE</p>
                             <h3 className="text-3xl font-display text-white tracking-widest uppercase">{formData.title}</h3>
                             <p className="text-sm text-gold font-bold uppercase">{formData.category}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[0.6rem] label m-0">LOCATION</p>
                             <p className="text-lg font-bold text-white uppercase">{formData.venue}, {formData.city}</p>
                             <p className="text-xs text-muted font-bold uppercase tracking-widest">{formData.date} @ {formData.startTime}</p>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-1">
                             <p className="text-[0.6rem] label m-0">TALENT REQUIREMENT</p>
                             <p className="text-xl font-bold text-gold uppercase">{formData.talentCategory}</p>
                             <p className="text-sm text-muted">Budget: {formData.currency} {formData.talentBudget?.toLocaleString()} {formData.priceNegotiable && '(Negotiable)'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[0.6rem] label m-0">GUESTS</p>
                             <p className="text-lg font-bold text-white">{formData.guestCount} Guests expected</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex gap-4 text-cyan-400">
                    <Info className="shrink-0" />
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest leading-relaxed">
                      IMPORTANT: After posting, our matching engine will scan the roster to find the best talents for your event based on category, location, and Wave Score.
                    </p>
                 </div>
              </Card>
              <div className="flex justify-between gap-6">
                 <Button variant="ghost" size="lg" className="h-16" onClick={handleBack} disabled={submitting}><ArrowLeft size={18} className="mr-2" /> EDIT DETAILS</Button>
                 <Button size="lg" className="flex-1 h-16 text-lg font-bold tracking-[0.3em]" onClick={handleSubmit} disabled={submitting}>
                   {submitting ? <Loader2 className="animate-spin" /> : <><Zap size={20} className="mr-3" /> PUBLISH & MATCH</>}
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PlatformGuard>
  );
}
