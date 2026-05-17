'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, Loader2, Save, ImageIcon, Instagram } from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    stageName: initialData?.stageName || '',
    role: initialData?.role || 'DJ',
    bio: initialData?.bio || '',
    imageUrl: initialData?.imageUrl || '',
    instagram: initialData?.instagram || '',
    soundcloud: initialData?.soundcloud || '',
    spotify: initialData?.spotify || '',
    tiktok: initialData?.tiktok || '',
    youtube: initialData?.youtube || '',
    active: initialData?.active !== undefined ? initialData.active : true,
  });

  useEffect(() => {
    if (searchParams.get('prefill') === 'true') {
      const prefillData = sessionStorage.getItem('prefill_talent');
      if (prefillData) {
        const data = JSON.parse(prefillData);
        setFormData(prev => ({
          ...prev,
          ...data
        }));
        sessionStorage.removeItem('prefill_talent');
        toast({ title: "Data pre-filled", description: "Profile data loaded from inquiry." });
      }
    }
  }, [searchParams, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 3MB" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';
    const uploadPreset = 'astrowave_preset';
    
    const fd = new FormData();
    const folder = formData.role === 'DJ' ? 'astrowave/talent/djs' : 'astrowave/talent/artists';
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: fd }
    );

    if (!response.ok) throw new Error('Failed to upload profile photo');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        setUploadProgress(30);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploadProgress(70);
      }

      const talentData = {
        ...formData,
        imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        const docRef = doc(db, 'talent', id);
        setDoc(docRef, talentData, { merge: true })
          .catch(async () => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
               path: docRef.path,
               operation: 'update',
               requestResourceData: talentData
             }));
          });
      } else {
        const colRef = collection(db, 'talent');
        addDoc(colRef, { ...talentData, createdAt: serverTimestamp() })
          .catch(async () => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
               path: colRef.path,
               operation: 'create',
               requestResourceData: talentData
             }));
          });
      }

      setUploadProgress(100);
      toast({ title: id ? "Talent Updated" : "Talent Added", description: `${formData.name} is now in the roster.` });
      router.push('/admin/talent');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save talent." });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
                <input
                  required
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Calvin Mensah"
                />
              </div>
              <div className="space-y-2">
                <label className="admin-label">Stage Name *</label>
                <input
                  required
                  type="text"
                  className="admin-input"
                  value={formData.stageName}
                  onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                  placeholder="e.g. DJ Horizon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label">Role *</label>
              <select
                className="admin-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="admin-label">Bio *</label>
                <span className="text-[0.6rem] text-muted">{formData.bio.length}/300</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={300}
                className="admin-input resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief professional bio..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-label flex items-center gap-2"><Instagram size={12} /> Instagram URL</label>
                <input
                  type="url"
                  className="admin-input"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="admin-label flex items-center gap-2">SoundCloud URL</label>
                <input
                  type="url"
                  className="admin-input"
                  value={formData.soundcloud}
                  onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
                  placeholder="https://soundcloud.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="admin-label">Spotify URL</label>
                <input type="url" className="admin-input" value={formData.spotify} onChange={e => setFormData({...formData, spotify: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="admin-label">TikTok URL</label>
                <input type="url" className="admin-input" value={formData.tiktok} onChange={e => setFormData({...formData, tiktok: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="admin-label">YouTube URL</label>
                <input type="url" className="admin-input" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-sm bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-white">Active Status</p>
                <p className="text-xs text-muted">Whether this talent is displayed on the site.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-[320px] space-y-6">
          <Card className="p-8 text-center space-y-6" glowColor="muted">
            <label className="admin-label text-center">Profile Photo</label>
            
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-white/5 border border-dashed border-white/10 group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Upload size={16} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
                  <ImageIcon size={24} className="text-muted" />
                  <p className="text-[0.6rem] text-muted">Upload</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {loading && uploadProgress > 0 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-1 bg-white/5" />
                <p className="text-[0.55rem] text-muted uppercase tracking-widest">{uploadProgress}% Uploaded</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="admin-label">Image URL</label>
              <input readOnly type="text" className="admin-input text-[0.7rem] opacity-50 truncate" value={formData.imageUrl} placeholder="Auto-filled" />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button disabled={loading} type="submit" size="lg" className="w-full h-14">
              {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> SAVING...</> : <><Save size={18} className="mr-2" /> SAVE TALENT</>}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full h-12 border border-white/5">CANCEL</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
