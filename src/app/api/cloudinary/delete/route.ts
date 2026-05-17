import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export async function DELETE(request: Request) {
  try {
    const { publicId, resourceType } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
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
    return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 })
  }
}
