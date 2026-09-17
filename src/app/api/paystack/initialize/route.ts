import { NextResponse } from 'next/server'
import { purchaseLimiter, checkRateLimit } from '@/lib/rate-limit'
import { getExpectedAmount } from '@/lib/tickets/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: Request) {
  // Rate limit: 5 purchases per 15 min per IP
  const rateLimit = await checkRateLimit(purchaseLimiter, request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    const { email, amount, ticketType, name, phone, quantity = 1 } = await request.json()

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

    const normalizedQuantity = Number(quantity)
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 10) {
      return NextResponse.json({ error: 'Invalid ticket quantity' }, { status: 400 });
    }

    const expectedTotal = getExpectedAmount(ticketType, normalizedQuantity)
    if (expectedTotal === null) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 });
    }
    if (Math.abs(amount - expectedTotal) > 0.01) {
      return NextResponse.json({ error: 'Price mismatch' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://tickets.astrowavegh.com'

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: 'GHS',
        metadata: {
          ticketType,
          name,
          phone,
          quantity: normalizedQuantity,
          event: 'mask-mirage-party',
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
