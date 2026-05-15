
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CMSContentEditorProps {
  pageId: string;
}

const SECTION_SCHEMAS: Record<string, any[]> = {
  home: [
    { key: 'hero', label: 'Hero Section', fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'cta1', label: 'CTA Primary', type: 'text' },
      { key: 'cta2', label: 'CTA Secondary', type: 'text' },
    ]},
    { key: 'about_teaser', label: 'About Teaser', fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Body Text', type: 'textarea' },
      { key: 'cta', label: 'CTA Label', type: 'text' },
    ]},
    { key: 'cta_banner', label: 'CTA Banner', fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'cta1', label: 'Button 1', type: 'text' },
      { key: 'cta2', label: 'Button 2', type: 'text' },
    ]}
  ],
  about: [
    { key: 'hero', label: 'Hero Section', fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
    ]},
    { key: 'story', label: 'Our Story', fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'para1', label: 'Paragraph 1', type: 'textarea' },
      { key: 'para2', label: 'Paragraph 2', type: 'textarea' },
      { key: 'quote', label: 'Featured Quote', type: 'textarea' },
      { key: 'quoteAuthor', label: 'Quote Author', type: 'text' },
    ]}
  ]
};

export default function CMSContentEditor({ pageId }: CMSContentEditorProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const schemas = SECTION_SCHEMAS[pageId] || [];
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Subscriptions for each section
    const unsubs = schemas.map(s => {
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
  }, [db, pageId, schemas]);

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value
      }
    }));
  };

  const saveSection = async (sectionKey: string) => {
    setLoading(prev => ({ ...prev, [sectionKey]: true }));
    try {
      const docId = `${pageId}_${sectionKey}`;
      await setDoc(doc(db, 'cms_content', docId), {
        pageSlug: pageId,
        sectionKey: sectionKey,
        fields: localData[sectionKey] || {},
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: 'Section Saved', description: 'Changes are live on the website.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error Saving' });
    } finally {
      setLoading(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  return (
    <Accordion type="multiple" className="space-y-4">
      {schemas.map((section) => (
        <AccordionItem key={section.key} value={section.key} className="admin-card border-none p-0 overflow-hidden">
          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-white/5 transition-all">
            <div className="flex items-center gap-4">
              <span className="font-display text-xl tracking-wider text-white uppercase">{section.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
            {section.fields.map((field: any) => (
              <div key={field.key} className="space-y-2">
                <label className="admin-label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    className="admin-input min-h-[100px] resize-none"
                    value={localData[section.key]?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="admin-input"
                    value={localData[section.key]?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
                  />
                )}
                <div className="flex justify-end">
                  <span className="text-[0.6rem] text-muted font-mono">{(localData[section.key]?.[field.key] || '').length} chars</span>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button
                size="sm"
                disabled={loading[section.key]}
                onClick={() => saveSection(section.key)}
                className="min-w-[140px]"
              >
                {loading[section.key] ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                SAVE CHANGES
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
