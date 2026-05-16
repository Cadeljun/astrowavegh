
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

// GET /api/cloudinary/folders
// Returns all folders and subfolders
export async function GET(request: Request) {
  try {
    const { searchParams } = 
      new URL(request.url)
    const folder = searchParams.get('folder') 
      || ''

    if (folder) {
      // Get subfolders of a specific folder
      const [subfolders, resources] = 
        await Promise.all([
          cloudinary.api.sub_folders(folder),
          cloudinary.api.resources({
            type: 'upload',
            prefix: folder + '/',
            max_results: 100,
            resource_type: 'image'
          })
        ])

      // Also get videos in folder
      const videos = await cloudinary.api
        .resources({
          type: 'upload',
          prefix: folder + '/',
          max_results: 50,
          resource_type: 'video'
        }).catch(() => ({ resources: [] }))

      return NextResponse.json({
        subfolders: subfolders.folders || [],
        resources: [
          ...resources.resources,
          ...videos.resources
        ],
        total: resources.total_count || 0
      })
    } else {
      // Get root folders
      const result = 
        await cloudinary.api.root_folders()
      return NextResponse.json({
        folders: result.folders || [],
        subfolders: [],
        resources: []
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
