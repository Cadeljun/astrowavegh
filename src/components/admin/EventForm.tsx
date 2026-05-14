'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface EventFormProps {
  initialData?: any;
  id?: string;
}

const CATEGORIES = ['Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals', 'Other'];

export default function EventForm({ initialData, id }: EventFormProps) {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Parties',
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
    venue: initialData?.venue || '',
    ticketLink: initialData?.ticketLink || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription: initialData?.fullDescription || '',
    imageUrl: initialData?.imageUrl || '',
    active: initialData?.active !== undefined ? initialData.active : true,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 5MB" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';
    const uploadPreset = 'astrowave_preset';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `astrowave/events/${formData.get('category')}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Failed to upload image');
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

      const eventData = {
        ...formData,
        imageUrl,
        date: new Date(formData.date).toISOString(),
        updatedAt: serverTimestamp(),
      };

      if (id) {
        const docRef = doc(db, 'events', id);
        setDoc(docRef, eventData, { merge: true })
          .catch(async () => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
               path: docRef.path,
               operation: 'update',
               requestResourceData: eventData
             }));
          });
      } else {
        const colRef = collection(db, 'events');
        addDoc(colRef, { ...eventData, createdAt: serverTimestamp() })
          .catch(async () => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
               path: colRef.path,
               operation: 'create',
               requestResourceData: eventData
             }));
          });
      }

      setUploadProgress(100);
      toast({ title: id ? "Event Updated" : "Event Created", description: `${formData.name} is now saved.` });
      router.push('/admin/events');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save event." });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <Card className="p-8 space-y-6" glowColor="muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-label">Event Name *</label>
                <input
                  required
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mask Mirage"
                />
              </div>
              <div className="space-y-2">
                <label className="admin-label">Category *</label>
                <select
                  className="admin-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="admin-label">Date & Time *</label>
                <input
                  required
                  type="datetime-local"
                  className="admin-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="admin-label">Venue *</label>
                <input
                  required
                  type="text"
                  className="admin-input"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Labadi Beach"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="admin-label">Ticket Link</label>
              <input
                type="url"
                className="admin-input"
                value={formData.ticketLink}
                onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
                placeholder="https://egotickets.com/..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="admin-label">Short Description *</label>
                <span className="text-[0.6rem] text-muted">{formData.shortDescription.length}/200</span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={200}
                className="admin-input resize-none"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="A brief hook for the event card..."
              />
            </div>

            <div className="space-y-2">
              <label className="admin-label">Full Description</label>
              <textarea
                rows={6}
                className="admin-input resize-none"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="Deep dive into what makes this event special..."
              />
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
                <p className="text-sm font-medium text-white">{formData.active ? 'Event is Active' : 'Event is Hidden'}</p>
                <p className="text-xs text-muted">Toggle visibility on the main website.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[380px] space-y-6">
          <Card className="p-8 space-y-6" glowColor="muted">
            <label className="admin-label">Event Media</label>
            
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Upload size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-4 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted">
                    <ImageIcon size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-white">Upload Image</p>
                    <p className="text-[0.65rem] text-muted">JPG, PNG or WEBP. Max 5MB.</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-[0.6rem] text-muted uppercase tracking-widest">
                  <span>Uploading Media</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1 bg-white/5" />
              </div>
            )}

            <div className="space-y-2">
              <label className="admin-label">Image URL</label>
              <input
                readOnly
                type="text"
                className="admin-input opacity-50 cursor-not-allowed"
                value={formData.imageUrl}
                placeholder="Auto-filled after upload"
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              disabled={loading}
              type="submit"
              size="lg"
              className="w-full h-14"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  SAVE EVENT
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="w-full h-12 border border-white/5"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
