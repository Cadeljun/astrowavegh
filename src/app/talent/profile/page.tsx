
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Music, Instagram, Globe, Loader2, Camera, Link as LinkIcon } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { fadeUp } from '@/lib/animations';

export default function TalentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    stageName: '',
    role: 'DJ',
    bio: '',
    instagram: '',
    soundcloud: '',
    spotify: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const docRef = doc(db, 'talent_profiles', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            stageName: data.stageName || '',
            role: data.role || 'DJ',
            bio: data.bio || '',
            instagram: data.instagram || '',
            soundcloud: data.soundcloud || '',
            spotify: data.spotify || '',
          });
        }
      } catch (error) {
        console.error('Error loading talent profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'talent_profiles', user.uid);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Profile Updated", description: "Your artist profile is now live." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="display-md text-white">ARTIST PROFILE</h1>
        <p className="body-md text-muted">This data is used to match you with event organizers.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="admin-label">STAGE NAME</label>
                <div className="relative">
                  <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    required 
                    placeholder="e.g. DJ Horizon" 
                    className="admin-input pl-12 h-14" 
                    value={formData.stageName} 
                    onChange={e => setFormData({ ...formData, stageName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">ARTIST ROLE</label>
                <select 
                  className="admin-input h-14" 
                  value={formData.role} 
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="DJ">DJ</option>
                  <option value="Artist">Vocalist / Artist</option>
                  <option value="Producer">Producer</option>
                  <option value="Host">MC / Host</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label">ARTIST BIO</label>
              <textarea 
                rows={5} 
                placeholder="Tell organizers about your sound, experience, and energy..." 
                className="admin-input min-h-[120px] resize-none" 
                value={formData.bio} 
                onChange={e => setFormData({ ...formData, bio: e.target.value })} 
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Card className="p-8 space-y-6" glowColor="purple">
            <h3 className="admin-label text-purple">Social Links & Portfolios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-label flex items-center gap-2"><Instagram size={14} /> Instagram URL</label>
                <input type="url" className="admin-input" placeholder="https://instagram.com/..." value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="admin-label flex items-center gap-2"><LinkIcon size={14} /> SoundCloud URL</label>
                <input type="url" className="admin-input" placeholder="https://soundcloud.com/..." value={formData.soundcloud} onChange={e => setFormData({ ...formData, soundcloud: e.target.value })} />
              </div>
              <div className="col-span-full space-y-2">
                <label className="admin-label flex items-center gap-2"><Globe size={14} /> Spotify Artist Link</label>
                <input type="url" className="admin-input" placeholder="https://open.spotify.com/artist/..." value={formData.spotify} onChange={e => setFormData({ ...formData, spotify: e.target.value })} />
              </div>
            </div>
          </Card>
        </motion.div>

        <Button type="submit" disabled={saving} className="w-full h-16 border-purple text-purple hover:bg-purple hover:text-white text-lg">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
          {saving ? 'SAVING PROFILE...' : 'UPDATE ROSTER PROFILE'}
        </Button>
      </form>
    </div>
  );
}
