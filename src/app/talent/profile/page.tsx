'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Music, 
  Instagram, 
  Globe, 
  Loader2, 
  Camera, 
  Plus, 
  X, 
  Eye, 
  Pencil, 
  MapPin, 
  Zap, 
  Video,
  ExternalLink,
  Star,
  Twitter,
  Youtube,
  Cloud,
  Check
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations';
import { GHANA_CITIES, GHANA_REGIONS } from '@/lib/constants/ghana';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

const TALENT_CATEGORIES = ['DJ', 'MC', 'Hypeman', 'Singer', 'Dancer', 'Comedian', 'Band', 'Other'];

export default function TalentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'photo' | 'portfolio' | 'video'>('photo');

  const [formData, setFormData] = useState<any>({
    stageName: '',
    fullName: '',
    category: 'DJ',
    subcategory: '',
    bio: '',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    basePrice: 0,
    currency: 'GHS',
    priceNegotiable: false,
    instagram: '',
    soundcloud: '',
    spotify: '',
    twitter: '',
    youtube: '',
    portfolio: [],
    demoReel: '',
    skills: []
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'talent_profiles', user.uid));
        if (snap.exists()) {
          setFormData(snap.data());
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'talent_profiles', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Profile Updated", description: "Your professional presence is live." });
      setMode('view');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (pickerTarget === 'photo') {
      setFormData({ ...formData, photoURL: url });
    } else if (pickerTarget === 'portfolio') {
      setFormData({ ...formData, portfolio: [...(formData.portfolio || []), url].slice(0, 8) });
    } else if (pickerTarget === 'video') {
      setFormData({ ...formData, demoReel: url });
    }
  };

  const removePortfolioItem = (idx: number) => {
    const next = [...formData.portfolio];
    next.splice(idx, 1);
    setFormData({ ...formData, portfolio: next });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple" /></div>;

  return (
    <PlatformGuard requiredRole="talent">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">
              {mode === 'view' ? 'Public Identity' : 'Manage Presence'}
            </h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em]">
              {mode === 'view' ? 'Previewing how organizers see you' : 'Crafting your professional brand'}
            </p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setMode('view')}
              className={cn(
                "px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm",
                mode === 'view' ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              <Eye size={14} /> Preview
            </button>
            <button 
              onClick={() => setMode('edit')}
              className={cn(
                "px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm",
                mode === 'edit' ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              <Pencil size={14} /> Edit Mode
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {mode === 'view' ? (
            <motion.div key="view" variants={staggerContainer} initial="hidden" animate="show" className="space-y-16">
              {/* Identity Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <motion.div variants={scaleIn} className="lg:col-span-4 space-y-6">
                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl relative group bg-surface">
                       {formData.photoURL ? (
                         <img src={formData.photoURL} alt={formData.stageName} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-4">
                            <User size={64} className="opacity-10" />
                            <p className="text-xs font-bold uppercase tracking-widest">No Profile Photo</p>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                       <div className="absolute bottom-6 left-6">
                         <Badge variant="live" className={cn(formData.available ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                           {formData.available ? 'AVAILABLE NOW' : 'OFF DUTY'}
                         </Badge>
                       </div>
                    </div>
                    <Card className="p-6 bg-white/[0.02] border-white/5 text-center space-y-4" glowColor="gold">
                       <p className="text-[0.6rem] label m-0">Starting from</p>
                       <h3 className="font-display text-4xl text-white tracking-widest leading-none">
                         {formData.currency} {formData.basePrice.toLocaleString()}
                       </h3>
                       <p className="text-[0.6rem] text-muted uppercase font-bold tracking-widest">{formData.priceNegotiable ? 'Negotiable' : 'Fixed Price'}</p>
                    </Card>
                 </motion.div>

                 <div className="lg:col-span-8 space-y-10">
                    <motion.div variants={fadeUp} className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                         <Badge variant="active" className="bg-purple-dim text-purple border-purple">{formData.category}</Badge>
                         {formData.subcategory && <span className="text-[0.7rem] text-muted font-bold uppercase tracking-[0.2em]">/ {formData.subcategory}</span>}
                      </div>
                      <h2 className="display-xl text-white text-glow-purple leading-none">{formData.stageName}</h2>
                      <div className="flex flex-wrap items-center gap-8 text-muted font-bold text-xs uppercase tracking-[0.2em]">
                         <span className="flex items-center gap-2.5"><MapPin size={16} className="text-purple" /> {formData.city}, {formData.country}</span>
                         <span className="flex items-center gap-2.5 text-gold"><Zap size={16} className="text-gold" /> Wave Score: {(formData.waveScore || 0).toFixed(1)}</span>
                         <span className="flex items-center gap-2.5 text-white"><Star size={16} className="text-purple" /> {(formData.averageRating || 0).toFixed(1)} Community Rating</span>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                       <SectionLabel className="mb-0">ABOUT {formData.stageName.toUpperCase()}</SectionLabel>
                       <p className="body-lg text-white/80 leading-relaxed whitespace-pre-wrap">{formData.bio || "Biography details coming soon."}</p>
                       {formData.skills?.length > 0 && (
                         <div className="flex flex-wrap gap-2 pt-4">
                            {formData.skills.map((s: string) => <Badge key={s} variant="active" className="bg-white/5 border-white/10 text-white/60">{s}</Badge>)}
                         </div>
                       )}
                    </motion.div>

                    <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {[
                        { icon: Instagram, url: formData.instagram, label: 'Insta' },
                        { icon: Music, url: formData.soundcloud, label: 'Cloud' },
                        { icon: Globe, url: formData.spotify, label: 'Spot' },
                        { icon: Youtube, url: formData.youtube, label: 'Tube' },
                        { icon: Twitter, url: formData.twitter, label: 'X' },
                      ].map((s, i) => (
                        s.url ? (
                          <a key={i} href={s.url} target="_blank" className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-purple transition-all group shadow-xl">
                            <s.icon size={22} className="text-muted group-hover:text-purple transition-colors" />
                            <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">{s.label}</span>
                          </a>
                        ) : null
                      ))}
                    </motion.div>
                 </div>
              </div>

              {/* Media Displays */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-8 space-y-12">
                    <motion.section variants={fadeUp} className="space-y-8">
                       <SectionLabel>PROFESSIONAL REEL</SectionLabel>
                       {formData.portfolio?.length > 0 ? (
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {formData.portfolio.map((img: string, i: number) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 group relative shadow-2xl bg-surface">
                                <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ExternalLink size={24} className="text-white" />
                                </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         <div className="py-24 text-center rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 opacity-20">
                            <p className="text-xs font-bold uppercase tracking-widest">No portfolio photos added</p>
                         </div>
                       )}
                    </motion.section>

                    <motion.section variants={fadeUp} className="space-y-8">
                       <SectionLabel>DEMO PERFORMANCE</SectionLabel>
                       {formData.demoReel ? (
                         <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group">
                            <video src={formData.demoReel} controls className="w-full h-full" poster={formData.photoURL} />
                         </div>
                       ) : (
                         <div className="py-24 text-center rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 opacity-20">
                            <Video size={56} className="mx-auto mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">No video reel available</p>
                         </div>
                       )}
                    </motion.section>
                 </div>

                 <aside className="lg:col-span-4 space-y-8">
                    <Card className="p-8 space-y-8 bg-[#111118]/60" glowColor="purple">
                       <SectionLabel>WAVE SCORE BREAKDOWN</SectionLabel>
                       <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-white/5 pb-4">
                             <span className="text-xs text-muted uppercase font-bold">Base Score</span>
                             <span className="text-2xl font-display text-white">{(formData.averageRating || 0).toFixed(1)}</span>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-widest">
                                <span className="text-muted">Experience</span>
                                <span className="text-white">{Math.min(formData.eventCount || 0, 20)}/20 Events</span>
                             </div>
                             <Progress value={Math.min((formData.eventCount || 0) * 5, 100)} className="h-1 bg-white/5" />
                          </div>
                          <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-3">
                             <p className="text-[0.6rem] text-gold font-bold uppercase tracking-widest flex items-center gap-2"><Zap size={10} /> Algorithm Contribution</p>
                             <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-lg font-display text-white">60%</p><p className="text-[0.5rem] label m-0">Ratings</p></div>
                                <div><p className="text-lg font-display text-white">40%</p><p className="text-[0.5rem] label m-0">Activity</p></div>
                             </div>
                          </div>
                       </div>
                    </Card>
                 </aside>
              </div>
            </motion.div>
          ) : (
            <motion.form key="edit" onSubmit={handleSave} variants={fadeUp} initial="hidden" animate="show" className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2 space-y-8">
                    {/* Identity Details */}
                    <Card className="p-10 space-y-8 bg-[#16161F]" glowColor="muted">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                         <div className="p-2 rounded bg-purple/10 text-purple"><User size={18} /></div>
                         <h3 className="font-display text-2xl text-white uppercase tracking-wider">Professional Identity</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="admin-label">Stage Name *</label>
                          <input required className="admin-input h-14" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                          <label className="admin-label">Full Name</label>
                          <input required className="admin-input h-14" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="admin-label">Category</label>
                          <select className="admin-input h-14" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="admin-label">Subcategory / Genre Tags</label>
                          <input className="admin-input h-14" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} placeholder="e.g. Afrobeats, Amapiano, Tech House" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="admin-label flex justify-between">
                          <span>Professional Bio *</span>
                          <span className={cn("text-[0.6rem] font-mono", (formData.bio || '').length > 450 ? "text-red-400" : "text-muted")}>
                            {(formData.bio || '').length} / 500
                          </span>
                        </label>
                        <textarea rows={8} maxLength={500} className="admin-input min-h-[200px] resize-none py-6" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe your sound, experience, and energy..." />
                      </div>
                    </Card>

                    {/* Location & Commercials */}
                    <Card className="p-10 space-y-8 bg-[#16161F]" glowColor="muted">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                         <div className="p-2 rounded bg-gold/10 text-gold"><DollarSign size={18} /></div>
                         <h3 className="font-display text-2xl text-white uppercase tracking-wider">Location & Commercials</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="admin-label">City *</label>
                          <select className="admin-input h-14" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                            {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="admin-label">Base Performance Price</label>
                          <div className="flex gap-2">
                             <input type="number" className="admin-input h-14 flex-1" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
                             <select className="admin-input w-32 h-14" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                               <option value="GHS">GHS</option>
                               <option value="USD">USD</option>
                             </select>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Socials */}
                    <Card className="p-10 space-y-8 bg-[#16161F]" glowColor="muted">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                         <div className="p-2 rounded bg-cyan/10 text-cyan"><Globe size={18} /></div>
                         <h3 className="font-display text-2xl text-white uppercase tracking-wider">Digital Connection</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {[
                           { icon: Instagram, key: 'instagram', label: 'Instagram' },
                           { icon: Music, key: 'soundcloud', label: 'SoundCloud' },
                           { icon: Globe, key: 'spotify', label: 'Spotify' },
                           { icon: Youtube, key: 'youtube', label: 'YouTube' },
                           { icon: Twitter, key: 'twitter', label: 'Twitter/X' },
                         ].map(s => (
                           <div key={s.key} className="space-y-3">
                              <label className="admin-label flex items-center gap-2"><s.icon size={14} /> {s.label} URL</label>
                              <input type="url" className="admin-input h-12" value={formData[s.key] || ''} onChange={e => setFormData({...formData, [s.key]: e.target.value})} placeholder="https://..." />
                           </div>
                         ))}
                      </div>
                    </Card>
                 </div>

                 {/* Media Sidebar */}
                 <aside className="space-y-8">
                    <Card className="p-8 text-center space-y-8 bg-[#16161F]" glowColor="muted">
                      <p className="admin-label">PROFILE PORTRAIT</p>
                      <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-purple/20 bg-white/5 group">
                         {formData.photoURL ? (
                           <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <Camera className="mx-auto mt-14 text-muted/20" size={48} />
                         )}
                         <button 
                          type="button"
                          onClick={() => { setPickerTarget('photo'); setPickerOpen(true); }}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                         >
                           <Cloud size={24} className="text-purple" />
                           <span className="text-[0.6rem] font-bold uppercase tracking-widest">Update</span>
                         </button>
                      </div>
                      <Button type="button" variant="ghost" className="w-full h-12 border border-white/5 text-[0.65rem] font-bold" onClick={() => { setPickerTarget('photo'); setPickerOpen(true); }}>OPEN MEDIA LIBRARY</Button>
                    </Card>

                    <Card className="p-8 space-y-6 bg-[#16161F]" glowColor="muted">
                      <div className="flex justify-between items-center">
                         <p className="admin-label m-0">PORTFOLIO (MAX 8)</p>
                         <span className="text-[0.6rem] font-mono text-muted">{formData.portfolio?.length || 0}/8</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         {formData.portfolio?.map((img: string, i: number) => (
                           <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/5 group shadow-lg">
                              <img src={img} className="w-full h-full object-cover" alt="" />
                              <button onClick={() => removePortfolioItem(i)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><X size={20} /></button>
                           </div>
                         ))}
                         {(formData.portfolio?.length || 0) < 8 && (
                           <button 
                              type="button"
                              onClick={() => { setPickerTarget('portfolio'); setPickerOpen(true); }}
                              className="aspect-square rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-muted hover:bg-white/10 hover:border-purple/50 transition-all"
                           >
                             <Plus size={20} />
                           </button>
                         )}
                      </div>
                    </Card>

                    <Card className="p-8 space-y-6 bg-[#16161F]" glowColor="muted">
                       <p className="admin-label">PERFORMANCE DEMO REEL</p>
                       <div className="aspect-video rounded-xl bg-black flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group shadow-inner">
                          {formData.demoReel ? (
                             <video src={formData.demoReel} className="w-full h-full object-cover opacity-50" />
                          ) : (
                             <Video size={40} className="text-muted/10 mb-2" />
                          )}
                          <button 
                            type="button" 
                            onClick={() => { setPickerTarget('video'); setPickerOpen(true); }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-3"
                          >
                            <Cloud size={24} className="text-purple" />
                            <span className="font-bold text-[0.65rem] uppercase tracking-[0.2em]">{formData.demoReel ? 'Replace Video' : 'Add Demo Reel'}</span>
                          </button>
                       </div>
                    </Card>

                    <Button disabled={saving} type="submit" className="w-full h-20 text-lg font-bold tracking-[0.3em] shadow-[0_0_50px_rgba(168,85,247,0.3)] bg-purple hover:bg-purple/80 text-white border-none">
                      {saving ? <Loader2 className="animate-spin" /> : <><Check size={24} className="mr-3" /> PUBLISH PROFILE</>}
                    </Button>
                 </aside>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <MediaPickerModal 
          isOpen={isPickerOpen} 
          onClose={() => setPickerOpen(false)} 
          onSelect={handleMediaSelect}
          folders={
            pickerTarget === 'photo' ? [`astrowave/talent/${formData.category.toLowerCase()}s`] :
            pickerTarget === 'portfolio' ? ['astrowave/talent/portfolio'] :
            ['astrowave/videos/talent']
          }
        />
      </div>
    </PlatformGuard>
  );
}