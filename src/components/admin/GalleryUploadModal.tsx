'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Mask Mirage', 'Splash & Seduction', 'General'];

export default function GalleryUploadModal({ isOpen, onClose }: GalleryUploadModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ file: File; id: string; preview: string }[]>([]);
  const [uploadStats, setUploadStats] = useState({ total: 0, completed: 0 });
  
  const [meta, setFormData] = useState({
    eventName: '',
    date: '',
    category: 'General'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file, index) => ({
      file,
      id: `${file.name}-${index}`,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, 20));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';
    const uploadPreset = 'astrowave_preset';
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', 'astrowave/gallery/past-events');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: fd }
    );

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.secure_url;
  };

  const handleUploadAll = async () => {
    if (files.length === 0 || !meta.eventName) return;
    setLoading(true);
    setUploadStats({ total: files.length, completed: 0 });

    try {
      const uploadPromises = files.map(async ({ file }) => {
        const url = await uploadToCloudinary(file);
        const galleryData = {
          imageUrl: url,
          eventName: meta.eventName,
          date: meta.date,
          category: meta.category,
          uploadedAt: serverTimestamp()
        };
        const colRef = collection(db, 'gallery');

        addDoc(colRef, galleryData)
          .then(() => {
            setUploadStats(prev => ({ ...prev, completed: prev.completed + 1 }));
          })
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: colRef.path,
              operation: 'create',
              requestResourceData: galleryData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });
      });

      await Promise.all(uploadPromises);
      
      toast({ title: "Upload Process Finished", description: "Records are being synced to the gallery." });
      setTimeout(() => {
        setFiles([]);
        onClose();
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Some photos failed to upload to Cloudinary." });
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-[600px] glass p-8 border-t-2 border-t-gold max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white transition-colors"><X size={20} /></button>

        <div className="space-y-6">
          <div>
            <h2 className="font-display text-[1.8rem] text-white uppercase tracking-wider mb-2">UPLOAD EVENT PHOTOS</h2>
            <p className="text-xs text-muted">Photos will be added to the public experiences gallery.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="admin-label">Event Name</label>
              <input required type="text" className="admin-input" value={meta.eventName} onChange={e => setFormData({...meta, eventName: e.target.value})} placeholder="e.g. Mask Mirage Dec 2024" />
            </div>
            <div className="space-y-2">
              <label className="admin-label">Category</label>
              <select className="admin-input" value={meta.category} onChange={e => setFormData({...meta, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="relative h-48 rounded-sm bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center group cursor-pointer hover:border-gold/50 transition-colors">
            <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={loading} />
            <Upload size={32} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Click or drag to select photos</p>
            <p className="text-[0.6rem] text-muted">Up to 20 files, Max 8MB each</p>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
              {files.map(f => (
                <div key={f.id} className="relative aspect-square rounded-sm overflow-hidden border border-white/10">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(f.id)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors" disabled={loading}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-[0.6rem] text-muted uppercase tracking-widest">
                <span>Syncing {uploadStats.completed} of {uploadStats.total}</span>
                <span>{Math.round((uploadStats.completed / uploadStats.total) * 100)}%</span>
              </div>
              <Progress value={(uploadStats.completed / uploadStats.total) * 100} className="h-1 bg-white/5" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>CANCEL</Button>
            <Button disabled={loading || files.length === 0 || !meta.eventName} onClick={handleUploadAll}>
              {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> PROCESSING...</> : uploadStats.completed === uploadStats.total && uploadStats.total > 0 ? <><CheckCircle size={16} className="mr-2" /> DONE</> : 'UPLOAD ALL'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
