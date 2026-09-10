import { NextResponse } from 'next/server'
import crypto from 'crypto'
import QRCode from 'qrcode'
import { v2 as cloudinary } from 'cloudinary'
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { sendTicketEmail } from '@/lib/email'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Generate unique ticket ID
function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${id}-MIRAGE`
}

// Generate QR code as buffer
async function generateQRBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#090909',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  })
}

// Upload QR code to Cloudinary
async function uploadQRToCloudinary(buffer: Buffer, ticketId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'Astrowave/Tickets',
        public_id: `ticket-${ticketId}`,
        resource_type: 'image',
        format: 'png',
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    )
    
    // Convert buffer to stream
    const stream = require('stream')
    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)
    bufferStream.pipe(uploadStream)
  })
}

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

    // Only handle successful charges
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true, skipped: true })
    }

    const data = event.data
    const reference = data.reference
    const email = data.customer?.email
    const amount = data.amount / 100
    const metadata = data.metadata || {}
    const quantity = metadata.quantity || 1
    const name = metadata.name || ''
    const ticketType = metadata.ticketType || 'Standard'

    console.log(`✅ Payment received: ${reference} | ${email} | GH¢${amount}`)

    // Generate tickets
    const tickets = []
    for (let i = 0; i < quantity; i++) {
      const ticketId = generateTicketId()
      
      // Step 3: Generate QR code buffer
      const qrBuffer = await generateQRBuffer(ticketId)
      
      // Step 4: Upload QR to Cloudinary
      const qrUrl = await uploadQRToCloudinary(qrBuffer, ticketId)
      
      // Step 5: Save ticket to Firestore
      await setDoc(doc(db, 'tickets', ticketId), {
        ticketId,
        name,
        email,
        ticketType,
        price: amount / quantity,
        paymentReference: reference,
        qrUrl,
        status: 'valid',
        createdAt: serverTimestamp(),
        checkedInAt: null,
      })

      tickets.push({ ticketId, ticketType, qrUrl })
    }

    // Step 6: Email tickets to buyer
    await sendTicketEmail({
      name,
      email,
      tickets,
      amount,
      quantity,
    })

    console.log(`✅ ${quantity} ticket(s) generated and emailed to ${email}`)

    return NextResponse.json({ 
      received: true, 
      ticketsGenerated: quantity,
      email 
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
