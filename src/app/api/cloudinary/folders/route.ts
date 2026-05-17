
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
 * Fetches subfolders and resources for a specific Cloudinary path using the Search API.
 * This ensures that even newly uploaded images/videos are visible and filtered correctly.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'astrowave'

    // 1. Get subfolders for navigation (Admin API)
    const subfoldersResult = await cloudinary.api.sub_folders(folder).catch(() => ({ folders: [] }))

    // 2. Get resources using Search API (Indexed and supports all types)
    // We search within the specific folder prefix to get everything in the subtree if needed
    // or strictly the folder if search expression is refined.
    const searchResult = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const resources = (searchResult.resources || []).map((res: any) => ({
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
      resources: resources,
      total: resources.length
    })
  } catch (error: any) {
    console.error('Cloudinary Folders API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch directory content. Check your API Keys.' },
      { status: 500 }
    )
  }
}
