'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, Loader2, Save, ImageIcon, Instagram, Grid } from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

interface TalentFormProps {
  initialData?: any;
  id?: string;
}

const ROLES = ['DJ', 'Artist', 'Influencer', 'Model', 'Content Creator', 'Other'];

export default function TalentForm({ initialData, id }: TalentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    stageName: initialData?.stageName || '',
    role: initialData?.role || 'DJ',
    bio: initialData?.bio || '',
    imageUrl: initialData?.imageUrl || '',
    instagram: initialData?.instagram || '',
    active: initialData?.active !== undefined ? initialData.active : true,
  });

  const uploadToCloudinary = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'astrowave_preset');
    fd.append('folder', `astrowave/talent/${formData.role.toLowerCase()}s`);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) imageUrl = await uploadToCloudinary(imageFile);
      const talentData = { ...formData, imageUrl, updatedAt: serverTimestamp() };
      
      if (id) {
        await setDoc(doc(db, 'talent', id), talentData, { merge: true });
      } else {
        await addDoc(collection(db, 'talent'), { ...talentData, createdAt: serverTimestamp() });
      }
      toast({ title: "Talent Profile Saved" });
      router.push('/admin/talent');
    } catch (error) {
      toast({ variant: "destructive", title: "Error Saving Profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <Card className="p-8 space-y-6" glowColor="muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-label">Full Name *</label>
                <input required className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="admin-label">Stage Name *</label>
                <input required className="admin-input" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="admin-label">Role</label>
              <select className="admin-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="admin-label">Bio</label>
               <textarea rows={4} className="admin-input resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-[320px] space-y-6">
          <Card className="p-8 text-center space-y-6" glowColor="muted">
            <label className="admin-label">Profile Photo</label>
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-white/5 border border-dashed border-white/10">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="mx-auto mt-10 text-muted/20" size={32} />}
            </div>
            <div className="grid grid-cols-1 gap-2">
               <label className="h-10 flex items-center justify-center gap-2 border border-white/10 rounded-sm text-[0.6rem] font-bold uppercase cursor-pointer hover:bg-white/5">
                 <Upload size={12} /> Upload
                 <input type="file" className="hidden" onChange={e => {
                   const f = e.target.files?.[0];
                   if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); setFormData({...formData, imageUrl: ''}); }
                 }} />
               </label>
               <button type="button" onClick={() => setIsPickerOpen(true)} className="h-10 flex items-center justify-center gap-2 border border-purple/20 text-purple rounded-sm text-[0.6rem] font-bold uppercase hover:bg-purple/5">
                 <Grid size={12} /> Library
               </button>
            </div>
          </Card>
          <Button type="submit" disabled={loading} className="w-full h-14">
            {loading ? <Loader2 className="animate-spin" /> : 'SAVE TALENT'}
          </Button>
        </div>
      </div>
      <MediaPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={url => { setFormData({...formData, imageUrl: url}); setImagePreview(url); setImageFile(null); }}
        folders={['astrowave/talent/djs', 'astrowave/talent/artist']}
      />
    </form>
  );
}
