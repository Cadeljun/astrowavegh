'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Instagram, CheckCircle, Trash2, UserPlus, Copy } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: any;
  onDelete: (id: string) => void;
}

export default function InquiryModal({ isOpen, onClose, inquiry, onDelete }: InquiryModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formattedDate, setFormattedDate] = useState('...');

  useEffect(() => {
    if (isOpen && inquiry && !inquiry.read) {
      const docRef = doc(db, 'talent_inquiries', inquiry.id);
      const updateData = { read: true };

      updateDoc(docRef, updateData)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
    if (inquiry && inquiry.timestamp) {
      setFormattedDate(format(inquiry.timestamp.toDate(), 'PPP • p'));
    }
  }, [isOpen, inquiry]);

  if (!inquiry) return null;

  const handleAddToRoster = () => {
    const data = {
      name: inquiry.name,
      stageName: inquiry.stageName,
      role: inquiry.role,
      email: inquiry.email,
      bio: inquiry.bio,
      instagram: inquiry.socialLink
    };
    sessionStorage.setItem('prefill_talent', JSON.stringify(data));
    router.push('/admin/talent/new?prefill=true');
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(inquiry.email);
    toast({ title: "Email Copied" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[6000] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[520px] bg-dark border-l border-white/10 h-full shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant="active" className={inquiry.role === 'DJ' ? 'bg-purple-dim text-purple border-purple' : 'bg-gold-dim text-gold border-gold'}>
                    {inquiry.role}
                  </Badge>
                  {!inquiry.read && <Badge variant="live">NEW</Badge>}
                </div>
                <h2 className="display-md text-white mt-4">{inquiry.stageName || inquiry.name}</h2>
                <p className="text-sm text-muted font-body">{inquiry.name}</p>
                <p className="text-[0.65rem] text-muted uppercase tracking-widest mt-2">
                  SUBMITTED: {formattedDate}
                </p>
              </div>
              <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <Divider className="my-0 opacity-10" />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Contact Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 rounded-sm bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gold" />
                    <span className="text-xs text-white">{inquiry.email}</span>
                  </div>
                  <button onClick={copyEmail} className="p-2 text-muted hover:text-gold transition-colors"><Copy size={14} /></button>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-3 p-4 rounded-sm bg-white/5 border border-white/5">
                    <Phone size={16} className="text-cyan" />
                    <span className="text-xs text-white">{inquiry.phone}</span>
                  </div>
                )}
                {inquiry.socialLink && (
                  <a href={inquiry.socialLink} target="_blank" className="flex items-center gap-3 p-4 rounded-sm bg-white/5 border border-white/5 hover:border-purple/40 transition-colors">
                    <Instagram size={16} className="text-purple" />
                    <span className="text-xs text-white truncate">{inquiry.socialLink}</span>
                  </a>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-3">
                <p className="admin-label">TALENT BIO / COVER LETTER</p>
                <div className="p-6 rounded-sm bg-white/5 border border-white/5 text-white body-md leading-relaxed whitespace-pre-wrap italic opacity-90">
                  "{inquiry.bio}"
                </div>
              </div>
            </div>

            <Divider className="my-0 opacity-10" />

            {/* Footer */}
            <div className="p-8 space-y-4">
              <Button variant="primary" className="w-full h-14" onClick={handleAddToRoster}>
                <UserPlus size={18} className="mr-2" /> ADD TO ROSTER
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="ghost" className="border border-white/5" onClick={onClose}>
                  CLOSE
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-red-400 border border-white/5 hover:bg-red-500/10"
                  onClick={() => onDelete(inquiry.id)}
                >
                  <Trash2 size={16} className="mr-2" /> DELETE
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
