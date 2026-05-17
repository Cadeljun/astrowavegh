'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

export function useCMSContent(
  pageSlug: string,
  sectionKey: string,
  defaultValues: Record<string, string> = {}
) {
  const [content, setContent] = useState<Record<string, string>>(defaultValues)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !('type' in db)) {
      setLoading(false);
      return;
    }

    const docId = `${pageSlug}_${sectionKey}`
    const ref = doc(db, 'cms_content', docId)

    const unsub = onSnapshot(
      ref, 
      (snap) => {
        if (snap.exists()) {
          setContent({
            ...defaultValues,
            ...snap.data().fields
          })
        } else {
          setContent(defaultValues)
        }
        setLoading(false)
      },
      async (error) => {
        if (process.env.NODE_ENV === 'development') {
          const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
        setLoading(false);
      }
    )

    return () => unsub()
  }, [pageSlug, sectionKey])

  return { content, loading }
}

export function useCMSSections(pageSlug: string) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !('type' in db)) {
      setLoading(false);
      return;
    }

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
    }, (error) => {
      setLoading(false);
    });
    
    return unsub;
  }, [pageSlug]);

  return { sections, loading };
}

export function useCMSSEO(pageSlug: string) {
  const [seo, setSEO] = useState<any>(null);

  useEffect(() => {
    if (!db || !('type' in db)) return;

    const ref = doc(db, 'cms_seo', pageSlug);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSEO(snap.data());
    });
    return unsub;
  }, [pageSlug]);

  return seo;
}

export function useCMSSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !('type' in db)) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'cms_settings', 'global')
    const unsub = onSnapshot(
      ref, 
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data())
        }
        setLoading(false)
      },
      async (error) => {
        if (process.env.NODE_ENV === 'development') {
          const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
        setLoading(false);
      }
    )
    return () => unsub()
  }, [])

  return { settings, loading }
}

export async function saveCMSSection(
  pageSlug: string,
  sectionKey: string,
  label: string,
  fields: Record<string, string>
): Promise<void> {
  const docId = `${pageSlug}_${sectionKey}`
  const ref = doc(db, 'cms_content', docId)
  
  setDoc(ref, {
    pageSlug,
    sectionKey,
    label,
    fields,
    updatedAt: serverTimestamp()
  }, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: ref.path,
        operation: 'write',
        requestResourceData: fields,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function loadPageContent(
  pageSlug: string,
  sectionKeys: string[]
): Promise<Record<string, Record<string, string>>> {
  const results: Record<string, Record<string, string>> = {}

  await Promise.all(
    sectionKeys.map(async (key) => {
      const docId = `${pageSlug}_${key}`
      const ref = doc(db, 'cms_content', docId)
      try {
        const snap = await getDoc(ref)
        if (snap.exists()) {
          results[key] = snap.data().fields || {}
        } else {
          results[key] = {}
        }
      } catch (serverError: any) {
        if (serverError.code === 'permission-denied' && process.env.NODE_ENV === 'development') {
          const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
        results[key] = {}
      }
    })
  )

  return results
}

export async function saveGlobalSettings(data: Record<string, string>): Promise<void> {
  const ref = doc(db, 'cms_settings', 'global')
  setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: ref.path,
        operation: 'write',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}
