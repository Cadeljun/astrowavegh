'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Loader2, Pencil, Eye, Camera, Globe, Instagram, Twitter, Phone, MapPin, Award, Zap, Building, Link as LinkIcon, Check } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn } from '@/lib/animations';
import { GHANA_CITIES, GHANA_REGIONS } from '@/lib/constants/ghana';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function OrganizerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  
  const [stats, setStats] = useState({ posted: 0, booked: 0, completed: 0 });
  const [formData, setFormData] = useState({
    displayName: '',
    company: '',
    phone: '',
    city: 'Accra',
    region: 'Greater Accra',
    bio: '',
    website: '',
    instagram: '',
    twitter: '',
    photoURL: ''
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // Load Profile
        const docRef = doc(db, 'organizer_profiles', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            displayName: data.displayName || user.displayName || '',
            company: data.company || '',
            phone: data.phone || '',
            city: data.city || 'Accra',
            region: data.region || 'Greater Accra',
            bio: data.bio || '',
            website: data.website || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            photoURL: data.photoURL || user.photoURL || ''
          });
        }

        // Load Platform Stats
        const eventsRef = collection(db, 'platform_events');
        const qTotal = query(eventsRef, where('organizerId', '==', user.uid));
        const qCompleted = query(eventsRef, where('organizerId', '==', user.uid), where('status', '==', 'completed'));
        const [totalSnap, completedSnap] = await Promise.all([
           getCountFromServer(qTotal),
           getCountFromServer(qCompleted)
        ]);
        
        setStats({
           posted: totalSnap.data().count,
           booked: 0, // Simplified for MVP
           completed: completedSnap.data().count
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'organizer_profiles', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      // Sync with base user if needed
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });
      
      toast({ title: "Profile Updated", description: "Your host identity has been synced." });
      setMode('view');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">HOST IDENTITY</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Manage your hosting credentials and brand presence</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setMode('view')}
              className={cn(
                "px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm",
                mode === 'view' ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              <Eye size={14} /> View
            </button>
            <button 
              onClick={() => setMode('edit')}
              className={cn(
                "px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm",
                mode === 'edit' ? "bg-white/10 text-white shadow-lg" : "text-muted hover:text-white"
              )}
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {mode === 'view' ? (
            <motion.div key="view" variants={scaleIn} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               {/* Left Side: Visuals & Stats */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl relative bg-surface group">
                     {formData.photoURL ? (
                       <img src={formData.photoURL} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-muted opacity-10"><User size={100} /></div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                     {[
                       { label: 'Events Posted', val: stats.posted, color: 'gold' },
                       { label: 'Talents Booked', val: stats.booked, color: 'purple' },
                       { label: 'Completed', val: stats.completed, color: 'cyan' },
                     ].map(s => (
                       <div key={s.label} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center group hover:border-white/20 transition-all">
                          <p className="text-4xl font-display text-white leading-none mb-1">{s.val}</p>
                          <p className="text-[0.6rem] label m-0 font-bold opacity-40 uppercase tracking-widest">{s.label}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Right Side: Details */}
               <div className="lg:col-span-8 space-y-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <h2 className="display-lg text-white text-glow-gold">{formData.displayName.toUpperCase()}</h2>
                       {formData.company && (
                          <div className="flex items-center gap-2 text-gold font-bold text-sm uppercase tracking-widest">
                             <Building size={16} /> {formData.company}
                          </div>
                       )}
                       <div className="flex items-center gap-6 text-muted font-bold text-xs uppercase tracking-widest mt-4">
                          <span className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> {formData.city}, {formData.region}, Ghana</span>
                       </div>
                    </div>
                    
                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                       <SectionLabel className="mb-0">BIO & VIBE</SectionLabel>
                       <p className="body-lg text-white/80 leading-relaxed whitespace-pre-wrap italic">
                         "{formData.bio || "No profile bio provided yet. Hosts with detailed bios build trust faster with premium talent."}"
                       </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                       {[
                         { icon: Instagram, url: formData.instagram, label: 'Instagram' },
                         { icon: Twitter, url: formData.twitter, label: 'Twitter' },
                         { icon: LinkIcon, url: formData.website, label: 'Website' },
                       ].map(s => s.url ? (
                         <a key={s.label} href={s.url} target="_blank" className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold hover:bg-gold/5 transition-all group">
                            <s.icon size={18} className="text-muted group-hover:text-gold transition-colors" />
                            <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest group-hover:text-white">{s.label}</span>
                         </a>
                       ) : null)}
                    </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.form key="edit" onSubmit={handleSave} variants={fadeUp} initial="hidden" animate="show" className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 {/* Left: Media */}
                 <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 text-center space-y-6 bg-[#16161F]/60" glowColor="muted">
                       <p className="admin-label">HOST PORTRAIT</p>
                       <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gold/20 bg-white/5 group shadow-2xl">
                          {formData.photoURL ? (
                            <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="mx-auto mt-16 text-muted/20" size={56} />
                          )}
                          <button 
                            type="button" 
                            onClick={() => setPickerOpen(true)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                          >
                            <Zap size={24} className="text-gold" />
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest">Update</span>
                          </button>
                       </div>
                       <Button type="button" variant="ghost" className="w-full h-12 border border-white/5 text-[0.65rem] font-bold" onClick={() => setPickerOpen(true)}>OPEN MEDIA LIBRARY</Button>
                    </Card>
                 </div>

                 {/* Right: Form */}
                 <div className="lg:col-span-8 space-y-8">
                    <Card className="p-10 space-y-8 bg-[#16161F]/60" glowColor="gold">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="admin-label">Full Name *</label>
                             <input required className="admin-input h-14" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
                          </div>
                          <div className="space-y-3">
                             <label className="admin-label">Company Name</label>
                             <input className="admin-input h-14" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Wave Productions" />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                             <label className="admin-label">Direct Contact *</label>
                             <input required type="tel" className="admin-input h-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+233..." />
                          </div>
                          <div className="space-y-3">
                             <label className="admin-label">Primary City *</label>
                             <select className="admin-input h-14" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="admin-label">Region</label>
                             <select className="admin-input h-14" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                                {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                             </select>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="admin-label flex justify-between">
                             <span>Host Biography</span>
                             <span className="text-[0.6rem] font-mono text-muted">{(formData.bio || '').length} / 300</span>
                          </label>
                          <textarea rows={5} maxLength={300} className="admin-input resize-none py-4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell talent about your event style and professional history..." />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                             <label className="admin-label flex items-center gap-2"><LinkIcon size={12} /> Website</label>
                             <input type="url" className="admin-input h-12" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                             <label className="admin-label flex items-center gap-2"><Instagram size={12} /> Instagram</label>
                             <input type="url" className="admin-input h-12" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                             <label className="admin-label flex items-center gap-2"><Twitter size={12} /> Twitter</label>
                             <input type="url" className="admin-input h-12" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} placeholder="https://..." />
                          </div>
                       </div>

                       <Button disabled={saving} type="submit" className="w-full h-16 text-lg font-bold tracking-[0.2em] shadow-[0_0_40px_rgba(255,209,102,0.2)]">
                          {saving ? <Loader2 className="animate-spin" /> : <><Check size={24} className="mr-3" /> COMMIT IDENTITY CHANGES</>}
                       </Button>
                    </Card>
                 </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <MediaPickerModal 
          isOpen={isPickerOpen} 
          onClose={() => setPickerOpen(false)} 
          onSelect={(url) => setFormData({...formData, photoURL: url})}
          folders={['astrowave/brand/avatars']}
        />
      </div>
    </PlatformGuard>
  );
}
