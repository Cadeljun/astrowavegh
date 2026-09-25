import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase/admin'
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(apiLimiter, request)
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many lookup attempts. Try again later.' }, { status: 429 })

    const { email, identifier } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const normalizedIdentifier = typeof identifier === 'string' ? identifier.trim().toUpperCase() : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !normalizedIdentifier) {
      return NextResponse.json({ error: 'Email and ticket ID or payment reference are required' }, { status: 400 })
    }

    const snapshot = await getAdminDb().collection('tickets').where('email', '==', normalizedEmail).get()
    const tickets = snapshot.docs
      .map((ticket) => ticket.data())
      .filter((ticket) => ticket.ticketId === normalizedIdentifier || String(ticket.paymentReference || '').toUpperCase() === normalizedIdentifier)
      .map((ticket) => ({
        ticketId: ticket.ticketId,
        eventTitle: ticket.eventTitle,
        ticketType: ticket.ticketType,
        price: ticket.price,
        email: ticket.email,
        name: ticket.name,
        qrUrl: ticket.qrUrl,
        status: ticket.status,
      }))

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Ticket lookup error:', error)
    return NextResponse.json({ error: 'Ticket lookup failed' }, { status: 500 })
  }
}
