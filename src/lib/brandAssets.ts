import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Saves a single brand asset URL to the global CMS settings.
 */
export async function saveBrandAsset(field: string, url: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'cms_settings', 'global');
  await setDoc(ref, {
    [field]: url,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Retrieves all brand assets from global CMS settings.
 */
export async function getBrandAssets(): Promise<Record<string, any>> {
  if (!db) return {};
  const ref = doc(db, 'cms_settings', 'global');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

/**
 * Saves raw SVG code for the favicon.
 */
export async function saveFaviconSVG(svgCode: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'cms_settings', 'global');
  await setDoc(ref, {
    faviconSvgCode: svgCode,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
