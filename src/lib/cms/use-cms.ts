
'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';

/**
 * Hook to fetch content for a specific page and section from cms_content.
 */
export function useCMSContent(pageSlug: string, sectionKey: string) {
  const db = useFirestore();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docId = `${pageSlug}_${sectionKey}`;
    const ref = doc(db, 'cms_content', docId);
    
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setContent(snap.data().fields);
      }
      setLoading(false);
    });
    
    return unsub;
  }, [db, pageSlug, sectionKey]);

  return { content, loading };
}

/**
 * Hook to fetch visible sections and their order for a specific page.
 */
export function useCMSSections(pageSlug: string) {
  const db = useFirestore();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'cms_sections', pageSlug);
    
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const sorted = (data.sections || [])
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .filter((s: any) => s.visible !== false);
        setSections(sorted);
      }
      setLoading(false);
    });
    
    return unsub;
  }, [db, pageSlug]);

  return { sections, loading };
}

/**
 * Hook to fetch SEO metadata for a page.
 */
export function useCMSSEO(pageSlug: string) {
  const db = useFirestore();
  const [seo, setSEO] = useState<any>(null);

  useEffect(() => {
    const ref = doc(db, 'cms_seo', pageSlug);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSEO(snap.data());
    });
    return unsub;
  }, [db, pageSlug]);

  return seo;
}

/**
 * Hook to fetch global site settings.
 */
export function useCMSSettings() {
  const db = useFirestore();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const ref = doc(db, 'cms_settings', 'global');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return unsub;
  }, [db]);

  return settings;
}
