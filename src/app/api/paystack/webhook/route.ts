import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { fulfillPaystackPayment } from '@/lib/tickets/server'

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!PAYSTACK_WEBHOOK_SECRET || !signature) {
      return NextResponse.json({ error: 'Webhook authentication is not configured' }, { status: 503 })
    }

    const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(body).digest('hex')
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true, skipped: true })
    }

    const data = event.data
    const result = await fulfillPaystackPayment({
      reference: data.reference,
      email: data.customer?.email || '',
      amount: Number(data.amount || 0) / 100,
      metadata: data.metadata || {},
    })

    return NextResponse.json({
      received: true,
      ticketsGenerated: result.tickets.length,
      emailSent: result.emailSent,
      alreadyFulfilled: result.alreadyFulfilled,
    })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
