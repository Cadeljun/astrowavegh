import { NextResponse } from 'next/server'

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: Request) {
  try {
    const { email, amount, ticketType, name } = await request.json()

    // Validate
    if (!email || !amount || !ticketType) {
      return NextResponse.json(
        { error: 'Email, amount, and ticket type are required' },
        { status: 400 }
      )
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503 }
      )
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack uses pesewas (GHS * 100)
        currency: 'GHS',
        metadata: {
          ticketType,
          name,
          event: 'Mask Mirage Party',
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://astrowavegh.com'}/tickets/verify`,
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error: any) {
    console.error('Paystack init error:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
