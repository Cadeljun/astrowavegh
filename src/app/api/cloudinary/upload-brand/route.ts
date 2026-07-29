import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Verify Firebase ID token
async function verifyAuth(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

export async function POST(request: Request) {
  try {
    // Verify authentication
    if (!await verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'astrowave/brand'
    const publicId = (formData.get('publicId') as string) || undefined
    const resourceType = (formData.get('resourceType') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = resourceType === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed for ${resourceType}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = resourceType === 'video'
      ? 100 * 1024 * 1024  // 100MB for video
      : 5 * 1024 * 1024    // 5MB for images
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max: ${resourceType === 'video' ? '100MB' : '5MB'}` },
        { status: 400 }
      )
    }

    // Validate folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '')
    if (sanitizedFolder.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const uploadOptions: any = {
      folder: sanitizedFolder,
      resource_type: resourceType as any,
      use_filename: true,
      unique_filename: !publicId,
      overwrite: !!publicId,
      quality: 'auto',
      fetch_format: 'auto'
    }

    if (publicId) {
      // Validate publicId
      if (typeof publicId !== 'string' || publicId.length > 500) {
        return NextResponse.json({ error: 'Invalid public ID' }, { status: 400 })
      }
      uploadOptions.public_id = publicId
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions)

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type
    })

  } catch (error: any) {
    console.error('Cloudinary Brand Upload Error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
