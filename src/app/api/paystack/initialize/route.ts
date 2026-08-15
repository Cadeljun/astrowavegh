import { NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: Request) {
  try {
    const { email, amount, ticketType, name, quantity } = await request.json()

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

    // Validate price server-side (prevent tampering)
    const validPrices: Record<string, number> = {
      'Standard': 50,
      'Group of 4': 180,
      'Complimentary': 0.20,
    };
    const expectedPrice = validPrices[ticketType];
    if (expectedPrice === undefined) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 });
    }
    const expectedTotal = expectedPrice * (quantity || 1);
    if (Math.abs(amount - expectedTotal) > 0.01) {
      return NextResponse.json({ error: 'Price mismatch' }, { status: 400 });
    }

    // Get the origin from the request header
    const origin = request.headers.get('origin') || 'https://tickets.astrowavegh.com'

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack uses pesewas
        currency: 'GHS',
        metadata: {
          ticketType,
          name,
          quantity: quantity || 1,
          event: 'Mask Mirage Party',
        },
        callback_url: `${origin}/tickets/verify`,
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
