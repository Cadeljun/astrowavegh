import { NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }

    // Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    )
    const data = await response.json()

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ 
        error: 'Payment not successful', 
        status: data.data?.status 
      }, { status: 400 })
    }

    const metadata = data.data.metadata || {}
    const quantity = metadata.quantity || 1
    const name = metadata.name || ''
    const email = data.data.customer?.email || ''
    const ticketType = metadata.ticketType || 'Standard'
    const amount = data.data.amount / 100

    // Generate tickets
    const tickets = []
    for (let i = 0; i < quantity; i++) {
      const ticketId = generateTicketId()
      tickets.push({ ticketId, ticketType })
    }

    return NextResponse.json({
      success: true,
      tickets,
      email,
      name,
      ticketType,
      amount,
      quantity,
    })
  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

function generateTicketId(): string {
  const prefix = 'MM26'
  const chars = '0123456789ABCDEF'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${id}`
}
