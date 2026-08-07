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

export async function GET(request: Request) {
  try {
    // Verify authentication
    if (!await verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 503 }
      )
    }

    const url = new URL(request.url)
    const folderPath = url.searchParams.get('folder')

    let folders: any[] = []
    let resources: any[] = []

    if (folderPath) {
      // List subfolders and resources in the specified folder
      try {
        const subfolders = await cloudinary.api.sub_folders(folderPath)
        folders = subfolders.folders || []
      } catch (e) {
        // Folder might not exist or have no subfolders
        folders = []
      }

      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: folderPath,
          max_results: 100,
        })
        resources = result.resources || []
      } catch (e) {
        resources = []
      }
    } else {
      // List root folders
      const result = await cloudinary.api.root_folders()
      folders = result.folders || []
    }

    return NextResponse.json({ 
      success: true,
      folders,
      resources
    })
  } catch (error: any) {
    console.error('Cloudinary Folders Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}
