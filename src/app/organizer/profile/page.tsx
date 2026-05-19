
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Loader2, CheckCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { fadeUp } from '@/lib/animations';

export default function OrganizerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || '',
            email: data.email || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
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
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="display-md text-white">ORGANIZER PROFILE</h1>
        <p className="body-md text-muted">Manage your identity on the AstroWave platform.</p>
      </header>

      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  required 
                  className="admin-input pl-12 h-14" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted opacity-50" size={18} />
                <input 
                  disabled 
                  className="admin-input pl-12 h-14 opacity-50 cursor-not-allowed" 
                  value={formData.email} 
                />
              </div>
              <p className="text-[0.65rem] text-muted italic">Email address cannot be changed from the profile dashboard.</p>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving} className="w-full h-14">
                {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
