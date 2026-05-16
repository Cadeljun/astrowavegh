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
import { db } from '@/firebase/config'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'

/**
 * Fetches all documents from a collection with optional constraints.
 */
export async function getCollection(path: string, constraints: QueryConstraint[] = []) {
  try {
    const colRef = collection(db, path)
    const q = query(colRef, ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    throw serverError;
  }
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
  try {
    const colRef = collection(db, path)
    const snap = await getCountFromServer(colRef)
    return snap.data().count
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    throw serverError;
  }
}

/**
 * Deletes a document from a collection. (Non-blocking optimistic write)
 */
export function deleteDocument(path: string, id: string) {
  const docRef = doc(db, path, id);
  deleteDoc(docRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Updates a document in a collection. (Non-blocking optimistic write)
 */
export function updateDocument(path: string, id: string, data: any) {
  const docRef = doc(db, path, id);
  const updateData = { 
    ...data, 
    updatedAt: serverTimestamp() 
  };
  
  updateDoc(docRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Adds a new document to a collection. (Non-blocking optimistic write)
 */
export function addDocument(path: string, data: any) {
  const colRef = collection(db, path);
  const addData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  addDoc(colRef, addData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'create',
        requestResourceData: addData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Fetches a single document by ID.
 */
export async function getDocument(path: string, id: string) {
  try {
    const docRef = doc(db, path, id)
    const snap = await getDoc(docRef)
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: `${path}/${id}`,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    throw serverError;
  }
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