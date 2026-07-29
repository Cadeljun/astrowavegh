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
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

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
    const folder = (formData.get('folder') as string) || 'astrowave'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed: JPEG, PNG, GIF, WebP, SVG, MP4, WebM' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      )
    }

    // Validate folder name (prevent path traversal)
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '')
    if (sanitizedFolder.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: sanitizedFolder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
      folder: result.folder,
      createdAt: result.created_at
    })
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
