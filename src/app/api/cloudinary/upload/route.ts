
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: 
    process.env.CLOUDINARY_API_KEY,
  api_secret: 
    process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// POST /api/cloudinary/upload
// Uploads a file to a specific folder
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'astrowave'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader
      .upload(dataUri, {
        folder: folder,
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
