
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

/**
 * GET /api/cloudinary/folders
 * Fetches subfolders and resources for a specific Cloudinary path.
 * Hardened to handle empty folders and API errors gracefully.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''

    if (!folder) {
      const result = await cloudinary.api.root_folders()
      return NextResponse.json({
        folders: result.folders || [],
        subfolders: [],
        resources: []
      })
    }

    // Use catch on individual promises to prevent one failure from breaking the whole list
    const [subfoldersResult, imagesResult, videosResult] = await Promise.all([
      cloudinary.api.sub_folders(folder).catch(() => ({ folders: [] })),
      cloudinary.api.resources({
        type: 'upload',
        prefix: folder + '/',
        max_results: 100,
        resource_type: 'image'
      }).catch(() => ({ resources: [] })),
      cloudinary.api.resources({
        type: 'upload',
        prefix: folder + '/',
        max_results: 50,
        resource_type: 'video'
      }).catch(() => ({ resources: [] }))
    ])

    // Filter resources to only show those directly in the current folder (optional, Cloudinary prefix is deep)
    const allResources = [
      ...imagesResult.resources,
      ...videosResult.resources
    ].map(res => ({
      public_id: res.public_id,
      secure_url: res.secure_url,
      format: res.format,
      resource_type: res.resource_type,
      bytes: res.bytes,
      width: res.width,
      height: res.height,
      created_at: res.created_at,
      folder: res.folder
    }))

    return NextResponse.json({
      subfolders: subfoldersResult.folders || [],
      resources: allResources,
      total: allResources.length
    })
  } catch (error: any) {
    console.error('Cloudinary Folders API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch directory content' },
      { status: 500 }
    )
  }
}
