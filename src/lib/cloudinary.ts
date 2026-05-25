/**
 * @fileOverview Centralized Media Mapping for AstroWave.
 * Defines the relationship between Cloudinary folders and Firestore collections.
 */

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';

/**
 * The authoritative map of Cloudinary folders and their Firestore counterparts.
 */
export const MEDIA_SCHEMA = {
  logos: {
    path: 'astrowave/brand/logos',
    firestore: 'cms_settings/global',
    fields: ['logoUrl', 'logoDarkUrl', 'logoIconUrl', 'faviconUrl'],
    label: 'Brand Logos',
    description: 'Corporate identity and tab icons.'
  },
  backgrounds: {
    path: 'astrowave/brand/backgrounds',
    firestore: 'cms_settings/global',
    fields: ['heroPosterUrl', 'heroImageUrl', 'ogImageHome'],
    label: 'Background Media',
    description: 'Hero fallbacks and social share cards.'
  },
  heroVideos: {
    path: 'astrowave/videos/hero',
    firestore: 'cms_settings/global',
    fields: ['heroVideoUrl'],
    label: 'Hero Video Streams',
    description: 'Cinematic looping background videos.'
  },
  eventPosters: {
    path: 'astrowave/events/general',
    firestore: 'platform_events/{id}',
    fields: ['imageUrl'],
    label: 'Event Content',
    description: 'Public event briefs and marketing posters.'
  },
  talentPhotos: {
    path: 'astrowave/talent/profiles',
    firestore: 'talent_profiles/{uid}',
    fields: ['photoURL'],
    label: 'Talent Identity',
    description: 'Professional headshots for the roster.'
  },
  gallery: {
    path: 'astrowave/gallery/past-events',
    firestore: 'gallery/{id}',
    fields: ['imageUrl'],
    label: 'Gallery Archive',
    description: 'Historical event memories and fan photos.'
  }
};

/**
 * Legacy support for simple folder mapping.
 */
export const CloudinaryFolders = {
  events: MEDIA_SCHEMA.eventPosters.path,
  talent: MEDIA_SCHEMA.talentPhotos.path,
  brand: 'astrowave/brand',
  videos: MEDIA_SCHEMA.heroVideos.path,
  gallery: MEDIA_SCHEMA.gallery.path,
};

/**
 * Generates an optimized Cloudinary URL for a given public ID.
 */
export function getCloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
  const { width, height, crop = 'fill' } = options;
  
  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto`;
  
  if (width || height) {
    url += `,c_${crop}`;
    if (width) url += `,w_${width}`;
    if (height) url += `,h_${height}`;
  }
  
  return `${url}/${publicId}`;
}
