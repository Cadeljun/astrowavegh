'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CMS_PAGES } from '@/lib/cms/definitions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CMSContentEditorProps {
  pageId: string;
}

export default function CMSContentEditor({ pageId }: CMSContentEditorProps) {
  const { toast } = useToast();
  
  const pageSchema = useMemo(() => 
    CMS_PAGES.find(p => p.slug === pageId), 
  [pageId]);

  const sections = useMemo(() => pageSchema?.sections || [], [pageSchema]);
  
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!sections.length || !db) return;

    const unsubs = sections.map(s => {
      const docId = `${pageId}_${s.key}`;
      return onSnapshot(doc(db, 'cms_content', docId), (snap) => {
        if (snap.exists()) {
          setLocalData(prev => ({
            ...prev,
            [s.key]: snap.data().fields
          }));
        }
      });
    });
    return () => unsubs.forEach(u => u());
  }, [pageId, sections]);

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value
      }
    }));
  };

  const saveSection = async (sectionKey: string, label: string) => {
    if (!db) return;
    setLoading(prev => ({ ...prev, [sectionKey]: true }));
    const docId = `${pageId}_${sectionKey}`;
    const docRef = doc(db, 'cms_content', docId);
    const fields = localData[sectionKey] || {};

    setDoc(docRef, {
      pageSlug: pageId,
      sectionKey: sectionKey,
      label: label,
      fields: fields,
      updatedAt: serverTimestamp()
    }, { merge: true })
      .then(() => {
        toast({ title: 'Section Saved', description: 'Changes are live on the website.' });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: fields,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [sectionKey]: false }));
      });
  };

  if (!pageSchema) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-lg">
        <AlertCircle className="mx-auto mb-2 text-muted" size={24} />
        <p className="text-muted text-sm">Schema not defined for this page.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {sections.map((section) => (
        <AccordionItem key={section.key} value={section.key} className="admin-card border-none p-0 overflow-hidden bg-[#16161F]">
          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
              <span className="font-display text-xl tracking-wider text-white uppercase group-data-[state=open]:text-gold transition-colors">
                {section.label}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
            {section.fields.map((field: any) => (
              <div key={field.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="admin-label m-0">{field.label}</label>
                  {field.maxLength && (
                    <span className="text-[0.6rem] text-muted font-mono">
                      {(localData[section.key]?.[field.key] || '').length} / {field.maxLength}
                    </span>
                  )}
                </div>
                {field.hint && <p className="text-[0.65rem] text-muted/60 italic">{field.hint}</p>}
                
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    className="admin-input min-h-[100px] resize-none"
                    value={localData[section.key]?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="admin-input"
                    value={localData[section.key]?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button
                size="sm"
                disabled={loading[section.key]}
                onClick={() => saveSection(section.key, section.label)}
                className="min-w-[140px] h-10"
              >
                {loading[section.key] ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                SAVE SECTION
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
