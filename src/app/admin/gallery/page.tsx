'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import GalleryUploadModal from '@/components/admin/GalleryUploadModal';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Mask Mirage', 'Splash & Seduction', 'General'];

export default function AdminGalleryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const galleryQuery = useMemoFirebase(() => {
    return query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
  }, [db]);

  const { data: gallery, loading } = useCollection(galleryQuery);

  const filteredGallery = useMemo(() => {
    if (!gallery) return [];
    if (activeTab === 'All') return gallery;
    return gallery.filter((item: any) => item.category === activeTab);
  }, [gallery, activeTab]);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'gallery', deleteModal.id));
      toast({ title: "Photo Deleted", description: "The image has been removed from the gallery." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete photo." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="admin-page-header mb-0">
          <h1 className="admin-page-title">Gallery Manager</h1>
          <p className="admin-page-subtitle">Curate and manage event photos for the past experiences gallery.</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus size={18} className="mr-2" /> UPLOAD PHOTOS
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "whitespace-nowrap px-6 py-2 rounded-full border text-[0.7rem] font-bold uppercase tracking-widest transition-all",
              activeTab === cat ? "bg-gold-dim text-gold border-gold" : "bg-white/5 text-muted border-transparent hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-md border border-white/5" />
          ))
        ) : filteredGallery.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item: any) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-md overflow-hidden bg-white/5 border border-white/5"
              >
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <Badge variant="active" className="text-[0.55rem] bg-black/50 border-white/10">{item.category}</Badge>
                    <button 
                      onClick={() => setDeleteModal({ isOpen: true, id: item.id })}
                      className="p-1.5 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 transition-colors hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.7rem] font-bold text-white truncate">{item.eventName}</p>
                    <p className="text-[0.6rem] text-muted truncate">{item.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-4 text-muted">
            <ImageIcon size={48} className="opacity-10" />
            <p>No gallery photos found for this category.</p>
          </div>
        )}
      </div>

      <GalleryUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        message="This photo will be permanently removed from the AstroWave gallery."
      />
    </div>
  );
}