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
    path: 'Astrowave/Events', 
    color: '#00FF87',
    children: [
      { name: 'Mask Mirage', path: 'Astrowave/Events/mask-mirage' },
      { name: 'Splash & Seduction', path: 'Astrowave/Events/splash-and-seduction' },
      { name: 'General', path: 'Astrowave/Events/general' },
    ]
  },
  { 
    name: 'Talent', 
    path: 'Astrowave/Talent', 
    color: '#A855F7',
    children: [
      { name: 'DJs', path: 'Astrowave/Talent/djs' },
      { name: 'Artists', path: 'Astrowave/Talent/artists' },
      { name: 'Profiles', path: 'Astrowave/Talent/profiles' },
    ]
  },
  { 
    name: 'Brand', 
    path: 'Astrowave/Brand', 
    color: '#FFD166',
    children: [
      { name: 'Logos', path: 'Astrowave/Brand/logos' },
      { name: 'Backgrounds', path: 'Astrowave/Brand/backgrounds' },
      { name: 'Graphics', path: 'Astrowave/Brand/graphics' },
      { name: 'Avatars', path: 'Astrowave/Brand/avatars' },
    ]
  },
  { 
    name: 'Videos', 
    path: 'Astrowave/Videos', 
    color: '#0EA5E9',
    children: [
      { name: 'Hero', path: 'Astrowave/Videos/hero' },
      { name: 'Events', path: 'Astrowave/Videos/events' },
      { name: 'Talent', path: 'Astrowave/Videos/talent' },
    ]
  },
  { 
    name: 'Gallery', 
    path: 'Astrowave/Gallery', 
    color: '#38BDF8',
    children: [
      { name: 'Past Events', path: 'Astrowave/Gallery/past-events' },
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
    path: 'Astrowave/Brand/logos',
    firestore: 'cms_settings/global',
    fields: ['logoUrl', 'logoDarkUrl', 'logoIconUrl', 'faviconUrl'],
    label: 'Brand Logos',
    description: 'Corporate identity and tab icons.'
  },
  backgrounds: {
    path: 'Astrowave/Brand/backgrounds',
    firestore: 'cms_settings/global',
    fields: ['heroPosterUrl', 'heroImageUrl', 'ogImageHome'],
    label: 'Background Media',
    description: 'Hero fallbacks and social share cards.'
  },
  heroVideos: {
    path: 'Astrowave/Videos/hero',
    firestore: 'cms_settings/global',
    fields: ['heroVideoUrl'],
    label: 'Hero Video Streams',
    description: 'Cinematic looping background videos.'
  },
  eventPosters: {
    path: 'Astrowave/Events/general',
    firestore: 'platform_events/{id}',
    fields: ['imageUrl'],
    label: 'Event Content',
    description: 'Public event briefs and marketing posters.'
  },
  talentPhotos: {
    path: 'Astrowave/Talent/profiles',
    firestore: 'talent_profiles/{uid}',
    fields: ['photoURL'],
    label: 'Talent Identity',
    description: 'Professional headshots for the roster.'
  },
  gallery: {
    path: 'Astrowave/Gallery/past-events',
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
