'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Copy, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
  onDelete: (id: string) => void;
}

export default function ContactModal({ isOpen, onClose, contact, onDelete }: ContactModalProps) {
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contact && !contact.read) {
      const docRef = doc(db, 'contacts', contact.id);
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
  }, [isOpen, contact, db]);

  const copyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    toast({ title: "Email Copied", description: "Address copied to clipboard." });
  };

  if (!contact) return null;

  const subjectColors: Record<string, string> = {
    'Event Booking': 'gold',
    'Talent Inquiry': 'purple',
    'Partnership': 'cyan',
    'General Enquiry': 'muted'
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
            className="relative w-full max-w-[480px] bg-dark border-l border-white/10 h-full shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-start justify-between">
              <div className="space-y-1">
                <Badge variant="active" className={`bg-${subjectColors[contact.subject] || 'muted'}-dim text-${subjectColors[contact.subject] || 'muted'} border-${subjectColors[contact.subject] || 'muted'}`}>
                  {contact.subject}
                </Badge>
                <h2 className="display-md text-white mt-4">{contact.name}</h2>
                <p className="text-xs text-muted">
                  {contact.timestamp ? format(contact.timestamp.toDate(), 'PPP • p') : 'No date'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <Divider className="my-0 opacity-10" />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-sm bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gold" />
                    <span className="text-sm font-medium text-white">{contact.email}</span>
                  </div>
                  <button onClick={copyEmail} className="p-2 hover:bg-white/10 rounded-sm text-muted hover:text-gold transition-all">
                    <Copy size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="admin-label">MESSAGE</p>
                  <div className="p-6 rounded-sm bg-white/5 border border-white/5 text-white body-md leading-relaxed whitespace-pre-wrap">
                    {contact.message}
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-0 opacity-10" />

            {/* Footer Actions */}
            <div className="p-8 grid grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => window.location.href = `mailto:${contact.email}?subject=Re: AstroWave ${contact.subject}`}
              >
                REPLY <ExternalLink size={14} className="ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 border border-white/5"
                onClick={() => onDelete(contact.id)}
              >
                DELETE <Trash2 size={14} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
