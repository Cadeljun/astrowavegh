'use client'

import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  limit, 
  orderBy, 
  where, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
  getCountFromServer,
  serverTimestamp
} from 'firebase/firestore'
import { initializeFirebase } from '@/firebase'

/**
 * Fetches all documents from a collection with optional constraints.
 */
export async function getCollection(path: string, constraints: QueryConstraint[] = []) {
  const { firestore: db } = initializeFirebase()
  const colRef = collection(db, path)
  const q = query(colRef, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Fetches the most recent documents from a collection.
 */
export async function getRecentDocuments(path: string, limitVal: number = 5) {
  return getCollection(path, [
    orderBy('createdAt', 'desc'),
    limit(limitVal)
  ])
}

/**
 * Fetches documents created within the last X days.
 */
export async function getDocumentsSince(path: string, days: number) {
  const { firestore: db } = initializeFirebase()
  const date = new Date()
  date.setDate(date.getDate() - days)
  const ts = Timestamp.fromDate(date)
  
  return getCollection(path, [
    where('createdAt', '>=', ts),
    orderBy('createdAt', 'desc')
  ])
}

/**
 * Returns a simple count of documents in a collection.
 */
export async function countDocuments(path: string) {
  const { firestore: db } = initializeFirebase()
  const colRef = collection(db, path)
  const snap = await getCountFromServer(colRef)
  return snap.data().count
}

/**
 * Deletes a document from a collection.
 */
export async function deleteDocument(path: string, id: string) {
  const { firestore: db } = initializeFirebase()
  const docRef = doc(db, path, id)
  return deleteDoc(docRef)
}

/**
 * Updates a document in a collection.
 */
export async function updateDocument(path: string, id: string, data: any) {
  const { firestore: db } = initializeFirebase()
  const docRef = doc(db, path, id)
  return updateDoc(docRef, { 
    ...data, 
    updatedAt: serverTimestamp() 
  })
}

/**
 * Adds a new document to a collection.
 */
export async function addDocument(path: string, data: any) {
  const { firestore: db } = initializeFirebase()
  const colRef = collection(db, path)
  return addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Fetches a single document by ID.
 */
export async function getDocument(path: string, id: string) {
  const { firestore: db } = initializeFirebase()
  const docRef = doc(db, path, id)
  const snap = await getDoc(docRef)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Formats a Firestore timestamp into a readable date string.
 */
export function formatTimestamp(ts: any) {
  if (!ts) return '—'
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
