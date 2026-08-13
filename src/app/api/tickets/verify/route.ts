import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Verify a ticket by its ID
export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId || typeof ticketId !== 'string') {
      return NextResponse.json(
        { status: 'INVALID', error: 'No ticket ID provided' },
        { status: 400 }
      )
    }

    // Validate ticket ID format
    if (!/^MM26-[0-9A-F]{8}$/.test(ticketId)) {
      return NextResponse.json({
        status: 'INVALID',
        message: 'Invalid ticket format',
      })
    }

    // Look up ticket in Firestore
    const ticketRef = doc(db, 'tickets', ticketId)
    const ticketSnap = await getDoc(ticketRef)

    if (!ticketSnap.exists()) {
      return NextResponse.json({
        status: 'INVALID',
        message: 'Ticket not found',
      })
    }

    const ticket = ticketSnap.data()

    // Check if already used
    if (ticket.status === 'used') {
      return NextResponse.json({
        status: 'USED',
        message: 'Ticket already scanned',
        ticket: {
          id: ticketId,
          name: ticket.name,
          ticketType: ticket.ticketType,
          checkedInAt: ticket.checkedInAt,
        },
      })
    }

    // Check if cancelled
    if (ticket.status === 'cancelled') {
      return NextResponse.json({
        status: 'INVALID',
        message: 'Ticket has been cancelled',
      })
    }

    // Mark as used
    await updateDoc(ticketRef, {
      status: 'used',
      checkedInAt: serverTimestamp(),
    })

    return NextResponse.json({
      status: 'VALID',
      message: 'Ticket valid — entry confirmed',
      ticket: {
        id: ticketId,
        name: ticket.name,
        ticketType: ticket.ticketType,
        email: ticket.email,
      },
    })
  } catch (error: any) {
    console.error('Ticket verification error:', error)
    return NextResponse.json(
      { status: 'ERROR', error: 'Verification failed' },
      { status: 500 }
    )
  }
}
