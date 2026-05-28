'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface BrandingRowProps {
  name: string;
  description: string;
  specs: string;
  dropText: string;
  field: string;
  folder: string;
  currentUrl: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  accept?: string;
  isPending?: boolean;
}

export default function BrandingRow({
  name,
  description,
  specs,
  dropText,
  field,
  folder,
  currentUrl,
  onUpload,
  onRemove,
  accept = "image/*",
  isPending = false
}: BrandingRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Basic validation
    if (field === 'heroVideoUrl' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    setUploading(true);
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('resourceType', field.includes('Video') ? 'video' : 'image');

      // Simulate progress for UI feel
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 200);

      const res = await fetch('/api/cloudinary/upload-brand', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(interval);
      const data = await res.json();
      
      if (data.url) {
        setProgress(100);
        setUploaded(true);
        onUpload(data.url);
        
        setTimeout(() => {
          setUploading(false);
          setUploaded(false);
          setProgress(0);
        }, 2000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
      setProgress(0);
      alert('Upload failed. Check console for details.');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const isVideo = field.includes('Video') || (currentUrl && currentUrl.match(/\.(mp4|webm|mov)$/i));

  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-6 lg:gap-10 py-10 border-b border-white/5 items-start relative transition-colors",
      isPending && "bg-green-500/[0.02]"
    )}>
      {isPending && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
      )}

      {/* LEFT — Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white uppercase tracking-tight">{name}</p>
          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        </div>
        <p className="text-[0.7rem] text-dark-subtext leading-relaxed">
          {description}
        </p>
        <div className="pt-2">
          <p className="text-[0.65rem] text-dark-muted font-mono whitespace-pre-line leading-tight">
            {specs}
          </p>
        </div>
      </div>

      {/* CENTER — Drop Zone */}
      <div 
        className={cn(
          "relative h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer",
          isDragging ? "border-green-500 bg-green-500/5" : "border-white/10 hover:border-white/20 bg-black/20",
          uploading && "pointer-events-none"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4 w-full px-12">
            {uploaded ? (
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Check size={20} strokeWidth={3} />
                </div>
                <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Uploaded ✓</p>
              </motion.div>
            ) : (
              <>
                <Loader2 className="animate-spin text-green-500" size={24} />
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[0.6rem] font-bold text-dark-muted uppercase">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <UploadCloud className={cn("transition-colors", isDragging ? "text-green-500" : "text-dark-muted")} size={32} />
            <div className="text-center">
              <p className="text-sm text-white font-medium">{dropText}</p>
              <p className="text-[0.7rem] text-green-500 font-bold uppercase tracking-widest mt-1 group-hover:underline">or click to browse</p>
            </div>
          </>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={onFileChange}
        />
      </div>

      {/* RIGHT — Preview */}
      <div className="space-y-4">
        <div className="h-32 rounded-lg border border-white/5 bg-dark-surface flex items-center justify-center overflow-hidden relative">
          {currentUrl ? (
            isVideo ? (
              <div className="relative w-full h-full">
                <video src={currentUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <RefreshCw className="text-white/20" size={24} />
                </div>
              </div>
            ) : (
              <img src={currentUrl} className="max-w-full max-h-full object-contain p-2" alt="Preview" />
            )
          ) : (
            <div className="text-white/[0.05]">
              <UploadCloud size={48} />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline-dark" 
            size="sm" 
            className="flex-1 h-9 text-[0.65rem] border-white/10"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            CHANGE
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-9 text-[0.65rem] border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            disabled={!currentUrl}
          >
            REMOVE
          </Button>
        </div>
      </div>
    </div>
  );
}