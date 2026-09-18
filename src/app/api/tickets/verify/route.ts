import { NextResponse } from 'next/server'
import { authErrorResponse, requireScanner } from '@/lib/auth/server'
import { getAdminDb } from '@/lib/firebase/admin'
import { checkRateLimit, scanLimiter } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(scanLimiter, request)
    if (!rateLimit.allowed) return NextResponse.json({ status: 'ERROR', message: 'Too many scans. Try again shortly.' }, { status: 429 })
    await requireScanner(request)
    const { ticketId } = await request.json()
    const normalizedId = typeof ticketId === 'string' ? ticketId.trim().toUpperCase() : ''

    if (!/^MM26-[0-9A-F]{8}$/.test(normalizedId)) {
      return NextResponse.json({ status: 'INVALID', message: 'Invalid ticket format' })
    }

    const ticketRef = getAdminDb().collection('tickets').doc(normalizedId)
    const result = await getAdminDb().runTransaction(async (transaction) => {
      const ticketSnapshot = await transaction.get(ticketRef)

      if (!ticketSnapshot.exists) {
        return { status: 'INVALID' as const, message: 'Ticket not found' }
      }

      const ticket = ticketSnapshot.data() || {}
      if (ticket.status === 'used') {
        return {
          status: 'USED' as const,
          message: 'Ticket already scanned',
          ticket: {
            id: normalizedId,
            name: ticket.name || 'Guest',
            ticketType: ticket.ticketType || 'Standard',
            checkedInAt: ticket.checkedInAt || null,
          },
        }
      }

      if (ticket.status === 'cancelled') {
        return { status: 'INVALID' as const, message: 'Ticket has been cancelled' }
      }

      transaction.update(ticketRef, {
        status: 'used',
        checkedInAt: new Date(),
      })

      return {
        status: 'VALID' as const,
        message: 'Ticket valid — entry confirmed',
        ticket: {
          id: normalizedId,
          name: ticket.name || 'Guest',
          ticketType: ticket.ticketType || 'Standard',
        },
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    return authErrorResponse(error)
  }
}
