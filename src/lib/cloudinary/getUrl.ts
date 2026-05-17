/**
 * @fileOverview Helper for transforming Cloudinary URLs with optimizations.
 */

export type CloudinaryTransform = {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  blur?: number
  brightness?: number
}

export function getCloudinaryUrl(
  url: string,
  transforms: CloudinaryTransform = {}
): string {
  if (!url) return ''
  
  // If it's not a Cloudinary URL, return as is (e.g. local assets or external placeholders)
  if (!url.includes('cloudinary.com')) {
    return url
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    blur,
    brightness
  } = transforms

  // Build transformation string
  const parts: string[] = []
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  if (width || height) parts.push(`c_${crop}`)
  
  parts.push(`q_${quality}`)
  parts.push(`f_${format}`)
  
  if (blur) parts.push(`e_blur:${blur}`)
  if (brightness) parts.push(`e_brightness:${brightness}`)

  const transformation = parts.join(',')

  // Insert transformation into URL correctly after /upload/
  return url.replace(
    '/upload/',
    `/upload/${transformation}/`
  )
}

// Preset transformations for different UI contexts
export const CloudinaryPresets = {
  // Event card thumbnail
  eventCard: (url: string) => 
    getCloudinaryUrl(url, {
      width: 800,
      height: 500,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Event spotlight (full width)
  eventSpotlight: (url: string) =>
    getCloudinaryUrl(url, {
      width: 1400,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Talent profile photo
  talentCard: (url: string) =>
    getCloudinaryUrl(url, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Gallery photo
  galleryThumb: (url: string) =>
    getCloudinaryUrl(url, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Gallery full size
  galleryFull: (url: string) =>
    getCloudinaryUrl(url, {
      width: 1200,
      quality: 'auto',
      format: 'auto'
    }),

  // Hero background
  heroBg: (url: string) =>
    getCloudinaryUrl(url, {
      width: 1920,
      height: 1080,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Logo
  logo: (url: string) =>
    getCloudinaryUrl(url, {
      height: 80,
      crop: 'fit',
      quality: 'auto',
      format: 'auto'
    }),

  // OG image
  ogImage: (url: string) =>
    getCloudinaryUrl(url, {
      width: 1200,
      height: 630,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  // Admin thumbnail
  adminThumb: (url: string) =>
    getCloudinaryUrl(url, {
      width: 80,
      height: 80,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    })
}
