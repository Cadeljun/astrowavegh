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
  Link as LinkIcon, 
  Plus, 
  X, 
  Eye, 
  Pencil, 
  MapPin, 
  Zap, 
  Video,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  Twitter,
  Youtube
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations';
import { GHANA_CITIES } from '@/lib/constants/ghana';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { cn } from '@/lib/utils';

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
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
      <header className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="display-md text-white uppercase">{mode === 'view' ? 'Public Identity' : 'Manage Presence'}</h1>
          <p className="text-xs text-muted uppercase tracking-[0.3em]">
            {mode === 'view' ? 'Organizer Preview Mode' : 'Editing Profile Data'}
          </p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
          <button 
            onClick={() => setMode('view')}
            className={cn(
              "px-6 py-2 flex items-center gap-2 font-bold text-[0.65rem] uppercase tracking-widest transition-all",
              mode === 'view' ? "bg-white/10 text-white" : "text-muted hover:text-white"
            )}
          >
            <Eye size={14} /> Preview
          </button>
          <button 
            onClick={() => setMode('edit')}
            className={cn(
              "px-6 py-2 flex items-center gap-2 font-bold text-[0.65rem] uppercase tracking-widest transition-all",
              mode === 'edit' ? "bg-white/10 text-white" : "text-muted hover:text-white"
            )}
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === 'view' ? (
          <motion.div key="view" variants={staggerContainer} initial="hidden" animate="show" className="space-y-12">
            {/* View Mode Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
               <motion.div variants={scaleIn} className="lg:col-span-4 aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-muted italic">No Photo</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6">
                    <Badge variant="live" className={cn(formData.available ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                      {formData.available ? 'AVAILABLE NOW' : 'OFF DUTY'}
                    </Badge>
                  </div>
               </motion.div>

               <div className="lg:col-span-8 space-y-8">
                  <motion.div variants={fadeUp} className="space-y-4">
                    <div className="flex items-center gap-4">
                       <Badge variant="active" className="bg-purple-dim text-purple border-purple">{formData.category}</Badge>
                       {formData.subcategory && <span className="text-[0.65rem] text-muted font-bold uppercase tracking-widest">• {formData.subcategory}</span>}
                    </div>
                    <h2 className="display-xl text-white text-glow-purple">{formData.stageName}</h2>
                    <div className="flex flex-wrap items-center gap-6 text-muted font-bold text-xs uppercase tracking-[0.15em]">
                       <span className="flex items-center gap-2"><MapPin size={14} className="text-purple" /> {formData.city}, {formData.country}</span>
                       <span className="flex items-center gap-2 text-gold"><Zap size={14} className="text-gold" /> Wave Score: {(formData.waveScore || 0).toFixed(1)}</span>
                       <span className="flex items-center gap-2 text-white"><Star size={14} className="text-purple" /> {(formData.averageRating || 0).toFixed(1)} Avg Rating</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="p-8 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                     <p className="admin-label text-purple">Biography</p>
                     <p className="body-lg text-white/80 leading-relaxed whitespace-pre-wrap">{formData.bio || "This artist hasn't written a bio yet."}</p>
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
                        <a key={i} href={s.url} target="_blank" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-purple transition-all group">
                          <s.icon size={20} className="text-muted group-hover:text-purple transition-colors" />
                          <span className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">{s.label}</span>
                        </a>
                      ) : null
                    ))}
                  </motion.div>
               </div>
            </div>

            {/* Portfolio View */}
            <motion.section variants={fadeUp} className="space-y-8">
               <SectionLabel>PORTFOLIO REEL</SectionLabel>
               {formData.portfolio?.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.portfolio.map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 group relative">
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink size={24} className="text-white" />
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-20 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 opacity-20">
                    <p className="text-xs font-bold uppercase tracking-widest">No portfolio items added</p>
                 </div>
               )}
            </motion.section>

            {/* Demo Reel View */}
            <motion.section variants={fadeUp} className="space-y-8">
               <SectionLabel>DEMO REEL</SectionLabel>
               {formData.demoReel ? (
                 <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl relative group">
                    <video src={formData.demoReel} controls className="w-full h-full" poster={formData.photoURL} />
                 </div>
               ) : (
                 <div className="py-20 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 opacity-20">
                    <Video size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No demo reel uploaded</p>
                 </div>
               )}
            </motion.section>
          </motion.div>
        ) : (
          <motion.form key="edit" onSubmit={handleSave} variants={fadeUp} initial="hidden" animate="show" className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               <div className="lg:col-span-2 space-y-8">
                  <Card className="p-8 space-y-6" glowColor="muted">
                    <p className="admin-label text-purple">Core Identity</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="admin-label">Stage Name *</label>
                        <input required className="admin-input" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label">Full Name</label>
                        <input required className="admin-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="admin-label">Category</label>
                        <select className="admin-input h-11" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label">Subcategory / Genre</label>
                        <input className="admin-input" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} placeholder="e.g. Afrobeats, Amapiano" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">Bio (Max 500 chars) *</label>
                      <textarea rows={6} maxLength={500} className="admin-input resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                      <p className="text-[10px] text-right text-muted">{(formData.bio || '').length} / 500</p>
                    </div>
                  </Card>

                  <Card className="p-8 space-y-6" glowColor="muted">
                    <p className="admin-label text-gold">Commercial Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="admin-label">Base Price</label>
                          <div className="flex gap-2">
                             <input type="number" className="admin-input flex-1" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
                             <select className="admin-input w-24 h-11" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                               <option value="GHS">GHS</option>
                               <option value="USD">USD</option>
                             </select>
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-4 rounded bg-white/5 border border-white/5 mt-6">
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Price Negotiable?</span>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, priceNegotiable: !formData.priceNegotiable})}
                            className={cn("w-12 h-6 rounded-full p-1 transition-colors", formData.priceNegotiable ? "bg-gold" : "bg-white/10")}
                          >
                             <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", formData.priceNegotiable ? "translate-x-6" : "translate-x-0")} />
                          </button>
                       </div>
                    </div>
                  </Card>

                  <Card className="p-8 space-y-6" glowColor="muted">
                    <p className="admin-label text-cyan">Social Connection</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {[
                         { icon: Instagram, key: 'instagram', label: 'Instagram' },
                         { icon: Music, key: 'soundcloud', label: 'SoundCloud' },
                         { icon: Globe, key: 'spotify', label: 'Spotify' },
                         { icon: Youtube, key: 'youtube', label: 'YouTube' },
                         { icon: Twitter, key: 'twitter', label: 'Twitter/X' },
                       ].map(s => (
                         <div key={s.key} className="space-y-2">
                            <label className="admin-label flex items-center gap-2"><s.icon size={12} /> {s.label}</label>
                            <input type="url" className="admin-input" value={formData[s.key] || ''} onChange={e => setFormData({...formData, [s.key]: e.target.value})} placeholder="https://..." />
                         </div>
                       ))}
                    </div>
                  </Card>
               </div>

               <aside className="space-y-8">
                  <Card className="p-8 text-center space-y-6" glowColor="muted">
                    <p className="admin-label">Profile Photo</p>
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-2 border-purple/20 bg-white/5 relative group">
                       {formData.photoURL ? (
                         <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <Camera className="mx-auto mt-10 text-muted/20" size={32} />
                       )}
                       <button 
                        type="button"
                        onClick={() => { setPickerTarget('photo'); setPickerOpen(true); }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                       >
                         <Camera size={24} />
                       </button>
                    </div>
                    <Button type="button" variant="ghost" className="w-full h-10 border border-white/10 text-[0.6rem]" onClick={() => { setPickerTarget('photo'); setPickerOpen(true); }}>CHANGE PHOTO</Button>
                  </Card>

                  <Card className="p-8 space-y-6" glowColor="muted">
                    <div className="flex justify-between items-center">
                       <p className="admin-label m-0">Portfolio (Max 8)</p>
                       <span className="text-[10px] text-muted">{formData.portfolio?.length || 0}/8</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {formData.portfolio?.map((img: string, i: number) => (
                         <div key={i} className="relative aspect-square rounded-sm overflow-hidden border border-white/5 group">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button onClick={() => removePortfolioItem(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                         </div>
                       ))}
                       {(formData.portfolio?.length || 0) < 8 && (
                         <button 
                            type="button"
                            onClick={() => { setPickerTarget('portfolio'); setPickerOpen(true); }}
                            className="aspect-square rounded-sm bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-muted hover:bg-white/10 transition-colors"
                         >
                           <Plus size={16} />
                         </button>
                       )}
                    </div>
                  </Card>

                  <Card className="p-8 space-y-6" glowColor="muted">
                     <p className="admin-label">Demo Reel (MP4)</p>
                     <div className="aspect-video rounded bg-black flex items-center justify-center border border-white/5 relative overflow-hidden group">
                        {formData.demoReel ? (
                           <video src={formData.demoReel} className="w-full h-full" />
                        ) : (
                           <Video size={32} className="text-muted/20" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => { setPickerTarget('video'); setPickerOpen(true); }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-[0.6rem] uppercase tracking-widest"
                        >
                          Upload Video
                        </button>
                     </div>
                  </Card>

                  <Button disabled={saving} type="submit" className="w-full h-16 text-lg font-bold tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} className="mr-2" /> SAVE PROFILE</>}
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
  );
}
