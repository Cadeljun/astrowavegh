import { NextResponse } from 'next/server'
import { authErrorResponse, requireScanner } from '@/lib/auth/server'
import { getAdminDb } from '@/lib/firebase/admin'

export async function GET(request: Request) {
  try {
    await requireScanner(request)
    const snapshot = await getAdminDb().collection('tickets').get()
    const total = snapshot.size
    const checkedIn = snapshot.docs.filter((ticket) => ticket.data().status === 'used').length
    return NextResponse.json({ total, checkedIn, remaining: total - checkedIn })
  } catch (error) {
    return authErrorResponse(error)
  }
}
