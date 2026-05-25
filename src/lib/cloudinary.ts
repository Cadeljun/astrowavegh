/**
 * @fileOverview Centralized Media Mapping for AstroWave.
 * Defines the relationship between Cloudinary folders and Firestore collections.
 */

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';

/**
 * Authoritative hierarchical list of brand-approved folders.
 */
export const CLOUDINARY_DIRECTORY = [
  { 
    name: 'Events', 
    path: 'astrowave/events', 
    color: '#00FF87',
    children: [
      { name: 'Mask Mirage', path: 'astrowave/events/mask-mirage' },
      { name: 'Splash & Seduction', path: 'astrowave/events/splash-and-seduction' },
      { name: 'General', path: 'astrowave/events/general' },
    ]
  },
  { 
    name: 'Talent', 
    path: 'astrowave/talent', 
    color: '#A855F7',
    children: [
      { name: 'DJs', path: 'astrowave/talent/djs' },
      { name: 'Artists', path: 'astrowave/talent/artists' },
      { name: 'Profiles', path: 'astrowave/talent/profiles' },
    ]
  },
  { 
    name: 'Brand', 
    path: 'astrowave/brand', 
    color: '#FFD166',
    children: [
      { name: 'Logos', path: 'astrowave/brand/logos' },
      { name: 'Backgrounds', path: 'astrowave/brand/backgrounds' },
      { name: 'Graphics', path: 'astrowave/brand/graphics' },
      { name: 'Avatars', path: 'astrowave/brand/avatars' },
    ]
  },
  { 
    name: 'Videos', 
    path: 'astrowave/videos', 
    color: '#0EA5E9',
    children: [
      { name: 'Hero', path: 'astrowave/videos/hero' },
      { name: 'Events', path: 'astrowave/videos/events' },
      { name: 'Talent', path: 'astrowave/videos/talent' },
    ]
  },
  { 
    name: 'Gallery', 
    path: 'astrowave/gallery', 
    color: '#38BDF8',
    children: [
      { name: 'Past Events', path: 'astrowave/gallery/past-events' },
    ]
  }
];

/**
 * Flat list of paths for dropdowns and validation.
 */
export const ALL_BRAND_PATHS = CLOUDINARY_DIRECTORY.flatMap(parent => [
  parent.path,
  ...(parent.children?.map(child => child.path) || [])
]);

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
