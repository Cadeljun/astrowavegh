'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

export function useCMSContent(
  pageSlug: string,
  sectionKey: string,
  defaultValues: Record<string, string> = {}
) {
  const [content, setContent] = useState<Record<string, string>>(defaultValues)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docId = `${pageSlug}_${sectionKey}`
    const ref = doc(db, 'cms_content', docId)

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setContent({
          ...defaultValues,
          ...snap.data().fields
        })
      } else {
        setContent(defaultValues)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [pageSlug, sectionKey])

  return { content, loading }
}

export async function saveCMSSection(
  pageSlug: string,
  sectionKey: string,
  label: string,
  fields: Record<string, string>
): Promise<void> {
  const docId = `${pageSlug}_${sectionKey}`
  const ref = doc(db, 'cms_content', docId)
  
  await setDoc(ref, {
    pageSlug,
    sectionKey,
    label,
    fields,
    updatedAt: serverTimestamp()
  }, { merge: true })
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
      const snap = await getDoc(ref)
      if (snap.exists()) {
        results[key] = snap.data().fields || {}
      } else {
        results[key] = {}
      }
    })
  )

  return results
}

export function useCMSSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = doc(db, 'cms_settings', 'global')
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings(snap.data())
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { settings, loading }
}

export async function saveGlobalSettings(data: Record<string, string>): Promise<void> {
  const ref = doc(db, 'cms_settings', 'global')
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true })
}