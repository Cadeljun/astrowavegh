import { NextResponse } from 'next/server'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'

export type StaffIdentity = DecodedIdToken & {
  role?: string
  scanner?: boolean
}

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim()
}

export async function requireScanner(request: Request): Promise<StaffIdentity> {
  const token = getBearerToken(request)
  if (!token) throw new Error('UNAUTHENTICATED')

  const decoded = await getAdminAuth().verifyIdToken(token)
  const userSnapshot = await getAdminDb().collection('users').doc(decoded.uid).get()
  const userData = userSnapshot.data() || {}
  const role = decoded.role || userData.role
  const scanner = decoded.scanner === true || userData.scanner === true

  if (role !== 'admin' && role !== 'scanner' && !scanner) {
    throw new Error('FORBIDDEN')
  }

  return { ...decoded, role, scanner }
}

export function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'UNAUTHENTICATED' || message.includes('Firebase ID token')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (message === 'FORBIDDEN') {
    return NextResponse.json({ error: 'Scanner staff access required' }, { status: 403 })
  }
  console.error('Staff authorization error:', error)
  return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
}
