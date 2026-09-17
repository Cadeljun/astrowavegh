import { NextResponse } from 'next/server'
import { fulfillPaystackPayment } from '@/lib/tickets/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref')

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: 'no-store',
    })
    const data = await response.json()

    if (!data.status || data.data?.status !== 'success') {
      return NextResponse.json({
        error: 'Payment not successful',
        status: data.data?.status,
      }, { status: 400 })
    }

    const result = await fulfillPaystackPayment({
      reference,
      email: data.data.customer?.email || '',
      amount: Number(data.data.amount || 0) / 100,
      metadata: data.data.metadata || {},
    })

    return NextResponse.json({
      success: true,
      tickets: result.tickets,
      email: data.data.customer?.email || '',
      name: data.data.metadata?.name || '',
      amount: Number(data.data.amount || 0) / 100,
      quantity: result.tickets.length,
      emailSent: result.emailSent,
      alreadyFulfilled: result.alreadyFulfilled,
    })
  } catch (error) {
    console.error('Paystack verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
