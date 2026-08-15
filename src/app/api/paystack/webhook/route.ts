import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (PAYSTACK_WEBHOOK_SECRET) {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (hash !== signature) {
        console.error('Webhook signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data)
        break
      case 'charge.failed':
        await handleFailedCharge(event.data)
        break
      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleSuccessfulCharge(data: any) {
  const reference = data.reference
  const email = data.customer?.email
  const amount = data.amount / 100
  const metadata = data.metadata || {}

  console.log(`✅ Payment successful: ${reference} | ${email} | GH¢${amount}`)

  // Log to a webhook_events collection for tracking
  // This ensures we don't lose any payments even if the redirect fails
  try {
    const { db } = await import('@/firebase')
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    
    await setDoc(doc(db, 'webhook_events', reference), {
      reference,
      email,
      amount,
      metadata,
      event: 'charge.success',
      processed: false,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}

async function handleFailedCharge(data: any) {
  const reference = data.reference
  const email = data.customer?.email
  
  console.log(`❌ Payment failed: ${reference} | ${email}`)
}
