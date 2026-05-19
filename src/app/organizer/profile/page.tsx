'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Loader2, Pencil, Eye, Camera, Globe, Instagram, Twitter, Phone, MapPin, Award, Zap } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useToast } from '@/hooks/use-toast';
import { fadeUp, scaleIn } from '@/lib/animations';
import { GHANA_CITIES } from '@/lib/constants/ghana';
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
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ posted: 0, booked: 0, done: 0 });
  
  const [formData, setFormData] = useState({
    displayName: '',
    company: '',
    phone: '',
    city: 'Accra',
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
        const docRef = doc(db, 'organizer_profiles', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setFormData({
            displayName: data.displayName || user.displayName || '',
            company: data.company || '',
            phone: data.phone || '',
            city: data.city || 'Accra',
            bio: data.bio || '',
            website: data.website || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            photoURL: data.photoURL || user.photoURL || ''
          });
        }
        const eventsRef = collection(db, 'platform_events');
        const qAll = query(eventsRef, where('organizerId', '==', user.uid));
        const allSnap = await getCountFromServer(qAll);
        setStats({ posted: allSnap.data().count, booked: 0, done: 0 });
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'organizer_profiles', user.uid), { ...formData, updatedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', user.uid), { displayName: formData.displayName, photoURL: formData.photoURL });
      toast({ title: "Identity Updated" });
      setMode('view');
    } catch (error: any) { toast({ variant: "destructive", title: "Update Failed" }); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">IDENTITY PORTAL</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Manage your hosting presence and brand credentials</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
            <button onClick={() => setMode('view')} className={cn("px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm", mode === 'view' ? "bg-white/10 text-white" : "text-muted hover:text-white")}><Eye size={14} /> View</button>
            <button onClick={() => setMode('edit')} className={cn("px-8 py-3 flex items-center gap-2 font-bold text-[0.7rem] uppercase tracking-widest transition-all rounded-sm", mode === 'edit' ? "bg-white/10 text-white" : "text-muted hover:text-white")}><Pencil size={14} /> Edit</button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {mode === 'view' ? (
            <motion.div key="view" variants={scaleIn} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-4 space-y-8">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl relative bg-surface">
                     {formData.photoURL ? <img src={formData.photoURL} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" /> : <div className="w-full h-full flex items-center justify-center text-muted opacity-10"><User size={100} /></div>}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center"><p className="text-3xl font-display text-white">{stats.posted}</p><p className="text-[0.6rem] label m-0 font-bold opacity-40">Events Posted</p></div>
                  </div>
               </div>
               <div className="lg:col-span-8 space-y-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <h2 className="display-lg text-white text-glow-gold">{formData.displayName.toUpperCase()}</h2>
                       <div className="flex items-center gap-6 text-muted font-bold text-xs uppercase tracking-widest"><span className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> {formData.city}, Ghana</span></div>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4"><SectionLabel className="mb-0">ABOUT HOST</SectionLabel><p className="body-lg text-white/80 leading-relaxed italic">{formData.bio || "Host profile details coming soon."}</p></div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.form key="edit" onSubmit={handleSave} variants={fadeUp} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="p-8 text-center space-y-6 bg-[#16161F]/60" glowColor="muted">
                    <p className="admin-label">HOST PORTRAIT</p>
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-gold/20 bg-white/5 group">
                       {formData.photoURL ? <img src={formData.photoURL} alt="" className="w-full h-full object-cover" /> : <Camera className="mx-auto mt-14 text-muted/20" size={48} />}
                       <button type="button" onClick={() => setPickerOpen(true)} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"><Zap size={24} className="text-gold" /><span className="text-[0.5rem] font-bold uppercase tracking-widest">Update</span></button>
                    </div>
                 </Card>
                 <Card className="lg:col-span-2 p-10 space-y-8 bg-[#16161F]/60" glowColor="gold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3"><label className="admin-label">Full Name *</label><input required className="admin-input h-14" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} /></div>
                       <div className="space-y-3"><label className="admin-label">Company Name</label><input className="admin-input h-14" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3"><label className="admin-label">Direct Contact *</label><input required className="admin-input h-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                       <div className="space-y-3"><label className="admin-label">Primary City *</label><select className="admin-input h-14" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>{GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div className="space-y-3"><label className="admin-label">Host Bio</label><textarea rows={4} maxLength={300} className="admin-input resize-none py-4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
                    <Button disabled={saving} type="submit" className="w-full h-16 text-lg font-bold tracking-widest">{saving ? <Loader2 className="animate-spin" /> : <><Save size={24} className="mr-3" /> SAVE PROFILE</>}</Button>
                 </Card>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        <MediaPickerModal isOpen={isPickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => setFormData({...formData, photoURL: url})} folders={['astrowave/brand/avatars']} />
      </div>
    </PlatformGuard>
  );
}