
/**
 * Cloudinary configuration and utility functions for AstroWave.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';

/**
 * Generates an optimized Cloudinary URL for a given public ID.
 * @param publicId The Cloudinary public ID of the asset.
 * @param options Optimization options (width, height, crop, etc.)
 */
export function getCloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
  const { width, height, crop = 'fill' } = options;
  
  // Base URL
  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto`;
  
  // Add transformations
  if (width || height) {
    url += `,c_${crop}`;
    if (width) url += `,w_${width}`;
    if (height) url += `,h_${height}`;
  }
  
  return `${url}/${publicId}`;
}

/**
 * Mapping of subfolders for AstroWave media.
 */
export const CloudinaryFolders = {
  events: 'astrowave/events',
  talent: 'astrowave/talent',
  brand: 'astrowave/brand',
  videos: 'astrowave/videos',
  gallery: 'astrowave/gallery',
};
