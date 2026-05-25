'use client';

import Link from 'next/link';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { DEFAULT_SETTINGS } from '@/lib/cms/definitions';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'icon' | 'dark';
  height?: number;
  linkTo?: string;
  className?: string;
}

// Global authoritative defaults to prevent display failure
const PRIMARY_LOGO = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';
const PRIMARY_ICON = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png';

/**
 * Robust Logo component for AstroWave.
 * Handles dynamic Firestore values with authoritative hardcoded fallbacks.
 */
export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  let logoSrc = '';
  
  // Resolve source based on variant with tiered fallbacks
  if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || DEFAULT_SETTINGS.logoIconUrl || PRIMARY_ICON;
  } else if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || DEFAULT_SETTINGS.logoDarkUrl || PRIMARY_LOGO;
  } else {
    logoSrc = settings?.logoUrl || DEFAULT_SETTINGS.logoUrl || PRIMARY_LOGO;
  }
  
  // Secondary safety check for empty strings or invalid loads
  if (!logoSrc || logoSrc.trim() === '') {
    logoSrc = variant === 'icon' ? PRIMARY_ICON : PRIMARY_LOGO;
  }

  const content = (
    <div 
      style={{ height: `${height}px`, minWidth: variant === 'icon' ? `${height}px` : '120px' }} 
      className={cn("relative flex items-center select-none flex-shrink-0", className)}
    >
      <img
        src={logoSrc}
        alt="AstroWave"
        style={{ height: '100%', width: 'auto' }}
        className="object-contain block max-w-full h-full"
        loading="eager"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const fallback = variant === 'icon' ? PRIMARY_ICON : PRIMARY_LOGO;
          if (target.src !== fallback) {
            target.src = fallback;
          }
        }}
      />
    </div>
  );

  if (!linkTo) return content;

  return (
    <Link href={linkTo} className="inline-flex items-center flex-shrink-0">
      {content}
    </Link>
  );
}