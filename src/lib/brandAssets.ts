import { db } from '@/firebase'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export async function saveBrandAsset(field: string, url: string): Promise<void> {
  if (!db) return
  const ref = doc(db, 'cms_settings', 'global')
  await updateDoc(ref, {
    [field]: url,
    updatedAt: serverTimestamp()
  })
}

export async function getBrandAssets(): Promise<Record<string, any>> {
  if (!db) return {}
  const ref = doc(db, 'cms_settings', 'global')
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : {}
}

export async function saveFaviconSVG(svgCode: string): Promise<void> {
  if (!db) return
  const ref = doc(db, 'cms_settings', 'global')
  await updateDoc(ref, {
    faviconSvgCode: svgCode,
    updatedAt: serverTimestamp()
  })
}
