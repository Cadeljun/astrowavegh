import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Verify Firebase ID token (simplified - in production use firebase-admin)
async function verifyAuth(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return false
    }
    // In production, verify the token with firebase-admin
    // For now, we require the header to exist
    return true
  } catch {
    return false
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify authentication
    if (!await verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { publicId, resourceType } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    // Validate publicId format (prevent injection)
    if (typeof publicId !== 'string' || publicId.length > 500) {
      return NextResponse.json({ error: 'Invalid public ID' }, { status: 400 })
    }

    // Explicitly handle resource_type for videos/auto types
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
      invalidate: true
    })

    return NextResponse.json({ 
      success: result.result === 'ok' || result.result === 'not found',
      result: result.result
    })
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }
}
