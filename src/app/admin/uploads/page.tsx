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
  FolderOpen,
  ExternalLink,
  Plus,
  Divider
} from 'lucide-react';
import { collection, query, orderBy, limit, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ALL_BRAND_PATHS } from '@/lib/cloudinary';

export default function AdminUploadsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedFolder, setSelectedFolder] = useState(ALL_BRAND_PATHS[0]);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number; status: 'waiting' | 'uploading' | 'complete' | 'failed' }[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const uploadsQuery = useMemoFirebase(() => {
    return query(collection(db, 'uploads'), orderBy('uploadedAt', 'desc'), limit(100));
  }, [db]);

  const { data: uploads, loading } = useCollection(uploadsQuery);

  const filteredUploads = useMemo(() => {
    if (!uploads) return [];
    let result = uploads;
    if (activeTab === 'Images') result = result.filter((u: any) => u.fileType?.startsWith('image'));
    if (activeTab === 'Videos') result = result.filter((u: any) => u.fileType?.startsWith('video'));
    if (searchTerm) result = result.filter((u: any) => u.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [uploads, activeTab, searchTerm]);

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';
    const uploadPreset = 'astrowave_preset';
    const isVideo = file.type.startsWith('video');
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', selectedFolder);

    const response = await fetch(endpoint, { method: 'POST', body: fd });
    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);
    
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
          publicId: result.public_id,
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
    toast({ title: "Link Copied", description: "URL copied to clipboard." });
  };

  const deleteFile = async (asset: any) => {
    if (!window.confirm('Purge this asset from Cloudinary and Registry?')) return;
    try {
      const cloudRes = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: asset.publicId, resourceType: asset.fileType?.startsWith('video') ? 'video' : 'image' })
      });
      
      const cloudData = await cloudRes.json();
      
      if (cloudData.success) {
        await deleteDoc(doc(db, 'uploads', asset.id));
        toast({ title: "Asset purged successfully" });
      } else {
        throw new Error('Cloudinary deletion failed');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Termination Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="admin-page-header mb-0">
        <h1 className="admin-page-title">Digital Assets</h1>
        <p className="admin-page-subtitle">Manage media assets and library content linked to schema folders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-10 text-center space-y-6 border-dashed border-2 bg-black/20" glowColor="gold">
            <div className="relative">
              <Upload size={48} className="mx-auto text-gold mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <p className="text-lg font-display text-white tracking-widest uppercase">Drop or click to upload</p>
                <p className="text-[0.65rem] text-muted font-mono">JPG, PNG, WEBP, MP4, MOV (MAX 100MB)</p>
              </div>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FolderOpen size={16} className="text-muted" />
                <span className="text-[0.6rem] admin-label m-0">Schema Destination</span>
              </div>
              <select 
                className="admin-input h-12 w-full max-w-xs mx-auto text-center"
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
              >
                {ALL_BRAND_PATHS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </Card>

          {uploadingFiles.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <p className="admin-label text-gold font-bold">ACTIVE UPLOADS</p>
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

        <div className="space-y-6">
          <Card className="p-8 space-y-6" glowColor="muted">
            <h3 className="admin-label">Registry Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[0.7rem] text-muted">Cloud Status</span>
                <Badge variant="active" className="text-[0.6rem]">LIVE</Badge>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[0.7rem] text-muted">Total Indexed</span>
                <span className="text-lg font-display text-white">{uploads?.length || 0} Assets</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <p className="text-[0.65rem] text-muted leading-relaxed italic">
                Media uploaded here is tagged with a strict folder path in Firestore. This allows the system to correctly identify which assets belong to specific platform sections.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex gap-2 bg-black/40 p-1 rounded-sm border border-white/5">
            {['All', 'Images', 'Videos'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[0.65rem] font-bold uppercase tracking-widest px-6 py-2 rounded-sm transition-all",
                  activeTab === tab ? "bg-white/10 text-white" : "text-muted hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" placeholder="Filter by name..." 
              className="admin-input pl-9 h-11"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-sm border border-white/10" />)
          ) : filteredUploads.length > 0 ? (
            filteredUploads.map((asset: any) => (
              <motion.div 
                key={asset.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square rounded-sm overflow-hidden bg-surface border border-white/5"
              >
                {asset.fileType?.startsWith('image') ? (
                  <img src={asset.cloudinaryUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/40">
                    <Film size={28} className="text-gold" />
                    <span className="text-[0.55rem] uppercase font-bold tracking-widest text-muted">VIDEO_SRC</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[0.7rem] font-bold text-white truncate" title={asset.fileName}>{asset.fileName}</p>
                    <p className="text-[0.55rem] text-gold uppercase font-mono tracking-tighter truncate">{asset.folder}</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => copyUrl(asset.cloudinaryUrl)}
                      className="w-full py-2 rounded-sm bg-white/10 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={12} /> COPY URL
                    </button>
                    <div className="flex gap-2">
                      <a 
                        href={asset.cloudinaryUrl} 
                        target="_blank" 
                        className="flex-1 py-2 rounded-sm bg-white/5 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button 
                        onClick={() => deleteFile(asset)}
                        className="p-2 rounded-sm bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center flex flex-col items-center gap-4 text-muted border border-dashed border-white/10 rounded-sm">
              <ImageIcon size={48} className="opacity-10" />
              <p className="text-sm">No assets found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
