import crypto from 'crypto'
import QRCode from 'qrcode'
import { v2 as cloudinary } from 'cloudinary'
import { getAdminDb } from '@/lib/firebase/admin'
import { sendTicketEmail } from '@/lib/email'

export const MASK_MIRAGE_EVENT = {
  title: 'Mask Mirage Party',
  slug: 'mask-mirage-party',
  date: '2026-10-10T21:00:00+00:00',
  venue: 'Coaches Lounge, East Legon',
  city: 'Accra',
}

const TICKET_PRICES: Record<string, number> = {
  Standard: 50,
  'Group of 4': 180,
  Complimentary: 0.2,
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function getExpectedAmount(ticketType: string, quantity: number) {
  if (ticketType === 'Group of 4') return quantity === 4 ? 180 : null
  const price = TICKET_PRICES[ticketType]
  return price === undefined ? null : price * quantity
}

function stableTicketId(reference: string, index: number) {
  const digest = crypto.createHash('sha256').update(`${reference}:${index}`).digest('hex').slice(0, 8).toUpperCase()
  return `MM26-${digest}`
}

async function generateQRBuffer(value: string): Promise<Buffer> {
  return QRCode.toBuffer(value, {
    type: 'png',
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#090909', light: '#FFFFFF' },
  })
}

async function uploadQR(buffer: Buffer, ticketId: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('QR image storage is not configured')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'Astrowave/Tickets',
        public_id: `ticket-${ticketId}`,
        resource_type: 'image',
        format: 'png',
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      },
    )
    uploadStream.end(buffer)
  })
}

export interface PaystackPaymentData {
  reference: string
  email: string
  amount: number
  metadata: {
    ticketType?: string
    name?: string
    phone?: string
    quantity?: number
    event?: string
  }
}

export async function fulfillPaystackPayment(payment: PaystackPaymentData) {
  const adminDb = getAdminDb()
  const { reference, email, amount, metadata } = payment
  const ticketType = metadata.ticketType || 'Standard'
  const quantity = Number(metadata.quantity || 1)
  const name = metadata.name || 'Guest'
  const expectedAmount = getExpectedAmount(ticketType, quantity)

  if (!email || !reference || !expectedAmount || Math.abs(amount - expectedAmount) > 0.01) {
    throw new Error('Payment metadata failed validation')
  }

  const existingSnapshot = await adminDb.collection('tickets').where('paymentReference', '==', reference).get()
  if (!existingSnapshot.empty) {
    const existingTickets = existingSnapshot.docs.map((ticket) => ticket.data())
    const paymentEvent = await adminDb.collection('payment_events').doc(reference).get()
    if (!paymentEvent.exists || paymentEvent.data()?.emailSent === false) {
      const emailResult = await sendTicketEmail({
        name,
        email,
        tickets: existingTickets as any,
        amount,
        quantity: existingTickets.length,
      })
      await adminDb.collection('payment_events').doc(reference).set({ emailSent: emailResult.success, emailError: emailResult.error || null }, { merge: true })
      return { tickets: existingTickets, emailSent: emailResult.success, alreadyFulfilled: true }
    }
    return {
      tickets: existingTickets,
      emailSent: paymentEvent.data()?.emailSent === true,
      alreadyFulfilled: true,
    }
  }

  const tickets = []
  for (let index = 0; index < quantity; index += 1) {
    const ticketId = stableTicketId(reference, index)
    const qrBuffer = await generateQRBuffer(ticketId)
    const qrUrl = await uploadQR(qrBuffer, ticketId)
    const ticket = {
      ticketId,
      eventTitle: MASK_MIRAGE_EVENT.title,
      eventSlug: MASK_MIRAGE_EVENT.slug,
      eventDate: MASK_MIRAGE_EVENT.date,
      venue: MASK_MIRAGE_EVENT.venue,
      city: MASK_MIRAGE_EVENT.city,
      name,
      email: email.trim().toLowerCase(),
      phone: metadata.phone || '',
      ticketType,
      price: amount / quantity,
      paymentReference: reference,
      qrUrl,
      qrValue: ticketId,
      status: 'valid',
      createdAt: new Date(),
      checkedInAt: null,
    }
    await adminDb.collection('tickets').doc(ticketId).set(ticket)
    tickets.push(ticket)
  }

  await adminDb.collection('payment_events').doc(reference).set({
    reference,
    event: MASK_MIRAGE_EVENT.slug,
    status: 'tickets_created',
    emailSent: false,
    ticketIds: tickets.map((ticket) => ticket.ticketId),
    createdAt: new Date(),
  }, { merge: true })

  const emailResult = await sendTicketEmail({
    name,
    email,
    tickets,
    amount,
    quantity,
  })

  await adminDb.collection('payment_events').doc(reference).set({
    reference,
    event: MASK_MIRAGE_EVENT.slug,
    status: 'fulfilled',
    emailSent: emailResult.success,
    emailError: emailResult.error || null,
    ticketIds: tickets.map((ticket) => ticket.ticketId),
    createdAt: new Date(),
  }, { merge: true })

  return { tickets, emailSent: emailResult.success, alreadyFulfilled: false }
}

export { TICKET_PRICES }
