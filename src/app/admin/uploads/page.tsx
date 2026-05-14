'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText,
  Film,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { collection, query, orderBy, limit, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const FOLDERS = [
  'Events/Mask Mirage',
  'Events/Splash & Seduction',
  'Events/General',
  'Talent/DJs',
  'Talent/Artist',
  'Brand/Logos',
  'Brand/Backgrounds',
  'Videos/Hero',
  'Videos/Events',
  'Gallery/Past Events',
];

export default function AdminUploadsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0]);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number; status: 'waiting' | 'uploading' | 'complete' | 'failed' }[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  const { data: uploads, loading } = useCollection(
    query(collection(db, 'uploads'), orderBy('uploadedAt', 'desc'), limit(50))
  );

  const filteredUploads = useMemo(() => {
    if (!uploads) return [];
    if (activeTab === 'All') return uploads;
    if (activeTab === 'Images') return uploads.filter((u: any) => u.fileType?.startsWith('image'));
    if (activeTab === 'Videos') return uploads.filter((u: any) => u.fileType?.startsWith('video'));
    return uploads;
  }, [uploads, activeTab]);

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';
    const uploadPreset = 'astrowave_preset';
    const isVideo = file.type.startsWith('video');
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', `astrowave/${selectedFolder.toLowerCase().replace(' ', '-')}`);

    const response = await fetch(endpoint, { method: 'POST', body: fd });
    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);
    
    // Add to queue
    const queueItems = fileList.map(f => ({ name: f.name, progress: 0, status: 'waiting' as const }));
    setUploadingFiles(prev => [...prev, ...queueItems]);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        setUploadingFiles(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(item => item.name === file.name && item.status === 'waiting');
          if (idx !== -1) updated[idx].status = 'uploading';
          return updated;
        });

        const result = await uploadToCloudinary(file);
        
        await addDoc(collection(db, 'uploads'), {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          cloudinaryUrl: result.secure_url,
          folder: selectedFolder,
          uploadedAt: serverTimestamp()
        });

        setUploadingFiles(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(item => item.name === file.name && item.status === 'uploading');
          if (idx !== -1) {
            updated[idx].status = 'complete';
            updated[idx].progress = 100;
          }
          return updated;
        });
      } catch (err) {
        setUploadingFiles(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(item => item.name === file.name && item.status === 'uploading');
          if (idx !== -1) updated[idx].status = 'failed';
          return updated;
        });
      }
    }

    setTimeout(() => setUploadingFiles([]), 5000);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Cloudinary URL copied to clipboard." });
  };

  const deleteFile = async (id: string) => {
    if (!window.confirm('Delete this media asset from records? (Does not remove from Cloudinary)')) return;
    try {
      await deleteDoc(doc(db, 'uploads', id));
      toast({ title: "Asset record removed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <div className="space-y-10">
      <div className="admin-page-header mb-0">
        <h1 className="admin-page-title">Media Uploads</h1>
        <p className="admin-page-subtitle">Central management for all AstroWave digital assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-10 text-center space-y-6 border-dashed border-2" glowColor="gold">
            <div className="relative">
              <Upload size={48} className="mx-auto text-gold mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-display text-white tracking-widest uppercase">Select files to upload</p>
                <p className="text-xs text-muted">JPG, PNG, WEBP, MP4, MOV. Max 100MB videos / 8MB images.</p>
              </div>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FolderOpen size={16} className="text-muted" />
                <span className="text-[0.65rem] admin-label m-0">Destination Folder</span>
              </div>
              <select 
                className="admin-input h-12 w-full max-w-sm mx-auto"
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
              >
                {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </Card>

          {uploadingFiles.length > 0 && (
            <div className="space-y-4">
              <p className="admin-label">UPLOAD QUEUE</p>
              <div className="space-y-2">
                {uploadingFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-sm bg-white/5 border border-white/10">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium truncate max-w-[200px]">{file.name}</span>
                        {file.status === 'uploading' && <Loader2 size={14} className="animate-spin text-gold" />}
                        {file.status === 'complete' && <CheckCircle size={14} className="text-green-500" />}
                        {file.status === 'failed' && <XCircle size={14} className="text-red-500" />}
                      </div>
                      {file.status === 'uploading' && <Progress value={file.progress} className="h-1 bg-white/10" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <Card className="p-8 space-y-6" glowColor="muted">
            <h3 className="admin-label">Storage Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[0.7rem] text-muted">Cloudinary Tier</span>
                <span className="text-xs font-bold text-white uppercase">Free</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[0.7rem] text-muted">Assets Logged</span>
                <span className="text-xs font-bold text-white">{uploads?.length || 0}</span>
              </div>
              <p className="text-[0.65rem] text-muted leading-relaxed">
                Assets uploaded here are accessible via their direct URLs. Ensure you select the correct folder to keep the library organized.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex gap-4">
            {['All', 'Images', 'Videos'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[0.65rem] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all",
                  activeTab === tab ? "bg-white/10 text-white border-white/10" : "text-muted border-transparent hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-md" />)
          ) : filteredUploads.map((asset: any) => (
            <div key={asset.id} className="group relative aspect-square rounded-md overflow-hidden bg-surface border border-white/5">
              {asset.fileType.startsWith('image') ? (
                <img src={asset.cloudinaryUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted">
                  <Film size={24} />
                  <span className="text-[0.5rem] uppercase font-bold tracking-tighter">VIDEO</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[0.6rem] font-bold text-white truncate" title={asset.fileName}>{asset.fileName}</p>
                  <p className="text-[0.5rem] text-muted truncate">{asset.folder}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyUrl(asset.cloudinaryUrl)}
                    className="flex-1 py-1.5 rounded-sm bg-white/10 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-1"
                  >
                    <Copy size={10} /> URL
                  </button>
                  <button 
                    onClick={() => deleteFile(asset.id)}
                    className="p-1.5 rounded-sm bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
